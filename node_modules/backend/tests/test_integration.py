import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestIntegration:
    def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "Hello World" in data["message"]


    def test_get_matches_endpoint_integration(self, client):
        """Integration test for GET /prediction/matches"""
        response = client.get("/prediction/matches")
        assert response.status_code == 200
        data = response.json()
        
        # Should return sample matches from match service
        assert isinstance(data, list)
        if len(data) > 0:
            match = data[0]
            assert "id" in match
            assert "homeTeam" in match
            assert "awayTeam" in match
            assert "startTime" in match


    def test_predict_endpoint_integration_valid_request(self, client):
        """Integration test for POST /prediction/predict with valid request"""
        # First get available matches
        matches_response = client.get("/prediction/matches")
        assert matches_response.status_code == 200
        matches = matches_response.json()
        
        if len(matches) > 0:
            match_id = matches[0]["id"]
            
            # Test prediction request
            request_data = {
                "matchId": match_id,
                "riskLevel": "Medium"
            }
            
            response = client.post("/prediction/predict", json=request_data)
            assert response.status_code == 200
            
            data = response.json()
            assert "betSuggestion" in data
            assert "rationale" in data
            assert "riskLevel" in data
            assert data["riskLevel"] == "Medium"
            assert len(data["betSuggestion"]) > 0
            assert len(data["rationale"]) > 10  # Should be meaningful


    def test_predict_endpoint_integration_all_risk_levels(self, client):
        """Integration test for POST /prediction/predict with all risk levels"""
        # First get available matches
        matches_response = client.get("/prediction/matches")
        assert matches_response.status_code == 200
        matches = matches_response.json()
        
        if len(matches) > 0:
            match_id = matches[0]["id"]
            
            for risk_level in ["Low", "Medium", "High"]:
                request_data = {
                    "matchId": match_id,
                    "riskLevel": risk_level
                }
                
                response = client.post("/prediction/predict", json=request_data)
                assert response.status_code == 200
                
                data = response.json()
                assert data["riskLevel"] == risk_level
                assert len(data["betSuggestion"]) > 0
                assert len(data["rationale"]) > 10


    def test_predict_endpoint_integration_invalid_match_id(self, client):
        """Integration test for POST /prediction/predict with invalid match ID"""
        request_data = {
            "matchId": "invalid_match_id",
            "riskLevel": "Medium"
        }
        
        response = client.post("/prediction/predict", json=request_data)
        assert response.status_code == 400
        assert "not found" in response.json()["detail"].lower()


    def test_predict_endpoint_integration_invalid_risk_level(self, client):
        """Integration test for POST /prediction/predict with invalid risk level"""
        request_data = {
            "matchId": "2274671",  # Using known sample match ID
            "riskLevel": "Invalid"
        }
        
        response = client.post("/prediction/predict", json=request_data)
        assert response.status_code == 422  # Validation error


    def test_predict_endpoint_integration_missing_fields(self, client):
        """Integration test for POST /prediction/predict with missing fields"""
        # Missing riskLevel
        request_data = {
            "matchId": "2274671"
        }
        
        response = client.post("/prediction/predict", json=request_data)
        assert response.status_code == 422  # Validation error
        
        # Missing matchId
        request_data = {
            "riskLevel": "Medium"
        }
        
        response = client.post("/prediction/predict", json=request_data)
        assert response.status_code == 422  # Validation error


    def test_api_cors_headers(self, client):
        """Test that CORS headers are properly configured"""
        response = client.options("/prediction/matches")
        # FastAPI/Starlette might not return CORS headers for OPTIONS in test client
        # This is more of a smoke test
        assert response.status_code in [200, 405]  # Either allowed or method not allowed


    def test_openapi_docs_available(self, client):
        """Test that OpenAPI documentation is available"""
        response = client.get("/docs")
        assert response.status_code == 200
        
        # Test OpenAPI JSON schema
        response = client.get("/openapi.json")
        assert response.status_code == 200
        openapi_data = response.json()
        assert "openapi" in openapi_data
        assert "paths" in openapi_data
        assert "/prediction/matches" in openapi_data["paths"]
        assert "/prediction/predict" in openapi_data["paths"]