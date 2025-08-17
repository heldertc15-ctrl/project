# Core Workflows

Code snippet

sequenceDiagram
 participant User
 participant Frontend
 participant Backend
 participant PredictionService
 participant ExternalSportsAPI
 participant WebData


 User->>Frontend: Loads Application
 Frontend->>Backend: GET /matches
 Backend->>ExternalSportsAPI: Fetch upcoming matches
 ExternalSportsAPI-->>Backend: Return match list
 Backend-->>Frontend: Return match list
 Frontend-->>User: Display matches


 User->>Frontend: Selects Match and Risk Level
 Frontend->>Backend: POST /predict (with matchId, riskLevel)
 Backend->>PredictionService: generate_prediction()
 PredictionService->>WebData: Scrape/analyze match data
 WebData-->>PredictionService: Return analysis data
 PredictionService->>PredictionService: Perform AI calculation
 PredictionService-->>Backend: Return PredictionResult
 Backend-->>Frontend: Return PredictionResult
 Frontend-->>User: Display prediction and rationale