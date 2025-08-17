# Technical Constraints and Integration Requirements

## Existing Technology Stack

The existing technology stack, as identified in the architecture analysis, will be adhered to.

**Languages:** JavaScript

**Frameworks:** React (v18.2.0), Tailwind CSS, Styled-Components

**External Dependencies:** react-router-dom for routing.

## Integration Approach

**Database Integration Strategy:** Not applicable. The application is currently client-side only and does not have its own database.

**API Integration Strategy:** The application will continue to fetch data directly from the external SportsDB API. The bug in the data-fetching logic will be corrected. Future AI-related features will require a new integration strategy, to be defined in the architecture phase.

**Frontend Integration Strategy:** The new Dashboard page will be added to the existing react-router-dom configuration. The light/dark mode will be implemented using a global theme context that modifies CSS variables consumed by Tailwind CSS.

**Testing Integration Strategy:** New unit tests will be written for all new components and logic using the existing Testing Library setup.

## Code Organization and Standards

**File Structure Approach:** New components and pages will be created in their respective directories (src/components/, src/pages/) following the existing structure. A new src/hooks/ directory will be created for custom hooks (e.g., useTheme).

**Styling Standards:** To resolve the current inconsistency, all new components will be styled using Tailwind CSS.