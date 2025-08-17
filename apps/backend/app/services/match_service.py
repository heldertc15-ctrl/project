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
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                url = f"{self.base_url}/eventsnextleague.php?id={self.premier_league_id}"
                
                response = await client.get(url)
                response.raise_for_status()
                
                data = response.json()
                
                if not data or "events" not in data or not data["events"]:
                    logger.warning("No upcoming matches found in API response")
                    return []
                
                matches = []
                for event in data["events"]:  # Fetch all matches - removed [:10] limit
                    try:
                        match = self._format_match(event)
                        if match:
                            matches.append(match)
                    except Exception as e:
                        logger.warning(f"Failed to format match: {e}")
                        continue
                
                logger.info(f"Successfully fetched {len(matches)} upcoming matches")
                return matches
                
        except httpx.TimeoutException:
            logger.error("Timeout when fetching matches from TheSportsDB")
            raise Exception("Sports API timeout - please try again later")
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error from TheSportsDB: {e.response.status_code}")
            if e.response.status_code == 429:
                raise Exception("Sports API rate limit exceeded - please try again later")
            raise Exception("Sports API is currently unavailable")
        except Exception as e:
            logger.error(f"Unexpected error fetching matches: {e}")
            raise Exception("Unable to fetch matches - please try again later")
    
    def _format_match(self, event: Dict[str, Any]) -> Match | None:
        """
        Format a TheSportsDB event into our Match interface format.
        Validates all required fields and data types for type safety.
        """
        try:
            # Extract required fields with type validation
            event_id = event.get("idEvent")
            home_team = event.get("strHomeTeam")
            away_team = event.get("strAwayTeam")
            date_utc = event.get("dateEvent")  # Use dateEvent instead of dateEventLocal
            time_utc = event.get("strTime")     # Use strTime instead of strTimeLocal
            
            # Validate required fields exist and are strings
            if not all([event_id, home_team, away_team, date_utc]):
                logger.warning(f"Missing required fields in event {event_id}: id={event_id}, home={home_team}, away={away_team}, date={date_utc}")
                return None
                
            # Validate data types for type safety
            if not all(isinstance(field, str) for field in [str(event_id), home_team, away_team, date_utc]):
                logger.warning(f"Invalid data types in event {event_id}: fields must be strings")
                return None
            
            # Parse and format the datetime
            start_time = self._parse_event_datetime(date_utc, time_utc)
            if not start_time:
                logger.warning(f"Failed to parse datetime for event {event_id}")
                return None
            
            # Sanitize team names to prevent any potential issues
            clean_home_team = home_team.strip() if home_team else ""
            clean_away_team = away_team.strip() if away_team else ""
            
            if not clean_home_team or not clean_away_team:
                logger.warning(f"Empty team names after sanitization for event {event_id}")
                return None
            
            return Match(
                id=str(event_id),
                homeTeam=clean_home_team,
                awayTeam=clean_away_team,
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