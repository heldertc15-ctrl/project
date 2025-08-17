# Introduction

This document outlines the complete fullstack architecture for the AI Soccer Betting Advisor, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

## Starter Template or Existing Project

To accelerate development and ensure a robust foundation, we will use the following:

Frontend: Use Vite with a React + TypeScript template. This provides an extremely fast development server and an optimized build process out of the box.

Backend: Use a standard FastAPI project generator. This will create a logical structure for our Python backend, ready for implementing API endpoints and the core AI logic.

## Core Principles

Testability: The architecture must support testing the output of each completed story in isolation. This is achieved through a strong separation of concerns.

Developer Experience: The project must be simple to run and review. A one-command startup (npm run dev) is required for development, and a build + start process will be used to create stable versions for review after each story.

## Change Log
| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-08-16 | 1.1 | Updated external API section to reflect public endpoint usage. | Winston (Architect) |
| 2025-08-16 | 1.0 | Initial architecture draft. | Winston (Architect) |