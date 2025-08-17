import httpx
import logging
import asyncio
import random
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from ..models.match import Match

logger = logging.getLogger(__name__)

# Configuration constants
SCRAPER_CONFIG = {
    "REQUEST_TIMEOUT": 10.0,
    "RATE_LIMIT_DELAY": 1.0,
    "MAX_RETRIES": 3,
    "SIMULATION_DELAY_RANGE": (0.5, 2.0),
    "TEAM_STATS_DELAY_RANGE": (0.3, 1.0),
    "BETTING_ODDS_DELAY_RANGE": (0.5, 1.5),
    "MAX_INJURIES_PER_TEAM": 2,
    "EXPONENTIAL_BACKOFF_BASE": 2,
    "RATE_LIMIT_WAIT_MULTIPLIER": 5
}


class WebScraperService:
    """
    Web scraping service for gathering additional match data and insights.
    
    This service collects data from various sports websites to enhance
    AI prediction accuracy with external information.
    """
    
    def __init__(self):
        self.request_timeout = SCRAPER_CONFIG["REQUEST_TIMEOUT"]
        self.rate_limit_delay = SCRAPER_CONFIG["RATE_LIMIT_DELAY"]
        self.max_retries = SCRAPER_CONFIG["MAX_RETRIES"]
        
        # Headers to appear as a normal browser
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        }
    
    async def scrape_match_data(self, match: Match) -> Dict[str, Any]:
        """
        Scrape comprehensive match data from multiple sources.
        
        Args:
            match: Match object with team and timing information
            
        Returns:
            Dictionary containing scraped insights and statistics
        """
        try:
            logger.info(f"Starting web scraping for {match.homeTeam} vs {match.awayTeam}")
            
            # For MVP, return simulated scraping data
            # TODO: Implement actual web scraping after MVP validation
            scraped_data = await self._simulate_scraped_data(match)
            
            logger.info(f"Successfully scraped data for match {match.id}")
            return scraped_data
            
        except Exception as e:
            logger.error(f"Error scraping match data: {e}")
            return self._get_fallback_data()
    
    async def _simulate_scraped_data(self, match: Match) -> Dict[str, Any]:
        """
        Simulate scraped data for MVP testing purposes.
        
        In production, this would be replaced with actual web scraping logic.
        """
        # Simulate network delay
        min_delay, max_delay = SCRAPER_CONFIG["SIMULATION_DELAY_RANGE"]
        await asyncio.sleep(random.uniform(min_delay, max_delay))
        
        return {
            "match_statistics": {
                "home_recent_form": [
                    {"opponent": "Team A", "result": "W", "score": "2-1"},
                    {"opponent": "Team B", "result": "D", "score": "1-1"},
                    {"opponent": "Team C", "result": "W", "score": "3-0"},
                    {"opponent": "Team D", "result": "L", "score": "0-2"},
                    {"opponent": "Team E", "result": "W", "score": "2-0"}
                ],
                "away_recent_form": [
                    {"opponent": "Team F", "result": "W", "score": "1-0"},
                    {"opponent": "Team G", "result": "W", "score": "2-1"},
                    {"opponent": "Team H", "result": "D", "score": "2-2"},
                    {"opponent": "Team I", "result": "L", "score": "1-3"},
                    {"opponent": "Team J", "result": "W", "score": "3-1"}
                ],
                "home_goals_scored_last_5": random.randint(6, 12),
                "home_goals_conceded_last_5": random.randint(2, 8),
                "away_goals_scored_last_5": random.randint(5, 11),
                "away_goals_conceded_last_5": random.randint(3, 9)
            },
            "team_news": {
                "home_injuries": self._generate_injury_list(match.homeTeam),
                "away_injuries": self._generate_injury_list(match.awayTeam),
                "home_suspensions": [],
                "away_suspensions": []
            },
            "head_to_head": {
                "last_5_h2h": [
                    {"date": "2024-03-15", "home": match.homeTeam, "away": match.awayTeam, "score": "2-1"},
                    {"date": "2023-11-20", "home": match.awayTeam, "away": match.homeTeam, "score": "0-2"},
                    {"date": "2023-08-12", "home": match.homeTeam, "away": match.awayTeam, "score": "1-1"},
                    {"date": "2023-03-05", "home": match.awayTeam, "away": match.homeTeam, "score": "3-1"},
                    {"date": "2022-11-18", "home": match.homeTeam, "away": match.awayTeam, "score": "2-0"}
                ],
                "home_wins": random.randint(1, 4),
                "away_wins": random.randint(1, 4),
                "draws": random.randint(0, 2)
            },
            "betting_odds": {
                "home_win": round(random.uniform(1.5, 4.0), 2),
                "draw": round(random.uniform(2.8, 4.5), 2),
                "away_win": round(random.uniform(1.8, 5.0), 2),
                "over_2_5_goals": round(random.uniform(1.6, 2.8), 2),
                "under_2_5_goals": round(random.uniform(1.4, 2.5), 2),
                "both_teams_score_yes": round(random.uniform(1.5, 2.2), 2),
                "both_teams_score_no": round(random.uniform(1.6, 2.5), 2)
            },
            "weather_conditions": {
                "temperature": random.randint(5, 25),
                "condition": random.choice(["sunny", "cloudy", "rainy", "windy"]),
                "precipitation_chance": random.randint(0, 80),
                "wind_speed": random.randint(5, 25)
            },
            "expert_predictions": [
                {
                    "source": "Sports Analyst A",
                    "prediction": f"{match.homeTeam} to win",
                    "confidence": random.randint(60, 90)
                },
                {
                    "source": "Betting Expert B", 
                    "prediction": "Over 2.5 goals",
                    "confidence": random.randint(70, 85)
                },
                {
                    "source": "Football Pundit C",
                    "prediction": "Both teams to score",
                    "confidence": random.randint(65, 80)
                }
            ],
            "stadium_info": {
                "name": f"{match.homeTeam} Stadium",
                "capacity": random.randint(20000, 80000),
                "surface": "Grass",
                "home_record_this_season": {
                    "wins": random.randint(5, 12),
                    "draws": random.randint(1, 6),
                    "losses": random.randint(0, 5)
                }
            }
        }
    
    def _generate_injury_list(self, team: str) -> List[Dict[str, str]]:
        """Generate realistic injury/availability data."""
        potential_injuries = [
            {"player": "Key Striker", "status": "doubtful", "injury": "hamstring"},
            {"player": "Main Defender", "status": "out", "injury": "knee"},
            {"player": "Midfielder", "status": "fit", "injury": "none"},
            {"player": "Goalkeeper", "status": "fit", "injury": "none"}
        ]
        
        # Return random subset of injuries
        max_injuries = SCRAPER_CONFIG["MAX_INJURIES_PER_TEAM"]
        num_injuries = random.randint(0, max_injuries)
        return random.sample(potential_injuries, min(num_injuries, len(potential_injuries)))
    
    async def scrape_team_statistics(self, team_name: str) -> Dict[str, Any]:
        """
        Scrape detailed team statistics and performance data.
        
        Args:
            team_name: Name of the team to scrape data for
            
        Returns:
            Dictionary containing team statistics
        """
        try:
            logger.info(f"Scraping statistics for {team_name}")
            
            # For MVP, return simulated team data
            min_delay, max_delay = SCRAPER_CONFIG["TEAM_STATS_DELAY_RANGE"]
            await asyncio.sleep(random.uniform(min_delay, max_delay))
            
            return {
                "league_position": random.randint(1, 20),
                "points": random.randint(15, 85),
                "games_played": random.randint(15, 30),
                "wins": random.randint(5, 20),
                "draws": random.randint(2, 8),
                "losses": random.randint(1, 15),
                "goals_for": random.randint(20, 70),
                "goals_against": random.randint(15, 50),
                "goal_difference": random.randint(-20, 40),
                "clean_sheets": random.randint(3, 15),
                "avg_possession": random.randint(35, 65),
                "shots_per_game": random.uniform(8.0, 18.0),
                "shots_on_target_percentage": random.uniform(25.0, 45.0),
                "pass_accuracy": random.uniform(70.0, 90.0)
            }
            
        except Exception as e:
            logger.error(f"Error scraping team statistics for {team_name}: {e}")
            return {}
    
    async def scrape_betting_odds(self, match: Match) -> Dict[str, float]:
        """
        Scrape current betting odds from multiple bookmakers.
        
        Args:
            match: Match to get odds for
            
        Returns:
            Dictionary containing average odds across bookmakers
        """
        try:
            logger.info(f"Scraping betting odds for {match.homeTeam} vs {match.awayTeam}")
            
            # For MVP, return simulated odds data
            min_delay, max_delay = SCRAPER_CONFIG["BETTING_ODDS_DELAY_RANGE"]
            await asyncio.sleep(random.uniform(min_delay, max_delay))
            
            return {
                "home_win": round(random.uniform(1.5, 4.0), 2),
                "draw": round(random.uniform(2.8, 4.5), 2),
                "away_win": round(random.uniform(1.8, 5.0), 2),
                "over_2_5": round(random.uniform(1.6, 2.8), 2),
                "under_2_5": round(random.uniform(1.4, 2.5), 2),
                "btts_yes": round(random.uniform(1.5, 2.2), 2),
                "btts_no": round(random.uniform(1.6, 2.5), 2)
            }
            
        except Exception as e:
            logger.error(f"Error scraping betting odds: {e}")
            return {}
    
    def _get_fallback_data(self) -> Dict[str, Any]:
        """
        Return minimal fallback data when scraping fails.
        """
        return {
            "match_statistics": {},
            "team_news": {"home_injuries": [], "away_injuries": []},
            "head_to_head": {},
            "betting_odds": {},
            "weather_conditions": {},
            "expert_predictions": [],
            "stadium_info": {},
            "scraping_status": "failed"
        }
    
    async def _make_request(self, url: str, retries: int = 0) -> Optional[str]:
        """
        Make HTTP request with error handling and rate limiting.
        
        Args:
            url: URL to scrape
            retries: Current retry attempt
            
        Returns:
            Response text or None if failed
        """
        try:
            await asyncio.sleep(self.rate_limit_delay)
            
            async with httpx.AsyncClient(timeout=self.request_timeout) as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()
                return response.text
                
        except httpx.TimeoutException:
            if retries < self.max_retries:
                logger.warning(f"Timeout scraping {url}, retrying ({retries + 1}/{self.max_retries})")
                backoff_base = SCRAPER_CONFIG["EXPONENTIAL_BACKOFF_BASE"]
                await asyncio.sleep(backoff_base ** retries)  # Exponential backoff
                return await self._make_request(url, retries + 1)
            else:
                logger.error(f"Max retries exceeded for {url}")
                return None
                
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:  # Rate limited
                backoff_base = SCRAPER_CONFIG["EXPONENTIAL_BACKOFF_BASE"]
                wait_multiplier = SCRAPER_CONFIG["RATE_LIMIT_WAIT_MULTIPLIER"]
                wait_time = backoff_base ** retries * wait_multiplier  # Longer wait for rate limits
                logger.warning(f"Rate limited on {url}, waiting {wait_time}s")
                await asyncio.sleep(wait_time)
                
                if retries < self.max_retries:
                    return await self._make_request(url, retries + 1)
            
            logger.error(f"HTTP error {e.response.status_code} for {url}")
            return None
            
        except Exception as e:
            logger.error(f"Unexpected error scraping {url}: {e}")
            return None