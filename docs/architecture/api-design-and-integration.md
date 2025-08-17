# API Design and Integration

## API Integration Strategy

API Integration Strategy: A new local REST API endpoint will be created on the backend to handle AI prediction requests from the frontend. This aligns with the original project's technical assumptions.

Authentication: None required for this enhancement.

Versioning: Not applicable at this stage.

## New API Endpoints

### POST /api/predict

Purpose: To receive a user's selected match and risk level, process it with the AI engine, and return a betting suggestion.

Integration: This endpoint will be called by the frontend when a user requests a prediction.

#### Request Body

```json
{
  "matchId": "string",
  "riskLevel": "Low" | "Medium" | "High"
}
```

#### Success Response (200 OK)

```json
{
  "betSuggestion": "string",
  "rationale": "string",
  "riskLevel": "Low" | "Medium" | "High"
}
```