from fastapi import APIRouter, HTTPException, Depends
from typing import List
import logging

from ..services.match_service import MatchService
from ..services.prediction_service import PredictionService
from ..services.web_scraper import WebScraperService
from ..models.match import Match, PredictionRequest, PredictionResult

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/prediction", tags=["prediction"])


def get_match_service() -> MatchService:
    """Dependency injection for MatchService"""
    return MatchService()


def get_prediction_service() -> PredictionService:
    """Dependency injection for PredictionService"""
    return PredictionService()


def get_web_scraper_service() -> WebScraperService:
    """Dependency injection for WebScraperService"""
    return WebScraperService()


@router.get("/matches", response_model=List[Match])
async def get_matches(match_service: MatchService = Depends(get_match_service)) -> List[Match]:
    """
    Get upcoming soccer matches for betting prediction analysis.
    
    Returns:
        List of Match objects with id, homeTeam, awayTeam, and startTime (ISO 8601)
        
    Raises:
        HTTPException: 500 if external API is unavailable or rate limited
        HTTPException: 503 if service is temporarily unavailable
    """
    try:
        logger.info("Fetching upcoming matches for prediction")
        matches = await match_service.get_upcoming_matches()
        
        if not matches:
            logger.warning("No upcoming matches available")
            return []
        
        logger.info(f"Successfully retrieved {len(matches)} matches")
        return matches
        
    except Exception as e:
        logger.error(f"Error fetching matches: {e}")
        
        # Handle specific error types
        error_message = str(e)
        if "rate limit" in error_message.lower():
            raise HTTPException(
                status_code=429, 
                detail="Sports data service rate limit exceeded. Please try again in a few minutes."
            )
        elif "timeout" in error_message.lower():
            raise HTTPException(
                status_code=503, 
                detail="Sports data service is temporarily slow. Please try again."
            )
        elif "unavailable" in error_message.lower():
            raise HTTPException(
                status_code=503, 
                detail="Sports data service is temporarily unavailable. Please try again later."
            )
        else:
            raise HTTPException(
                status_code=500, 
                detail="Unable to fetch match data. Please try again later."
            )


@router.post("/predict", response_model=PredictionResult)
async def predict_match(
    request: PredictionRequest,
    match_service: MatchService = Depends(get_match_service),
    prediction_service: PredictionService = Depends(get_prediction_service),
    web_scraper: WebScraperService = Depends(get_web_scraper_service)
) -> PredictionResult:
    """
    Generate AI betting prediction for a specific match and risk level.
    
    Args:
        request: PredictionRequest containing matchId and riskLevel
        
    Returns:
        PredictionResult with betSuggestion, rationale, and riskLevel
        
    Raises:
        HTTPException: 400 if matchId is invalid or not found
        HTTPException: 422 if riskLevel is invalid  
        HTTPException: 500 if prediction service fails
    """
    try:
        logger.info(f"Generating prediction for match {request.matchId} with risk level {request.riskLevel}")
        
        # Validate match exists
        matches = await match_service.get_upcoming_matches()
        match = next((m for m in matches if m.id == request.matchId), None)
        
        if not match:
            logger.warning(f"Match {request.matchId} not found")
            raise HTTPException(
                status_code=400,
                detail=f"Match with ID {request.matchId} not found"
            )
        
        # Scrape additional match data for AI analysis
        scraped_data = await web_scraper.scrape_match_data(match)
        
        # Generate AI prediction using all available data
        result = await prediction_service.generate_prediction(
            match=match,
            risk_level=request.riskLevel,
            scraped_data=scraped_data
        )
        
        logger.info(f"Successfully generated prediction: {result.betSuggestion}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating prediction: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to generate prediction. Please try again later."
        )