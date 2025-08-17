from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal


class Match(BaseModel):
    """
    Match model representing a soccer match for betting prediction analysis.
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "2274671",
                "homeTeam": "Liverpool",
                "awayTeam": "Manchester City",
                "startTime": "2025-08-19T18:45:00Z"
            }
        }
    )
    
    id: str
    homeTeam: str
    awayTeam: str
    startTime: str  # ISO 8601 format


class PredictionRequest(BaseModel):
    """
    Request model for prediction endpoint.
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "matchId": "2274671",
                "riskLevel": "Medium"
            }
        }
    )
    
    matchId: str
    riskLevel: Literal["Low", "Medium", "High"]


class PredictionResult(BaseModel):
    """
    Response model for prediction endpoint.
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "betSuggestion": "Liverpool to win",
                "rationale": "Liverpool has a strong home record and Manchester City is missing key players.",
                "riskLevel": "Medium"
            }
        }
    )
    
    betSuggestion: str
    rationale: str
    riskLevel: Literal["Low", "Medium", "High"]