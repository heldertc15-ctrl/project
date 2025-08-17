import pytest
from unittest.mock import patch, MagicMock
import random

from app.services.prediction_service import PredictionService
from app.models.match import Match, PredictionResult


@pytest.fixture
def prediction_service():
    return PredictionService()


@pytest.fixture
def sample_match():
    return Match(
        id="2274671",
        homeTeam="Liverpool",
        awayTeam="Manchester City",
        startTime="2025-08-19T18:45:00Z"
    )


@pytest.fixture
def sample_scraped_data():
    return {
        "match_statistics": {
            "home_recent_form": [
                {"opponent": "Team A", "result": "W", "score": "2-1"},
                {"opponent": "Team B", "result": "D", "score": "1-1"}
            ],
            "away_recent_form": [
                {"opponent": "Team C", "result": "W", "score": "1-0"},
                {"opponent": "Team D", "result": "L", "score": "1-2"}
            ],
            "home_goals_scored_last_5": 8,
            "away_goals_scored_last_5": 6
        },
        "team_news": {
            "home_injuries": [],
            "away_injuries": [{"player": "Key Striker", "status": "out", "injury": "hamstring"}]
        },
        "betting_odds": {
            "home_win": 2.1,
            "draw": 3.2,
            "away_win": 3.8
        }
    }


