import httpx
import logging
from typing import List, Dict, Any
from datetime import datetime, timezone

from ..models.match import Match

logger = logging.getLogger(__name__)


class MatchService:
    def __init__(self):
        self.base_url = "https://www.thesportsdb.com/api/v1/json/3"
        self.premier_league_id = "4328"  # Premier League ID for TheSportsDB
        
    async def get_upcoming_matches(self) -> List[Match]:
        """
        Fetch upcoming soccer matches from TheSportsDB API.
        Returns a list of matches formatted according to our Match interface.
        """
        # For MVP testing, return sample data first to verify frontend
        # TODO: Re-enable real API integration after frontend validation
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
            ),
            Match(
                id="2274673",
                homeTeam="Mansfield Town", 
                awayTeam="Blackpool",
                startTime="2025-08-19T18:45:00Z"
            )
        ]
        
        # TODO: Re-enable real API after frontend is working
        # try:
        #     async with httpx.AsyncClient(timeout=30.0) as client:
        #         url = f"{self.base_url}/eventsnextleague.php?id={self.premier_league_id}"
        #         
        #         response = await client.get(url)
        #         response.raise_for_status()
        #         
        #         data = response.json()
        #         
        #         if not data or "events" not in data or not data["events"]:
        #             logger.warning("No upcoming matches found in API response")
        #             return []
        #         
        #         matches = []
        #         for event in data["events"][:10]:  # Limit to 10 matches for MVP
        #             try:
        #                 match = self._format_match(event)
        #                 if match:
        #                     matches.append(match)
        #             except Exception as e:
        #                 logger.warning(f"Failed to format match: {e}")
        #                 continue
        #         
        #         logger.info(f"Successfully fetched {len(matches)} upcoming matches")
        #         return matches
        #         
        # except httpx.TimeoutException:
        #     logger.error("Timeout when fetching matches from TheSportsDB")
        #     raise Exception("Sports API timeout - please try again later")
        # except httpx.HTTPStatusError as e:
        #     logger.error(f"HTTP error from TheSportsDB: {e.response.status_code}")
        #     if e.response.status_code == 429:
        #         raise Exception("Sports API rate limit exceeded - please try again later")
        #     raise Exception("Sports API is currently unavailable")
        # except Exception as e:
        #     logger.error(f"Unexpected error fetching matches: {e}")
        #     raise Exception("Unable to fetch matches - please try again later")
    
    def _format_match(self, event: Dict[str, Any]) -> Match | None:
        """
        Format a TheSportsDB event into our Match interface format.
        """
        try:
            # Extract required fields
            event_id = event.get("idEvent")
            home_team = event.get("strHomeTeam")
            away_team = event.get("strAwayTeam")
            date_utc = event.get("dateEvent")  # Use dateEvent instead of dateEventLocal
            time_utc = event.get("strTime")     # Use strTime instead of strTimeLocal
            
            if not all([event_id, home_team, away_team, date_utc]):
                logger.warning(f"Missing required fields in event {event_id}: id={event_id}, home={home_team}, away={away_team}, date={date_utc}")
                return None
            
            # Parse and format the datetime
            start_time = self._parse_event_datetime(date_utc, time_utc)
            if not start_time:
                return None
            
            return Match(
                id=str(event_id),
                homeTeam=home_team,
                awayTeam=away_team,
                startTime=start_time
            )
            
        except Exception as e:
            logger.warning(f"Failed to format event {event.get('idEvent', 'unknown')}: {e}")
            return None
    
    def _parse_event_datetime(self, date_str: str, time_str: str) -> str | None:
        """
        Parse TheSportsDB date and time into ISO 8601 format.
        """
        try:
            # TheSportsDB format: "2024-01-15" and "15:30:00" (or None for time)
            if not time_str:
                time_str = "15:00:00"  # Default time if not provided
            
            datetime_str = f"{date_str} {time_str}"
            dt = datetime.strptime(datetime_str, "%Y-%m-%d %H:%M:%S")
            
            # Assume UTC for consistency
            dt = dt.replace(tzinfo=timezone.utc)
            
            return dt.isoformat()
            
        except Exception as e:
            logger.warning(f"Failed to parse datetime '{date_str} {time_str}': {e}")
            return None