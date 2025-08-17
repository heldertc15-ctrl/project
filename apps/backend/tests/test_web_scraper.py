import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import httpx

from app.services.web_scraper import WebScraperService
from app.models.match import Match


@pytest.fixture
def web_scraper():
    return WebScraperService()


@pytest.fixture
def sample_match():
    return Match(
        id="2274671",
        homeTeam="Liverpool",
        awayTeam="Manchester City", 
        startTime="2025-08-19T18:45:00Z"
    )


class TestWebScraperService:
    @pytest.mark.asyncio
    async def test_scrape_match_data_success(self, web_scraper, sample_match):
        """Test scrape_match_data returns simulated data successfully"""
        result = await web_scraper.scrape_match_data(sample_match)
        
        assert isinstance(result, dict)
        assert "match_statistics" in result
        assert "team_news" in result
        assert "head_to_head" in result
        assert "betting_odds" in result
        assert "weather_conditions" in result
        assert "expert_predictions" in result
        assert "stadium_info" in result
        
        # Check match statistics structure
        match_stats = result["match_statistics"]
        assert "home_recent_form" in match_stats
        assert "away_recent_form" in match_stats
        assert "home_goals_scored_last_5" in match_stats
        assert "away_goals_scored_last_5" in match_stats
        
        assert isinstance(match_stats["home_recent_form"], list)
        assert isinstance(match_stats["away_recent_form"], list)
        assert isinstance(match_stats["home_goals_scored_last_5"], int)
        assert isinstance(match_stats["away_goals_scored_last_5"], int)


    @pytest.mark.asyncio
    async def test_scrape_match_data_structure(self, web_scraper, sample_match):
        """Test scrape_match_data returns properly structured data"""
        result = await web_scraper.scrape_match_data(sample_match)
        
        # Test team news structure
        team_news = result["team_news"]
        assert "home_injuries" in team_news
        assert "away_injuries" in team_news
        assert "home_suspensions" in team_news
        assert "away_suspensions" in team_news
        assert isinstance(team_news["home_injuries"], list)
        assert isinstance(team_news["away_injuries"], list)
        
        # Test head to head structure
        h2h = result["head_to_head"]
        assert "last_5_h2h" in h2h
        assert "home_wins" in h2h
        assert "away_wins" in h2h
        assert "draws" in h2h
        assert isinstance(h2h["last_5_h2h"], list)
        assert isinstance(h2h["home_wins"], int)
        
        # Test betting odds structure
        odds = result["betting_odds"]
        assert "home_win" in odds
        assert "draw" in odds
        assert "away_win" in odds
        assert isinstance(odds["home_win"], float)
        assert isinstance(odds["draw"], float)


    @pytest.mark.asyncio
    async def test_scrape_match_data_error_handling(self, web_scraper, sample_match):
        """Test scrape_match_data handles errors gracefully"""
        # Mock _simulate_scraped_data to raise an exception
        with patch.object(web_scraper, '_simulate_scraped_data', side_effect=Exception("Scraping failed")):
            result = await web_scraper.scrape_match_data(sample_match)
            
            # Should return fallback data
            assert isinstance(result, dict)
            assert result == web_scraper._get_fallback_data()


    @pytest.mark.asyncio
    async def test_simulate_scraped_data(self, web_scraper, sample_match):
        """Test _simulate_scraped_data generates realistic data"""
        result = await web_scraper._simulate_scraped_data(sample_match)
        
        # Test that form data contains expected structure
        home_form = result["match_statistics"]["home_recent_form"]
        assert len(home_form) == 5
        for game in home_form:
            assert "opponent" in game
            assert "result" in game
            assert "score" in game
            assert game["result"] in ["W", "D", "L"]
        
        # Test injury data structure
        home_injuries = result["team_news"]["home_injuries"]
        assert isinstance(home_injuries, list)
        for injury in home_injuries:
            if injury:  # May be empty list
                assert "player" in injury
                assert "status" in injury
                assert "injury" in injury


    def test_generate_injury_list(self, web_scraper):
        """Test _generate_injury_list creates valid injury data"""
        injuries = web_scraper._generate_injury_list("Liverpool")
        
        assert isinstance(injuries, list)
        assert len(injuries) <= 2  # Should return 0-2 injuries
        
        for injury in injuries:
            assert "player" in injury
            assert "status" in injury
            assert "injury" in injury
            assert injury["status"] in ["doubtful", "out", "fit"]


    @pytest.mark.asyncio
    async def test_scrape_team_statistics(self, web_scraper):
        """Test scrape_team_statistics returns valid team data"""
        result = await web_scraper.scrape_team_statistics("Liverpool")
        
        assert isinstance(result, dict)
        required_fields = [
            "league_position", "points", "games_played", "wins", "draws", "losses",
            "goals_for", "goals_against", "goal_difference", "clean_sheets",
            "avg_possession", "shots_per_game", "shots_on_target_percentage", "pass_accuracy"
        ]
        
        for field in required_fields:
            assert field in result
        
        # Test data types and ranges
        assert isinstance(result["league_position"], int)
        assert 1 <= result["league_position"] <= 20
        assert isinstance(result["points"], int)
        assert result["points"] >= 0
        assert isinstance(result["pass_accuracy"], float)
        assert 0.0 <= result["pass_accuracy"] <= 100.0


    @pytest.mark.asyncio
    async def test_scrape_team_statistics_error_handling(self, web_scraper):
        """Test scrape_team_statistics handles errors gracefully"""
        # Mock to simulate an error
        with patch('asyncio.sleep', side_effect=Exception("Network error")):
            result = await web_scraper.scrape_team_statistics("Liverpool")
            
            assert result == {}  # Should return empty dict on error


    @pytest.mark.asyncio
    async def test_scrape_betting_odds(self, web_scraper, sample_match):
        """Test scrape_betting_odds returns valid odds data"""
        result = await web_scraper.scrape_betting_odds(sample_match)
        
        assert isinstance(result, dict)
        required_odds = ["home_win", "draw", "away_win", "over_2_5", "under_2_5", "btts_yes", "btts_no"]
        
        for odd_type in required_odds:
            assert odd_type in result
            assert isinstance(result[odd_type], float)
            assert 1.0 <= result[odd_type] <= 10.0  # Reasonable odds range


    @pytest.mark.asyncio
    async def test_scrape_betting_odds_error_handling(self, web_scraper, sample_match):
        """Test scrape_betting_odds handles errors gracefully"""
        with patch('asyncio.sleep', side_effect=Exception("Odds service error")):
            result = await web_scraper.scrape_betting_odds(sample_match)
            
            assert result == {}  # Should return empty dict on error


    def test_get_fallback_data(self, web_scraper):
        """Test _get_fallback_data returns proper structure"""
        fallback = web_scraper._get_fallback_data()
        
        assert isinstance(fallback, dict)
        required_keys = [
            "match_statistics", "team_news", "head_to_head", "betting_odds",
            "weather_conditions", "expert_predictions", "stadium_info", "scraping_status"
        ]
        
        for key in required_keys:
            assert key in fallback
        
        assert fallback["scraping_status"] == "failed"


    @pytest.mark.asyncio
    async def test_make_request_success(self, web_scraper):
        """Test _make_request handles successful HTTP requests"""
        mock_response = MagicMock()
        mock_response.text = "<html>Test content</html>"
        mock_response.raise_for_status.return_value = None
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
            
            result = await web_scraper._make_request("http://test.com")
            
            assert result == "<html>Test content</html>"


    @pytest.mark.asyncio
    async def test_make_request_timeout_with_retries(self, web_scraper):
        """Test _make_request handles timeout with retries"""
        with patch('httpx.AsyncClient') as mock_client, \
             patch('asyncio.sleep') as mock_sleep:
            
            mock_client.return_value.__aenter__.return_value.get.side_effect = httpx.TimeoutException("Timeout")
            
            result = await web_scraper._make_request("http://test.com")
            
            assert result is None
            # Should have tried max_retries + 1 times (original + retries)
            assert mock_client.return_value.__aenter__.return_value.get.call_count == web_scraper.max_retries + 1


    @pytest.mark.asyncio
    async def test_make_request_rate_limit_handling(self, web_scraper):
        """Test _make_request handles rate limiting"""
        mock_response = MagicMock()
        mock_response.status_code = 429
        
        with patch('httpx.AsyncClient') as mock_client, \
             patch('asyncio.sleep') as mock_sleep:
            
            mock_client.return_value.__aenter__.return_value.get.side_effect = httpx.HTTPStatusError(
                "Rate limited", request=MagicMock(), response=mock_response
            )
            
            result = await web_scraper._make_request("http://test.com")
            
            assert result is None
            # Should have slept for rate limit backoff
            assert mock_sleep.called


    @pytest.mark.asyncio 
    async def test_make_request_http_error(self, web_scraper):
        """Test _make_request handles HTTP errors"""
        mock_response = MagicMock()
        mock_response.status_code = 404
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.side_effect = httpx.HTTPStatusError(
                "Not found", request=MagicMock(), response=mock_response
            )
            
            result = await web_scraper._make_request("http://test.com")
            
            assert result is None


    @pytest.mark.asyncio
    async def test_make_request_unexpected_error(self, web_scraper):
        """Test _make_request handles unexpected errors"""
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.side_effect = Exception("Unexpected error")
            
            result = await web_scraper._make_request("http://test.com")
            
            assert result is None


    def test_initialization(self, web_scraper):
        """Test WebScraperService initializes with correct settings"""
        assert web_scraper.request_timeout == 10.0
        assert web_scraper.rate_limit_delay == 1.0
        assert web_scraper.max_retries == 3
        assert isinstance(web_scraper.headers, dict)
        assert "User-Agent" in web_scraper.headers


    @pytest.mark.asyncio
    async def test_rate_limiting_between_requests(self, web_scraper):
        """Test that rate limiting delay is applied between requests"""
        with patch('asyncio.sleep') as mock_sleep, \
             patch('httpx.AsyncClient') as mock_client:
            
            mock_response = MagicMock()
            mock_response.text = "response"
            mock_response.raise_for_status.return_value = None
            mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
            
            await web_scraper._make_request("http://test.com")
            
            # Should have called sleep with rate_limit_delay
            mock_sleep.assert_called_with(web_scraper.rate_limit_delay)