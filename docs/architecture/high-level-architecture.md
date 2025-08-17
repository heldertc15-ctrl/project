# High Level Architecture

## Technical Summary
This project will be a fullstack application running in a local environment. It uses a classic client-server model with a React frontend communicating via a REST API to a Python backend. The architecture is designed for simplicity and rapid prototyping within a monorepo structure, with a strong emphasis on separating the core AI logic from the API layer to ensure testability at every stage.

## Platform and Infrastructure Choice

Platform: The user's local machine.

Key Services: Local development servers (Vite for frontend, Uvicorn for FastAPI backend).

Deployment: Not applicable for the MVP; this is a local-run-only application.

## Repository Structure

Structure: Monorepo.

Monorepo Tool: We will use npm Workspaces, a simple, built-in feature of npm for managing local packages.

## High Level Architecture Diagram

Code snippet

graph TD
 A[User] --> B{Browser};
 B --> C[Frontend App (React/Vite)];
 C -- API Call --> D[Backend App (Python/FastAPI)];
 D -- Fetches Data --> E[External Sports API];
 D -- AI Analysis --> F[Public Web Data];

## Architectural Patterns

Overall Pattern: Client-Server: A simple and direct pattern where the frontend client makes requests to a backend server.

Frontend Pattern: Component-Based UI: Using React to build the interface out of small, reusable, and testable components.

Backend Pattern: Layered Architecture: The backend is separated into distinct layers (API/Routes, Services/AI Logic, Data Access) to ensure testability.