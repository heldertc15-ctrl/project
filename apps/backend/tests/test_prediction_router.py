import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import HTTPException

from app.main import app
from app.models.match import Match, PredictionRequest, PredictionResult
from app.services.match_service import MatchService
from app.services.prediction_service import PredictionService
from app.services.web_scraper import WebScraperService


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def sample_matches():
    return [
        Match(
            id="2274671",
            homeTeam="Huddersfield Town",
            awayTeam="Doncaster Rovers",
            startTime="2025-08-19T18:45:00Z"
        ),
        Match(
            id="2274672",
            homeTeam="Luton Town", 
            awayTeam="Wigan Athletic",
            startTime="2025-08-19T18:45:00Z"
        )
    ]


@pytest.fixture
def sample_prediction_result():
    return PredictionResult(
        betSuggestion="Huddersfield Town to win",
        rationale="Home team has strong recent form and advantage.",
        riskLevel="Medium"
    )


@pytest.fixture
def sample_scraped_data():
    return {
        "match_statistics": {"home_goals_scored_last_5": 8},
        "team_news": {"home_injuries": [], "away_injuries": []},
        "betting_odds": {"home_win": 2.1, "draw": 3.2, "away_win": 3.8}
    }


class TestPredictionRouter:
    def test_get_matches_endpoint_success(self, client, sample_matches):
        """Test GET /prediction/matches endpoint returns matches successfully"""
        with patch('app.api.prediction_router.MatchService') as MockMatchService:
            mock_instance = AsyncMock()
            mock_instance.get_upcoming_matches.return_value = sample_matches
            MockMatchService.return_value = mock_instance
            
            response = client.get("/prediction/matches")
            
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["id"] == "2274671"
            assert data[0]["homeTeam"] == "Huddersfield Town"


    def test_get_matches_endpoint_empty_result(self, client):
        """Test GET /prediction/matches endpoint with no matches"""
        with patch('app.api.prediction_router.MatchService') as MockMatchService:
            mock_instance = AsyncMock()
            mock_instance.get_upcoming_matches.return_value = []
            MockMatchService.return_value = mock_instance
            
            response = client.get("/prediction/matches")
            
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 0


    def test_get_matches_endpoint_service_error(self, client):
        """Test GET /prediction/matches endpoint handles service errors"""
        with patch('app.api.prediction_router.MatchService') as MockMatchService:
            mock_instance = AsyncMock()
            mock_instance.get_upcoming_matches.side_effect = Exception("Service error")
            MockMatchService.return_value = mock_instance
            
            response = client.get("/prediction/matches")
            
            assert response.status_code == 500
            assert "Unable to fetch match data" in response.json()["detail"]


    def test_predict_match_endpoint_success(self, client, sample_matches, sample_prediction_result, sample_scraped_data):
        """Test POST /prediction/predict endpoint returns prediction successfully"""
        with patch('app.api.prediction_router.MatchService') as MockMatchService, \
             patch('app.api.prediction_router.PredictionService') as MockPredictionService, \
             patch('app.api.prediction_router.WebScraperService') as MockWebScraperService:
            
            # Mock services
            mock_ms = AsyncMock()
            mock_ms.get_upcoming_matches.return_value = sample_matches
            MockMatchService.return_value = mock_ms
            
            mock_ps = AsyncMock()
            mock_ps.generate_prediction.return_value = sample_prediction_result
            MockPredictionService.return_value = mock_ps
            
            mock_ws = AsyncMock()
            mock_ws.scrape_match_data.return_value = sample_scraped_data
            MockWebScraperService.return_value = mock_ws
            
            # Test request
            request_data = {
                "matchId": "2274671",
                "riskLevel": "Medium"
            }
            
            response = client.post("/prediction/predict", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data["betSuggestion"] == "Huddersfield Town to win"
            assert data["rationale"] == "Home team has strong recent form and advantage."
            assert data["riskLevel"] == "Medium"
            
            # Verify service calls
            mock_ps.generate_prediction.assert_called_once()
            mock_ws.scrape_match_data.assert_called_once()


    @pytest.mark.asyncio
    async def test_predict_match_endpoint_invalid_match_id(self, client, sample_matches):
        """Test POST /prediction/predict endpoint with invalid match ID"""
        with patch('app.api.prediction_router.get_match_service') as mock_match_service:
            mock_ms = AsyncMock(spec=MatchService)
            mock_ms.get_upcoming_matches.return_value = sample_matches
            mock_match_service.return_value = mock_ms
            
            request_data = {
                "matchId": "invalid_id",
                "riskLevel": "Medium"
            }
            
            response = client.post("/prediction/predict", json=request_data)
            
            assert response.status_code == 400
            assert "Match with ID invalid_id not found" in response.json()["detail"]


    @pytest.mark.asyncio
    async def test_predict_match_endpoint_invalid_risk_level(self, client):
        """Test POST /prediction/predict endpoint with invalid risk level"""
        request_data = {
            "matchId": "2274671",
            "riskLevel": "Invalid"
        }
        
        response = client.post("/prediction/predict", json=request_data)
        
        assert response.status_code == 422  # Validation error


    @pytest.mark.asyncio
    async def test_predict_match_endpoint_missing_fields(self, client):
        """Test POST /prediction/predict endpoint with missing required fields"""
        request_data = {
            "matchId": "2274671"
            # Missing riskLevel
        }
        
        response = client.post("/prediction/predict", json=request_data)
        
        assert response.status_code == 422  # Validation error


    @pytest.mark.asyncio
    async def test_predict_match_endpoint_prediction_service_error(self, client, sample_matches, sample_scraped_data):
        """Test POST /prediction/predict endpoint handles prediction service errors"""
        from app.api.prediction_router import get_match_service, get_prediction_service, get_web_scraper_service
        from app.main import app
        
        # Mock services
        mock_ms = AsyncMock(spec=MatchService)
        mock_ms.get_upcoming_matches.return_value = sample_matches
        
        mock_ps = AsyncMock(spec=PredictionService) 
        mock_ps.generate_prediction.side_effect = Exception("Prediction failed")
        
        mock_ws = AsyncMock(spec=WebScraperService)
        mock_ws.scrape_match_data.return_value = sample_scraped_data
        
        # Override dependencies
        app.dependency_overrides[get_match_service] = lambda: mock_ms
        app.dependency_overrides[get_prediction_service] = lambda: mock_ps
        app.dependency_overrides[get_web_scraper_service] = lambda: mock_ws
        
        try:
            request_data = {
                "matchId": "2274671",
                "riskLevel": "Medium"
            }
            
            response = client.post("/prediction/predict", json=request_data)
            
            assert response.status_code == 500
            assert "Unable to generate prediction" in response.json()["detail"]
        finally:
            # Clean up overrides
            app.dependency_overrides.clear()


    @pytest.mark.asyncio 
    async def test_predict_match_endpoint_scraper_error_does_not_fail(self, client, sample_matches, sample_prediction_result):
        """Test POST /prediction/predict endpoint continues even if scraper fails"""
        with patch('app.api.prediction_router.get_match_service') as mock_match_service, \
             patch('app.api.prediction_router.get_prediction_service') as mock_prediction_service, \
             patch('app.api.prediction_router.get_web_scraper_service') as mock_scraper_service:
            
            # Mock services - scraper fails but prediction still works
            mock_ms = AsyncMock(spec=MatchService)
            mock_ms.get_upcoming_matches.return_value = sample_matches
            mock_match_service.return_value = mock_ms
            
            mock_ps = AsyncMock(spec=PredictionService)
            mock_ps.generate_prediction.return_value = sample_prediction_result
            mock_prediction_service.return_value = mock_ps
            
            mock_ws = AsyncMock(spec=WebScraperService)
            mock_ws.scrape_match_data.return_value = {}  # Empty data (scraper failed gracefully)
            mock_scraper_service.return_value = mock_ws
            
            request_data = {
                "matchId": "2274671", 
                "riskLevel": "Medium"
            }
            
            response = client.post("/prediction/predict", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert len(data["betSuggestion"]) > 0
            assert data["riskLevel"] == "Medium"


    @pytest.mark.asyncio
    async def test_predict_match_endpoint_all_risk_levels(self, client, sample_matches, sample_scraped_data):
        """Test POST /prediction/predict endpoint works with all risk levels"""
        risk_levels = ["Low", "Medium", "High"]
        
        for risk_level in risk_levels:
            with patch('app.api.prediction_router.get_match_service') as mock_match_service, \
                 patch('app.api.prediction_router.get_prediction_service') as mock_prediction_service, \
                 patch('app.api.prediction_router.get_web_scraper_service') as mock_scraper_service:
                
                # Mock services
                mock_ms = AsyncMock(spec=MatchService)
                mock_ms.get_upcoming_matches.return_value = sample_matches
                mock_match_service.return_value = mock_ms
                
                mock_ps = AsyncMock(spec=PredictionService)
                mock_ps.generate_prediction.return_value = PredictionResult(
                    betSuggestion=f"Test bet for {risk_level}",
                    rationale=f"Test rationale for {risk_level}",
                    riskLevel=risk_level
                )
                mock_prediction_service.return_value = mock_ps
                
                mock_ws = AsyncMock(spec=WebScraperService)
                mock_ws.scrape_match_data.return_value = sample_scraped_data
                mock_scraper_service.return_value = mock_ws
                
                request_data = {
                    "matchId": "2274671",
                    "riskLevel": risk_level
                }
                
                response = client.post("/prediction/predict", json=request_data)
                
                assert response.status_code == 200
                data = response.json()
                assert data["riskLevel"] == risk_level
                assert len(data["betSuggestion"]) > 0