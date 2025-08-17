Project Brownfield Architecture Document
Introduction
This document captures the CURRENT STATE of the "AI-Powered Sports Betting Advisor" codebase, including its structure, dependencies, and known issues. It serves as a reference for AI agents and developers working on enhancements. Its primary purpose, as defined by the user, is to act as an A.I powered sports betting advisor where users select a match, a risk level (low/medium/high), and the A.I outputs a sports bet prediction.

Document Scope
This document provides a comprehensive analysis of the entire existing frontend application.

Change Log
Date	Version	Description	Author
2025-08-17	1.0	Initial brownfield analysis	Winston (Architect)

Export to Sheets
Quick Reference - Key Files and Entry Points
Critical Files for Understanding the System
Main Entry: src/index.js

Root Component: src/App.js (Contains routing logic)

Primary View: src/pages/Home.js

Global Styles: src/styles/global.js

Configuration: tailwind.config.js

Core Components: src/components/Navbar, src/components/Card, src/components/Search

High Level Architecture
Technical Summary
The project is a client-side single-page application (SPA) built with React. It uses react-router-dom for navigation and fetches data from an external API (The SportsDB) to display sports match information. The architecture is simple, component-based, and typical of a project bootstrapped with Create React App.

Actual Tech Stack
Category	Technology	Version	Notes
Framework	React	18.2.0	Core UI library.
Bootstrapper	Create React App	5.0.1	Used for initial setup and scripts (react-scripts).
Routing	React Router DOM	6.22.3	Handles all client-side navigation.
Styling	Styled Components	6.1.8	Used for component-level CSS-in-JS.
Styling	Tailwind CSS	3.4.1	Utility-first CSS framework. Note: Hybrid use with Styled Components.
Testing	Testing Library	13.4.0	For component testing.

Export to Sheets
Repository Structure Reality Check
Type: Single repository containing a frontend application.

Package Manager: npm

Notable: The structure is a standard Create React App layout. There is no backend code present.

Source Tree and Module Organization
Project Structure (Actual)
Plaintext

project-root/
├── public/
├── src/
│   ├── assets/          # Images and static assets
│   ├── components/      # Reusable UI components (Card, Footer, etc.)
│   ├── pages/           # Page-level components (Home, MatchDetails)
│   ├── styles/          # Global styles
│   ├── App.js           # Main app component with routing
│   └── index.js         # Application entry point
├── package.json
└── tailwind.config.js
Key Modules and Their Purpose
src/pages/Home.js: The main landing page, responsible for fetching and displaying the list of soccer matches.

src/pages/MatchDetails.js: A view to show more information about a single selected match.

src/components/: A collection of stateless and stateful components used across the application.

src/styles/global.js: Defines global CSS styles using styled-components.

Data Models and APIs
API Specifications
Primary External API: The SportsDB API.

Integration: The application makes direct client-side requests to this API to fetch match data. No backend proxy or service is currently in use.

Technical Debt and Known Issues
Critical Technical Debt
Dual Styling Systems: The project includes both styled-components and tailwindcss. This creates inconsistency and can make styling and maintenance more complex. A decision should be made to standardize on one approach for future development.

Workarounds and Gotchas
There are no obvious workarounds documented or visible in the code, but the simplicity of the app may hide complexities in the API data handling.

Known Issues
Incomplete Data Fetching: As reported by the user, the application currently only fetches and displays 3 soccer matches, whereas the requirement is to fetch all of them. This is a bug in the data-fetching logic on the Home.js page.

Development and Deployment
Local Development Setup
The project is started using the npm start command as defined in package.json.

Required environment variables are not specified, but the API key for The SportsDB is likely needed.

Build and Deployment Process
Build Command: npm run build creates a production-ready static build of the application.

Deployment: No deployment process is defined in the repository. It is assumed to be a manual deployment of the static build to a hosting provider.

Testing Reality
Current Test Coverage
The project includes @testing-library/react, but there are no visible test files (.test.js) in the repository. Test coverage is effectively 0%.

Running Tests
Bash

# This command will run, but will not find any tests.
npm test
Enhancement Impact Analysis
This section provides a high-level forecast of how the requested enhancements will impact the current codebase.

Files That Will Need Modification
src/App.js: To add a new route for the /dashboard.

src/pages/Home.js: To fix the data-fetching logic for matches.

src/styles/global.js and tailwind.config.js: To implement the light/dark mode theming variables.

All Component Files: To adopt the new theming variables for "cozy" styling and dark mode support.

src/components/Navbar.js: To add a link to the new dashboard.

New Files/Modules Needed
src/pages/Dashboard.js: A new page component for the dashboard.

src/hooks/useTheme.js (suggested): A custom hook to manage the light/dark mode state.

New UI Components: To make the UI feel more "familiar" and less "naked," new components for layout (e.g., Container, Grid) and content display will be needed on the dashboard and home page.

AI Integration Service: A new module/service will be required to handle the logic for the AI sports betting predictions.

Integration Considerations
The new AI prediction feature is a major integration point. The architecture will need to decide if this will be a client-side library or an integration with a new backend service. This is the most significant architectural decision for the upcoming enhancements.