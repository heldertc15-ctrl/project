# Coding Standards and Conventions

## Existing Standards Compliance

Code Style: The project adheres to the default code style and linting rules provided by Create React App (using ESLint). All new code will follow these established rules.

Testing Patterns: No existing testing patterns were identified in the codebase. New standards will be established for this enhancement.

Documentation Style: No formal code documentation style (e.g., JSDoc) was identified.

## Enhancement-Specific Standards

Component Unit Testing: All new and modified functional components must have a corresponding *.test.js file. Tests will be written using the React Testing Library to verify correct rendering and user interactions.

## Critical Integration Rules

To ensure a smooth integration, the following mandatory rules will be followed:

Styling Consistency: All new and modified components MUST be styled using Tailwind CSS utility classes. Do not introduce any new styled-components.

Error Handling: All external API calls must include try/catch blocks to handle network errors gracefully and update the UI to reflect loading or error states.

API Logic Encapsulation: The logic for fetching data from the external SportsDB API must be encapsulated in a dedicated service or custom hook and not be mixed directly into UI component files.

Logging: Use console.error for logging caught errors. console.log should only be used for debugging during development and must be removed before a task is considered complete.