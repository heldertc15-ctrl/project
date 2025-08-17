# Frontend Architecture

## Component Organization

Plaintext

frontend/src/
├── components/ # Small, reusable UI components (e.g., Button.tsx)
├── features/ # Components related to a specific feature
│ └── prediction/
│ ├── MatchSelector.tsx
│ └── PredictionView.tsx
├── services/ # For handling API calls
│ └── apiClient.ts
└── App.tsx # The main component that manages which view is shown

## State Management & Routing

State: State will be managed locally in components using React's built-in useState hook.

Routing: A routing library is not needed. The app will be a single page that conditionally renders the selection or result view.