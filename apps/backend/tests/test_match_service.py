import pytest
from unittest.mock import AsyncMock, patch, MagicMock
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
    async def test_get_upcoming_matches_returns_sample_data(self, match_service):
        """Test that get_upcoming_matches returns sample data for MVP"""
        matches = await match_service.get_upcoming_matches()
        
        assert len(matches) == 3
        assert matches[0].id == "2274671"
        assert matches[0].homeTeam == "Huddersfield Town"
        assert matches[0].awayTeam == "Doncaster Rovers"
        assert matches[0].startTime == "2025-08-19T18:45:00Z"


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