class TestPredictionService:
    @pytest.mark.asyncio
    async def test_generate_prediction_low_risk(self, prediction_service, sample_match):
        """Test generate_prediction with Low risk level"""
        result = await prediction_service.generate_prediction(sample_match, "Low")
        
        assert isinstance(result, PredictionResult)
        assert result.riskLevel == "Low"
        assert result.betSuggestion
        assert result.rationale
        assert len(result.rationale) > 10  # Should be a meaningful sentence


    @pytest.mark.asyncio
    async def test_generate_prediction_medium_risk(self, prediction_service, sample_match):
        """Test generate_prediction with Medium risk level"""
        result = await prediction_service.generate_prediction(sample_match, "Medium")
        
        assert isinstance(result, PredictionResult)
        assert result.riskLevel == "Medium"
        assert result.betSuggestion
        assert result.rationale


    @pytest.mark.asyncio
    async def test_generate_prediction_high_risk(self, prediction_service, sample_match):
        """Test generate_prediction with High risk level"""
        result = await prediction_service.generate_prediction(sample_match, "High")
        
        assert isinstance(result, PredictionResult)
        assert result.riskLevel == "High"
        assert result.betSuggestion
        assert result.rationale


    @pytest.mark.asyncio
    async def test_generate_prediction_with_scraped_data(self, prediction_service, sample_match, sample_scraped_data):
        """Test generate_prediction incorporates scraped data"""
        result = await prediction_service.generate_prediction(
            sample_match, 
            "Medium", 
            sample_scraped_data
        )
        
        assert isinstance(result, PredictionResult)
        assert result.riskLevel == "Medium"
        assert result.betSuggestion
        assert result.rationale


    @pytest.mark.asyncio
    async def test_generate_prediction_without_scraped_data(self, prediction_service, sample_match):
        """Test generate_prediction works without scraped data"""
        result = await prediction_service.generate_prediction(sample_match, "Medium", None)
        
        assert isinstance(result, PredictionResult)
        assert result.riskLevel == "Medium"
        assert result.betSuggestion
        assert result.rationale


    @pytest.mark.asyncio
    async def test_analyze_match_data_without_scraped_data(self, prediction_service, sample_match):
        """Test _analyze_match_data without scraped data"""
        analysis = await prediction_service._analyze_match_data(sample_match)
        
        assert "home_advantage" in analysis
        assert "team_strength_differential" in analysis
        assert "historical_h2h" in analysis
        assert "recent_form" in analysis
        assert "match_context" in analysis
        
        # Check data types
        assert isinstance(analysis["home_advantage"], float)
        assert isinstance(analysis["team_strength_differential"], float)
        assert isinstance(analysis["historical_h2h"], dict)
        assert isinstance(analysis["recent_form"], dict)
        assert isinstance(analysis["match_context"], dict)


    @pytest.mark.asyncio
    async def test_analyze_match_data_with_scraped_data(self, prediction_service, sample_match, sample_scraped_data):
        """Test _analyze_match_data with scraped data"""
        analysis = await prediction_service._analyze_match_data(sample_match, sample_scraped_data)
        
        assert "external_insights" in analysis
        assert isinstance(analysis["external_insights"], dict)


    def test_generate_bet_suggestion_low_risk(self, prediction_service, sample_match):
        """Test _generate_bet_suggestion for Low risk"""
        analysis = {
            "home_advantage": 0.2,
            "team_strength_differential": 0.0
        }
        
        suggestion = prediction_service._generate_bet_suggestion(sample_match, "Low", analysis)
        
        assert suggestion
        assert isinstance(suggestion, str)
        # Low risk should prefer conservative bets
        low_risk_terms = ["draw", "under", "double chance", "no"]
        assert any(term.lower() in suggestion.lower() for term in low_risk_terms)


    def test_generate_bet_suggestion_medium_risk(self, prediction_service, sample_match):
        """Test _generate_bet_suggestion for Medium risk"""
        analysis = {
            "home_advantage": 0.2,
            "team_strength_differential": 0.3
        }
        
        suggestion = prediction_service._generate_bet_suggestion(sample_match, "Medium", analysis)
        
        assert suggestion
        assert isinstance(suggestion, str)


    def test_generate_bet_suggestion_high_risk(self, prediction_service, sample_match):
        """Test _generate_bet_suggestion for High risk"""
        analysis = {
            "home_advantage": 0.2,
            "team_strength_differential": 0.5
        }
        
        suggestion = prediction_service._generate_bet_suggestion(sample_match, "High", analysis)
        
        assert suggestion
        assert isinstance(suggestion, str)
        # High risk should prefer aggressive bets
        high_risk_terms = ["3.5 goals", "3-1", "2-1", "over", "and", "scorer"]
        assert any(term.lower() in suggestion.lower() for term in high_risk_terms)


    def test_generate_rationale_contains_meaningful_content(self, prediction_service, sample_match):
        """Test _generate_rationale produces meaningful content"""
        analysis = {
            "home_advantage": 0.25,
            "team_strength_differential": 0.3
        }
        
        for risk_level in ["Low", "Medium", "High"]:
            rationale = prediction_service._generate_rationale(
                sample_match, 
                risk_level, 
                analysis, 
                "Test bet"
            )
            
            assert rationale
            assert isinstance(rationale, str)
            assert len(rationale) > 20  # Should be a substantial sentence
            assert rationale.endswith(".")  # Should be a complete sentence


    def test_calculate_home_advantage(self, prediction_service):
        """Test _calculate_home_advantage returns valid range"""
        advantage = prediction_service._calculate_home_advantage("Liverpool")
        
        assert isinstance(advantage, float)
        assert 0.0 <= advantage <= 1.0  # Should be within reasonable range


    def test_analyze_team_strength(self, prediction_service):
        """Test _analyze_team_strength returns valid range"""
        strength_diff = prediction_service._analyze_team_strength("Liverpool", "Manchester City")
        
        assert isinstance(strength_diff, float)
        assert -2.0 <= strength_diff <= 2.0  # Should be within reasonable range


    def test_analyze_head_to_head(self, prediction_service):
        """Test _analyze_head_to_head returns valid structure"""
        h2h = prediction_service._analyze_head_to_head("Liverpool", "Manchester City")
        
        assert isinstance(h2h, dict)
        assert "home_wins" in h2h
        assert "away_wins" in h2h
        assert "draws" in h2h
        assert "avg_goals" in h2h
        
        assert isinstance(h2h["home_wins"], int)
        assert isinstance(h2h["away_wins"], int)
        assert isinstance(h2h["draws"], int)
        assert isinstance(h2h["avg_goals"], float)


    def test_analyze_recent_form(self, prediction_service):
        """Test _analyze_recent_form returns valid structure"""
        form = prediction_service._analyze_recent_form("Liverpool", "Manchester City")
        
        assert isinstance(form, dict)
        assert "home_form" in form
        assert "away_form" in form
        assert "home_goals_per_game" in form
        assert "away_goals_per_game" in form
        
        for key in form:
            assert isinstance(form[key], float)
            assert 0.0 <= form[key] <= 10.0  # Reasonable ranges


    def test_analyze_match_context(self, prediction_service, sample_match):
        """Test _analyze_match_context returns valid structure"""
        context = prediction_service._analyze_match_context(sample_match)
        
        assert isinstance(context, dict)
        assert "is_weekend" in context
        assert "is_evening" in context
        assert "importance" in context
        
        assert isinstance(context["is_weekend"], bool)
        assert isinstance(context["is_evening"], bool)
        assert context["importance"] in ["low", "medium", "high"]


    def test_process_scraped_insights(self, prediction_service, sample_scraped_data):
        """Test _process_scraped_insights processes data correctly"""
        insights = prediction_service._process_scraped_insights(sample_scraped_data)
        
        assert isinstance(insights, dict)
        assert "injury_reports" in insights
        assert "weather_conditions" in insights
        assert "betting_odds" in insights
        assert "expert_predictions" in insights


    def test_apply_analysis_to_selection(self, prediction_service):
        """Test _apply_analysis_to_selection returns valid choice"""
        suggestions = ["Draw", "Liverpool to win", "Over 2.5 goals"]
        analysis = {
            "home_advantage": 0.2,
            "team_strength_differential": 0.3
        }
        risk_config = {"multiplier": 1.0, "variance": 0.3}
        
        selected = prediction_service._apply_analysis_to_selection(suggestions, analysis, risk_config)
        
        assert selected in suggestions


    @pytest.mark.asyncio
    async def test_generate_prediction_error_handling(self, prediction_service, sample_match):
        """Test generate_prediction handles internal errors gracefully"""
        # Mock an internal method to raise an exception
        with patch.object(prediction_service, '_analyze_match_data', side_effect=Exception("Test error")):
            with pytest.raises(Exception) as exc_info:
                await prediction_service.generate_prediction(sample_match, "Medium")
            
            assert "Prediction generation failed" in str(exc_info.value)


    def test_risk_level_mappings(self, prediction_service):
        """Test risk level mappings are properly configured"""
        assert "Low" in prediction_service.risk_level_mappings
        assert "Medium" in prediction_service.risk_level_mappings  
        assert "High" in prediction_service.risk_level_mappings
        
        for level in prediction_service.risk_level_mappings:
            config = prediction_service.risk_level_mappings[level]
            assert "multiplier" in config
            assert "variance" in config
            assert isinstance(config["multiplier"], (int, float))
            assert isinstance(config["variance"], (int, float))