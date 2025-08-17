# Component Architecture

## New Components

### useTheme Hook

Responsibility: A custom React Hook to manage the application's theme. It will provide the current theme (light or dark) and a function to toggle it.

Integration Points: It will be consumed by the ThemeSwitcher component and any other component that needs to be theme-aware. It will be created in a new src/hooks/ directory.

Technology Stack: React.

### ThemeSwitcher Component

Responsibility: A UI component (likely a button or toggle switch) that allows the user to change the theme. It will use the useTheme hook to perform this action.

Integration Points: This component will be placed inside the existing src/components/Navbar.js component.

Technology Stack: React, Tailwind CSS.

### DashboardPage Component

Responsibility: A new page component that will serve as the main dashboard. Initially, it will contain a basic layout with placeholder sections.

Integration Points: It will be added as a new route in the main router within src/App.js.

Technology Stack: React, Tailwind CSS.

### Layout Components (Container, Card)

Responsibility: To create a more "familiar" and less "naked" feel, we will create a generic Container component for consistent page layout (e.g., max-width and padding). The existing Card component will be enhanced to be fully theme-aware using the new theming system.

Integration Points: The Container will be used in HomePage and DashboardPage. The updated Card will be used on the HomePage to display match listings.

Technology Stack: React, Tailwind CSS.

## Component Interaction Diagram

This diagram shows how the new and existing components will interact.

Code snippet

```
graph TD
    subgraph App.js (Router)
        Navbar --> ThemeSwitcher;
        subgraph "Current Page"
            DashboardPage;
        end
    end

    subgraph Global Theme
        useTheme_Hook;
    end

    ThemeSwitcher -- calls --> useTheme_Hook;
    DashboardPage -- uses --> Container;
    DashboardPage -- uses --> Card_Component;
    Container -- styled by --> useTheme_Hook;
    Card_Component -- styled by --> useTheme_Hook;
```