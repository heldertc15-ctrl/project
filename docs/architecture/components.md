# Components

## Backend Components

API Server: Handles HTTP requests and routes them to services.

Prediction Service: Contains the core AI logic for generating predictions.

Match Data Service: Manages communication with the external sports API.

Web Scraper / Analyzer: Gathers unstructured data from the web for AI analysis.

## Frontend Components

Match Selector View: Fetches and displays matches, handles user selection of match and risk.

Prediction Result View: Displays the loading state and the final prediction result.

apiClient: A non-visual module that handles all HTTP communication with the backend.