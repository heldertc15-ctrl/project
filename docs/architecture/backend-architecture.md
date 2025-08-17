# Backend Architecture

## Route Organization

Plaintext

backend/app/
├── api/
│ └── prediction_router.py # Defines the /matches and /predict API routes
├── services/
│ ├── prediction_service.py # Contains the core AI logic
│ ├── match_service.py # Handles fetching data from TheSportsDB
│ └── web_scraper.py # Handles scraping data from the web
└── main.py # Initializes the FastAPI application

## Key Patterns

Dependency Injection will be used in the API router to keep it decoupled from the service logic, ensuring testability.