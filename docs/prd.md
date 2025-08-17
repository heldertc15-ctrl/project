project Brownfield Enhancement PRD
Intro Project Analysis and Context
Analysis Source: A document-project task was performed, and the output is now stored in docs/brownfield-architecture.md.

Current Project State: The project is a client-side React SPA that functions as an AI-powered sports betting advisor. It currently fetches a limited number of matches from the SportsDB API and allows users to select a match and risk level to get a prediction.

Enhancement Type: This work involves a New Feature Addition (Dashboard), a Major Feature Modification (AI integration improvements, full match list), and a UI/UX Overhaul ("cozy" feel, light/dark mode).

Impact Assessment: The scope of these changes represents a Significant Impact, as it will involve creating new core views (Dashboard), implementing a site-wide theming system, and overhauling the core data-fetching logic.

Goals and Background Context
Goals
Overhaul the UI/UX to create a more "cozy" and familiar user experience.

Implement a user-selectable light and dark mode across the application.

Introduce a new Dashboard view.

Correct the core data-fetching logic to display all available soccer matches from the SportsDB API.

Improve the integration and functionality of the AI-powered betting advisor.

Background Context
The current application serves as a functional proof-of-concept for an AI-powered sports betting advisor. However, its user experience is minimal, feeling "naked" and lacking user-friendly features. Furthermore, a critical bug in its data-fetching logic prevents it from displaying a full list of matches, limiting its core utility.

This enhancement aims to evolve the application into a more robust and engaging tool by fixing the data-fetching issue, introducing a new personalized dashboard, and implementing modern UI features like a light/dark mode to create a more comfortable and "familiar" user experience.

Change Log
Change	Date	Version	Description	Author
Created document	2025-08-17	1.0	Initial draft of the Brownfield PRD.	John (PM)

Export to Sheets
Requirements
Functional
FR1: The system shall fetch and display all available soccer matches from the SportsDB API, removing the current limitation of only showing three.

FR2: The application must include a new, distinct Dashboard page accessible from the main navigation.

FR3: A theme-switching mechanism (e.g., a toggle button) shall be implemented that allows users to select between a Light Mode and a Dark Mode. The chosen theme must persist for the user across sessions.

FR4: The AI betting advisor's integration point shall be reviewed and prepared for future enhancements.

Non-Functional
NFR1: The overall UI design shall be updated to feel more "familiar" and less "naked," using common layout patterns and providing a richer visual experience.

NFR2: The application must maintain a responsive layout, ensuring usability on common desktop, tablet, and mobile screen sizes.

NFR3: The implementation of new features should not negatively impact the existing application's load time or performance.

NFR4: The styling for new components must be consistent with the chosen primary styling system (either Tailwind CSS or Styled Components) to reduce technical debt.

User Interface Enhancement Goals
Integration with Existing UI
The primary goal is to create a more "familiar" and cohesive user experience. The project currently uses a mix of styled-components and tailwindcss. To reduce technical debt and ensure consistency, all new development for this enhancement will standardize on Tailwind CSS for layout and component styling. Global theme variables (colors, fonts, spacing for light/dark modes) will be defined in a central location (src/styles/theme.js) and consumed by Tailwind's configuration, ensuring a single source of truth for all styling.

Modified/New Screens and Views
Modified - Home Page: The layout will be updated to feel less "naked." This may include adding container elements, a clearer grid structure, and potentially sections for featured matches or user-specific content. It will be the primary showcase for the new "cozy" theme.

Modified - Match Details Page: This page will be updated to adopt the new global theme for full consistency with the rest of the application.

New - Dashboard Page: A new page will be created to serve as the user's main hub.

UI Consistency Requirements
All new and modified components MUST use the centralized theme variables for colors, fonts, and spacing to ensure the light/dark mode switch works globally.

While the aesthetic will be updated, the core interaction patterns (e.g., clicking a match card to see details) should remain intuitive and consistent with user expectations.

The application must maintain its responsive behavior on mobile, tablet, and desktop screens.

Technical Constraints and Integration Requirements
Existing Technology Stack
The existing technology stack, as identified in the architecture analysis, will be adhered to.

Languages: JavaScript

Frameworks: React (v18.2.0), Tailwind CSS, Styled-Components

External Dependencies: react-router-dom for routing.

Integration Approach
Database Integration Strategy: Not applicable. The application is currently client-side only and does not have its own database.

API Integration Strategy: The application will continue to fetch data directly from the external SportsDB API. The bug in the data-fetching logic will be corrected. Future AI-related features will require a new integration strategy, to be defined in the architecture phase.

Frontend Integration Strategy: The new Dashboard page will be added to the existing react-router-dom configuration. The light/dark mode will be implemented using a global theme context that modifies CSS variables consumed by Tailwind CSS.

Testing Integration Strategy: New unit tests will be written for all new components and logic using the existing Testing Library setup.

Code Organization and Standards
File Structure Approach: New components and pages will be created in their respective directories (src/components/, src/pages/) following the existing structure. A new src/hooks/ directory will be created for custom hooks (e.g., useTheme).

Styling Standards: To resolve the current inconsistency, all new components will be styled using Tailwind CSS.

Epic and Story Structure
Epic 1: UI Modernization and Core Functionality Enhancement
Epic Goal: To transform the application's user experience by implementing a modern, "familiar" UI with light/dark modes, introduce a new dashboard, and correct the core data-fetching functionality to ensure the application is both fully functional and visually engaging.

Story 2.1: Establish Theming Foundation
As a user, I want the application to have a foundational theming system, so that a consistent look and feel can be applied across the entire site.

Acceptance Criteria:

A central theme configuration file is created to manage colors, fonts, and spacing for both a light and a dark mode.

The application's global styles are updated to use these theme variables.

Existing pages (Home, MatchDetails) are refactored to correctly apply the new theme variables without breaking functionality.

The default theme is set to light mode.

Story 2.2: Implement Theme Switching
As a user, I want to be able to switch between light and dark modes, so that I can use the application comfortably in different lighting conditions.

Acceptance Criteria:

A theme-switching toggle/button is present in the Navbar.

Clicking the toggle switches the entire application's color scheme between the defined light and dark themes.

The user's theme preference is saved and persists across browser sessions (e.g., using localStorage).

All interactive elements (buttons, links, search bars) are styled correctly and legibly in both modes.

Story 2.3: Correct API Data Fetching
As a user, I want to see all available soccer matches, so that I can get a complete overview of all betting opportunities.

Acceptance Criteria:

The data-fetching logic on the Home page is modified to retrieve all matches from the SportsDB API instead of a limited number.

The Home page correctly displays the full list of matches returned by the API.

The application handles the loading state gracefully while the full list of matches is being fetched.

Existing functionality, such as searching and navigating to match details, continues to work correctly with the full list.

Story 2.4: Create the Dashboard Page
As a user, I want to have a dashboard page, so that I have a central place for key information and actions.

Acceptance Criteria:

A new, blank Dashboard page is created at the /dashboard route.

The Dashboard page is accessible via a link in the Navbar.

The page correctly adopts the application's global styling and theming (light/dark mode).

The page includes placeholder sections for future content (e.g., "Featured Match", "My Predictions").