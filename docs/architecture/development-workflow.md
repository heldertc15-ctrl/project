# Development Workflow

## Prerequisites

Node.js: ~18.17.0 or higher

Python: ~3.11

## Initial Setup
Run this command from the project root to install all dependencies:

Bash

npm install

## Development Commands

To start both servers: npm run dev

To start only the frontend: npm run dev:frontend

To start only the backend: npm run dev:backend

## Environment Configuration
Create a file at apps/backend/.env with your Google Gemini API key:

Bash

GEMINI_API_KEY="YOUR_GEMINI_API_KEY"