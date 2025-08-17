# Source Tree Integration

## Existing Project Structure

The current, relevant project structure is as follows:

```
src/
├── assets/
├── components/
├── pages/
├── styles/
├── App.js
└── index.js
```

## New File Organization

The following diagram shows where the new files and directories (marked with (+)) will be added to the existing structure.

```
src/
├── assets/
├── components/
│   ├── Card.js             # Will be modified for theming
│   ├── Container.js        # (+) New layout component
│   └── ThemeSwitcher.js    # (+) New component for light/dark mode
├── hooks/                  # (+) New directory for custom hooks
│   └── useTheme.js         # (+) Hook to manage theme state
├── pages/
│   ├── Dashboard.js        # (+) New page component
│   └── Home.js
├── services/               # (+) New directory for business logic
│   └── aiService.js        # (+) Placeholder for future AI logic
├── styles/
│   └── global.js
├── App.js
└── index.js
```

## Integration Guidelines

File Naming: All new components will follow the existing PascalCase.js convention.

Folder Organization: All new, reusable components will be placed in src/components/. Page-level components will go in src/pages/. Custom hooks will have their own src/hooks/ directory.

Import/Export Patterns: To maintain clean code, imports should use absolute paths from the src directory where possible (e.g., import Component from 'components/Component').