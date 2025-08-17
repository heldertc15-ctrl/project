import logging
import random
from typing import Dict, Any, List
from datetime import datetime

from ..models.match import Match, PredictionResult

logger = logging.getLogger(__name__)

# Configuration constants
ANALYSIS_CONSTANTS = {
    "HOME_ADVANTAGE_RANGE": (0.1, 0.3),
    "TEAM_STRENGTH_RANGE": (-1.0, 1.0),
    "HEAD_TO_HEAD_WINS_RANGE": (0, 5),
    "HEAD_TO_HEAD_DRAWS_RANGE": (0, 3),
    "AVG_GOALS_RANGE": (1.5, 3.5),
    "FORM_RANGE": (0.2, 0.8),
    "GOALS_PER_GAME_RANGE": (0.8, 2.5),
    "RATIONALE_MIN_LENGTH": 20,
    "EVENING_HOUR_THRESHOLD": 18,
    "WEEKEND_DAY_THRESHOLD": 5
}


class PredictionService:
    """
    AI Prediction Service for generating betting recommendations.
    
    This service analyzes match data and generates intelligent betting suggestions
    based on risk levels and data analysis.
    """
    
    def __init__(self):
        self.risk_level_mappings = {
            "Low": {"multiplier": 0.5, "variance": 0.1},
            "Medium": {"multiplier": 1.0, "variance": 0.3}, 
            "High": {"multiplier": 1.5, "variance": 0.5}
        }
    
    async def generate_prediction(
        self, 
        match: Match, 
        risk_level: str,
        scraped_data: Dict[str, Any] = None
    ) -> PredictionResult:
        """
        Generate AI betting prediction for a match based on analysis and risk level.
        
        Args:
            match: Match object with team and timing information
            risk_level: Risk level (Low/Medium/High) 
            scraped_data: Optional additional match data from web scraping
            
        Returns:
            PredictionResult with betting suggestion and rationale
        """
        try:
            logger.info(f"Generating prediction for {match.homeTeam} vs {match.awayTeam} at {risk_level} risk")
            
            # Analyze match data
            analysis = await self._analyze_match_data(match, scraped_data)
            
            # Generate betting suggestion based on risk level
            bet_suggestion = self._generate_bet_suggestion(match, risk_level, analysis)
            
            # Create rationale explaining the prediction
            rationale = self._generate_rationale(match, risk_level, analysis, bet_suggestion)
            
            result = PredictionResult(
                betSuggestion=bet_suggestion,
                rationale=rationale,
                riskLevel=risk_level
            )
            
            logger.info(f"Generated prediction: {bet_suggestion}")
            return result
            
        except ValueError as e:
            logger.error(f"Invalid input data for prediction: {e}")
            raise ValueError(f"Invalid prediction input: {str(e)}")
        except Exception as e:
            logger.error(f"Error generating prediction: {e}")
            raise RuntimeError(f"Prediction generation failed: {str(e)}")
    
    async def _analyze_match_data(self, match: Match, scraped_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze available match data to inform prediction logic.
        
        Args:
            match: Match information
            scraped_data: Additional web-scraped match data
            
        Returns:
            Dictionary containing analysis insights
        """
        analysis = {
            "home_advantage": self._calculate_home_advantage(match.homeTeam),
            "team_strength_differential": self._analyze_team_strength(match.homeTeam, match.awayTeam),
            "historical_h2h": self._analyze_head_to_head(match.homeTeam, match.awayTeam),
            "recent_form": self._analyze_recent_form(match.homeTeam, match.awayTeam),
            "match_context": self._analyze_match_context(match)
        }
        
        # Incorporate scraped data if available
        if scraped_data:
            analysis["external_insights"] = self._process_scraped_insights(scraped_data)
        
        logger.debug(f"Match analysis completed: {analysis}")
        return analysis
    
    def _generate_bet_suggestion(self, match: Match, risk_level: str, analysis: Dict[str, Any]) -> str:
        """
        Generate betting suggestion based on analysis and risk appetite.
        """
        risk_config = self.risk_level_mappings[risk_level]
        
        # Base predictions by risk level
        if risk_level == "Low":
            # Conservative bets - draws, double chance, under goals
            suggestions = [
                "Draw",
                f"{match.homeTeam} or Draw (Double Chance)",
                f"{match.awayTeam} or Draw (Double Chance)", 
                "Under 2.5 goals",
                "Both teams to score - No"
            ]
        elif risk_level == "Medium":
            # Moderate risk bets - win predictions, goals markets
            suggestions = [
                f"{match.homeTeam} to win",
                f"{match.awayTeam} to win",
                "Over 2.5 goals",
                "Both teams to score - Yes",
                f"{match.homeTeam} to win and Over 1.5 goals"
            ]
        else:  # High risk
            # Aggressive bets - exact scores, high goal totals, combinations
            suggestions = [
                f"{match.homeTeam} to win 3-1",
                f"{match.awayTeam} to win 2-1", 
                "Over 3.5 goals",
                "Both teams to score and Over 2.5 goals",
                f"First goal scorer: {match.homeTeam} player"
            ]
        
        # Apply analysis insights to select best suggestion
        selected = self._apply_analysis_to_selection(suggestions, analysis, risk_config)
        return selected
    
    def _generate_rationale(
        self, 
        match: Match, 
        risk_level: str, 
        analysis: Dict[str, Any], 
        bet_suggestion: str
    ) -> str:
        """
        Generate one-sentence rationale explaining the prediction.
        """
        rationales = {
            "Low": [
                f"Both teams have similar recent form making a draw likely.",
                f"{match.homeTeam} has strong defensive record at home minimizing goals.",
                f"Historical head-to-head matches show low-scoring affairs."
            ],
            "Medium": [
                f"{match.homeTeam} has clear home advantage and better recent form.",
                f"Both teams have strong attacking records suggesting multiple goals.",
                f"{match.awayTeam} travels well and has superior squad depth."
            ],
            "High": [
                f"Both teams play aggressive attacking football leading to high-scoring matches.",
                f"{match.homeTeam} has exceptional home scoring record and {match.awayTeam} weak away defense.",
                f"Key players returning from injury will significantly impact the match outcome."
            ]
        }
        
        # Select rationale that best matches the bet suggestion context
        available_rationales = rationales[risk_level]
        
        # Basic selection logic - could be enhanced with more sophisticated matching
        if "draw" in bet_suggestion.lower():
            selected = available_rationales[0]
        elif "goals" in bet_suggestion.lower():
            selected = available_rationales[1] if len(available_rationales) > 1 else available_rationales[0]
        else:
            selected = available_rationales[-1]
        
        return selected
    
    def _calculate_home_advantage(self, home_team: str) -> float:
        """Calculate home advantage factor for the team."""
        # MVP implementation - random factor within configured range
        min_val, max_val = ANALYSIS_CONSTANTS["HOME_ADVANTAGE_RANGE"]
        return random.uniform(min_val, max_val)
    
    def _analyze_team_strength(self, home_team: str, away_team: str) -> float:
        """Analyze relative team strength differential."""
        # MVP implementation - random differential within configured range
        min_val, max_val = ANALYSIS_CONSTANTS["TEAM_STRENGTH_RANGE"]
        return random.uniform(min_val, max_val)
    
    def _analyze_head_to_head(self, home_team: str, away_team: str) -> Dict[str, Any]:
        """Analyze historical head-to-head record."""
        wins_min, wins_max = ANALYSIS_CONSTANTS["HEAD_TO_HEAD_WINS_RANGE"]
        draws_min, draws_max = ANALYSIS_CONSTANTS["HEAD_TO_HEAD_DRAWS_RANGE"]
        goals_min, goals_max = ANALYSIS_CONSTANTS["AVG_GOALS_RANGE"]
        
        return {
            "home_wins": random.randint(wins_min, wins_max),
            "away_wins": random.randint(wins_min, wins_max), 
            "draws": random.randint(draws_min, draws_max),
            "avg_goals": random.uniform(goals_min, goals_max)
        }
    
    def _analyze_recent_form(self, home_team: str, away_team: str) -> Dict[str, Any]:
        """Analyze recent team form over last 5 matches."""
        form_min, form_max = ANALYSIS_CONSTANTS["FORM_RANGE"]
        goals_min, goals_max = ANALYSIS_CONSTANTS["GOALS_PER_GAME_RANGE"]
        
        return {
            "home_form": random.uniform(form_min, form_max),
            "away_form": random.uniform(form_min, form_max),
            "home_goals_per_game": random.uniform(goals_min, goals_max),
            "away_goals_per_game": random.uniform(goals_min, goals_max)
        }
    
    def _analyze_match_context(self, match: Match) -> Dict[str, Any]:
        """Analyze contextual factors like timing, importance."""
        match_datetime = datetime.fromisoformat(match.startTime.replace('Z', '+00:00'))
        
        return {
            "is_weekend": match_datetime.weekday() >= ANALYSIS_CONSTANTS["WEEKEND_DAY_THRESHOLD"],
            "is_evening": match_datetime.hour >= ANALYSIS_CONSTANTS["EVENING_HOUR_THRESHOLD"],
            "importance": random.choice(["low", "medium", "high"])
        }
    
    def _process_scraped_insights(self, scraped_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process web-scraped data for additional insights."""
        # MVP implementation - basic processing
        return {
            "injury_reports": scraped_data.get("injuries", []),
            "weather_conditions": scraped_data.get("weather", {}),
            "betting_odds": scraped_data.get("odds", {}),
            "expert_predictions": scraped_data.get("expert_tips", [])
        }
    
    def _apply_analysis_to_selection(
        self, 
        suggestions: List[str], 
        analysis: Dict[str, Any], 
        risk_config: Dict[str, float]
    ) -> str:
        """Apply analysis insights to select best suggestion from options."""
        # MVP implementation - weighted random selection based on analysis
        
        # Create weights based on analysis factors
        weights = []
        for suggestion in suggestions:
            weight = 1.0
            
            # Adjust weight based on home advantage
            if analysis["home_advantage"] > 0.2:
                if "home" in suggestion.lower() or suggestions[0] in suggestion:
                    weight *= 1.3
            
            # Adjust weight based on team strength differential  
            if analysis["team_strength_differential"] > 0.5:
                if "home" in suggestion.lower():
                    weight *= 1.2
            elif analysis["team_strength_differential"] < -0.5:
                if "away" in suggestion.lower():
                    weight *= 1.2
            
            weights.append(weight)
        
        # Weighted random selection
        total_weight = sum(weights)
        r = random.uniform(0, total_weight)
        cumulative = 0
        
        for i, weight in enumerate(weights):
            cumulative += weight
            if r <= cumulative:
                return suggestions[i]
        
        return suggestions[0]  # Fallback