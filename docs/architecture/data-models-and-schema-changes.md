# Data Models and Schema Changes

## New Data Models

### Match Interface

Purpose: To define a consistent structure for the soccer match data fetched from the SportsDB API.

Integration: This interface will be used throughout the frontend to handle match data.

Key Attributes:

id: string - Unique identifier for the match.

homeTeam: string - Name of the home team.

awayTeam: string - Name of the away team.

date: string - The date and time of the match.

league: string - The name of the league.

### Prediction Interface

Purpose: To define the structure for the data returned by the AI prediction engine.

Integration: This will be used to display the results to the user.

Key Attributes:

betSuggestion: string - The AI-generated bet suggestion (e.g., "Home team to win").

rationale: string - A short paragraph explaining the reasoning for the suggestion.

riskLevel: 'Low' | 'Medium' | 'High' - The user-selected risk level.

## Schema Integration Strategy

Database Changes Required:

New/Modified Tables: Not applicable. No database changes are required as this is a client-side application.

Backward Compatibility: Not applicable.