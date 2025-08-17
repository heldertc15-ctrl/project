# Epic and Story Structure

## Epic 2: UI Modernization and Core Functionality Enhancement

**Epic Goal:** To transform the application's user experience by implementing a modern, "familiar" UI with light/dark modes, introduce a new dashboard, and correct the core data-fetching functionality to ensure the application is both fully functional and visually engaging.

### Story 1.1: Establish Theming Foundation

As a user, I want the application to have a foundational theming system, so that a consistent look and feel can be applied across the entire site.

**Acceptance Criteria:**

A central theme configuration file is created to manage colors, fonts, and spacing for both a light and a dark mode.

The application's global styles are updated to use these theme variables.

Existing pages (Home, MatchDetails) are refactored to correctly apply the new theme variables without breaking functionality.

The default theme is set to light mode.

### Story 1.2: Implement Theme Switching

As a user, I want to be able to switch between light and dark modes, so that I can use the application comfortably in different lighting conditions.

**Acceptance Criteria:**

A theme-switching toggle/button is present in the Navbar.

Clicking the toggle switches the entire application's color scheme between the defined light and dark themes.

The user's theme preference is saved and persists across browser sessions (e.g., using localStorage).

All interactive elements (buttons, links, search bars) are styled correctly and legibly in both modes.

### Story 1.3: Correct API Data Fetching

As a user, I want to see all available soccer matches, so that I can get a complete overview of all betting opportunities.

**Acceptance Criteria:**

The data-fetching logic on the Home page is modified to retrieve all matches from the SportsDB API instead of a limited number.

The Home page correctly displays the full list of matches returned by the API.

The application handles the loading state gracefully while the full list of matches is being fetched.

Existing functionality, such as searching and navigating to match details, continues to work correctly with the full list.

### Story 1.4: Create the Dashboard Page

As a user, I want to have a dashboard page, so that I have a central place for key information and actions.

**Acceptance Criteria:**

A new, blank Dashboard page is created at the /dashboard route.

The Dashboard page is accessible via a link in the Navbar.

The page correctly adopts the application's global styling and theming (light/dark mode).

The page includes placeholder sections for future content (e.g., "Featured Match", "My Predictions").