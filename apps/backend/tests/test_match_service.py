import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import httpx
from app.services.match_service import MatchService


@pytest.fixture
def match_service():
    return MatchService()


@pytest.fixture
def sample_api_response():
    return {
        "events": [
            {
                "idEvent": "123456",
                "strHomeTeam": "Liverpool",
                "strAwayTeam": "Manchester City",
                "dateEvent": "2025-08-20",
                "strTime": "15:00:00",
                "strStatus": "Not Started"
            },
            {
                "idEvent": "123457", 
                "strHomeTeam": "Arsenal",
                "strAwayTeam": "Chelsea",
                "dateEvent": "2025-08-21",
                "strTime": "17:30:00",
                "strStatus": "Not Started"
            }
        ]
    }


class TestMatchService:
    @pytest.mark.asyncio
    @patch('app.services.match_service.httpx.AsyncClient')
    async def test_get_upcoming_matches_with_api_success(self, mock_client, match_service, sample_api_response):
        """Test that get_upcoming_matches fetches from real API without limit"""
        mock_response = MagicMock()
        mock_response.json.return_value = sample_api_response
        mock_response.raise_for_status.return_value = None
        
        mock_context = AsyncMock()
        mock_context.get.return_value = mock_response
        mock_client.return_value.__aenter__.return_value = mock_context
        
        matches = await match_service.get_upcoming_matches()
        
        assert len(matches) == 2  # Should return all matches from API response
        assert matches[0].id == "123456"
        assert matches[0].homeTeam == "Liverpool"
        assert matches[0].awayTeam == "Manchester City"
        assert matches[1].id == "123457"
        assert matches[1].homeTeam == "Arsenal"
        assert matches[1].awayTeam == "Chelsea"


    def test_format_match_with_valid_data(self, match_service):
        """Test _format_match with valid event data"""
        event = {
            "idEvent": "123456",
            "strHomeTeam": "Liverpool", 
            "strAwayTeam": "Manchester City",
            "dateEvent": "2025-08-20",
            "strTime": "15:00:00"
        }
        
        result = match_service._format_match(event)
        
        assert result is not None
        assert result.id == "123456"
        assert result.homeTeam == "Liverpool"
        assert result.awayTeam == "Manchester City"
        assert result.startTime == "2025-08-20T15:00:00+00:00"


    def test_format_match_with_missing_required_fields(self, match_service):
        """Test _format_match with missing required fields"""
        event = {
            "idEvent": "123456",
            "strHomeTeam": "Liverpool",
            # Missing strAwayTeam and dateEvent
        }
        
        result = match_service._format_match(event)
        
        assert result is None


    def test_format_match_with_invalid_date(self, match_service):
        """Test _format_match with invalid date format"""
        event = {
            "idEvent": "123456",
            "strHomeTeam": "Liverpool",
            "strAwayTeam": "Manchester City", 
            "dateEvent": "invalid-date",
            "strTime": "15:00:00"
        }
        
        result = match_service._format_match(event)
        
        assert result is None


    def test_parse_event_datetime_valid(self, match_service):
        """Test _parse_event_datetime with valid input"""
        result = match_service._parse_event_datetime("2025-08-20", "15:30:00")
        
        assert result == "2025-08-20T15:30:00+00:00"


    def test_parse_event_datetime_missing_time(self, match_service):
        """Test _parse_event_datetime with missing time defaults to 15:00:00"""
        result = match_service._parse_event_datetime("2025-08-20", None)
        
        assert result == "2025-08-20T15:00:00+00:00"


    def test_parse_event_datetime_invalid_format(self, match_service):
        """Test _parse_event_datetime with invalid format"""
        result = match_service._parse_event_datetime("invalid", "invalid")
        
        assert result is None

    @pytest.mark.asyncio
    @patch('app.services.match_service.httpx.AsyncClient')
    async def test_get_upcoming_matches_api_timeout(self, mock_client, match_service):
        """Test that API timeout is handled gracefully"""
        mock_context = AsyncMock()
        mock_context.get.side_effect = httpx.TimeoutException("Timeout")
        mock_client.return_value.__aenter__.return_value = mock_context
        
        with pytest.raises(Exception) as exc_info:
            await match_service.get_upcoming_matches()
        
        assert "Sports API timeout" in str(exc_info.value)

    @pytest.mark.asyncio
    @patch('app.services.match_service.httpx.AsyncClient')
    async def test_get_upcoming_matches_api_rate_limit(self, mock_client, match_service):
        """Test that API rate limit is handled gracefully"""
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError("Rate limit", request=MagicMock(), response=mock_response)
        
        mock_context = AsyncMock()
        mock_context.get.return_value = mock_response
        mock_client.return_value.__aenter__.return_value = mock_context
        
        with pytest.raises(Exception) as exc_info:
            await match_service.get_upcoming_matches()
        
        assert "rate limit exceeded" in str(exc_info.value)

    @pytest.mark.asyncio
    @patch('app.services.match_service.httpx.AsyncClient')
    async def test_get_upcoming_matches_empty_response(self, mock_client, match_service):
        """Test that empty API response is handled gracefully"""
        mock_response = MagicMock()
        mock_response.json.return_value = {"events": None}
        mock_response.raise_for_status.return_value = None
        
        mock_context = AsyncMock()
        mock_context.get.return_value = mock_response
        mock_client.return_value.__aenter__.return_value = mock_context
        
        matches = await match_service.get_upcoming_matches()
        
        assert matches == []

    @pytest.mark.asyncio
    @patch('app.services.match_service.httpx.AsyncClient')
    async def test_get_upcoming_matches_large_dataset(self, mock_client, match_service):
        """Test that large datasets are handled without limits"""
        # Create a large dataset (50 matches)
        large_response = {
            "events": [
                {
                    "idEvent": f"12345{i}",
                    "strHomeTeam": f"Team A{i}",
                    "strAwayTeam": f"Team B{i}",
                    "dateEvent": "2025-08-20",
                    "strTime": "15:00:00"
                }
                for i in range(50)
            ]
        }
        
        mock_response = MagicMock()
        mock_response.json.return_value = large_response
        mock_response.raise_for_status.return_value = None
        
        mock_context = AsyncMock()
        mock_context.get.return_value = mock_response
        mock_client.return_value.__aenter__.return_value = mock_context
        
        matches = await match_service.get_upcoming_matches()
        
        # Should return all 50 matches, not limited to 10
        assert len(matches) == 50
        assert matches[0].id == "123450"
        assert matches[49].id == "1234549"