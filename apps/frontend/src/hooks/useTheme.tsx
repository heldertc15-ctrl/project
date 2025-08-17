import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// Comprehensive type definitions for theme system
type ThemeMode = 'light' | 'dark';

interface ThemeColors {
  readonly primary: string;
  readonly primaryHover: string;
  readonly secondary: string;
  readonly background: string;
  readonly surface: string;
  readonly surfaceSecondary: string;
  readonly text: string;
  readonly textSecondary: string;
  readonly textMuted: string;
  readonly border: string;
  readonly borderSecondary: string;
  readonly success: string;
  readonly successBg: string;
  readonly successBorder: string;
  readonly successText: string;
  readonly error: string;
  readonly errorBg: string;
  readonly errorBorder: string;
  readonly errorText: string;
  readonly warning: string;
  readonly warningBg: string;
  readonly warningBorder: string;
  readonly warningText: string;
  readonly info: string;
  readonly infoBg: string;
  readonly infoBorder: string;
  readonly infoText: string;
}

interface ThemeFonts {
  readonly family: string;
  readonly sizes: Record<string, string>;
}

interface ThemeSpacing extends Record<string, string> {}

interface ThemeConfig {
  readonly colors: ThemeColors;
  readonly fonts: ThemeFonts;
  readonly spacing: ThemeSpacing;
}

interface Theme {
  readonly mode: ThemeMode;
  readonly config: ThemeConfig;
}

interface ThemeContextType {
  readonly theme: Theme;
  readonly toggleTheme: () => void;
  readonly setTheme: (mode: ThemeMode) => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

// Theme configuration with comprehensive variables for both light and dark modes
const themeConfigs = {
  light: {
    colors: {
      primary: 'rgb(37, 99, 235)', // blue-600
      primaryHover: 'rgb(29, 78, 216)', // blue-700
      secondary: 'rgb(107, 114, 128)', // gray-500
      background: 'rgb(243, 244, 246)', // gray-100
      surface: 'rgb(255, 255, 255)', // white
      surfaceSecondary: 'rgb(249, 250, 251)', // gray-50
      text: 'rgb(17, 24, 39)', // gray-900
      textSecondary: 'rgb(75, 85, 99)', // gray-600
      textMuted: 'rgb(107, 114, 128)', // gray-500
      border: 'rgb(209, 213, 219)', // gray-300
      borderSecondary: 'rgb(229, 231, 235)', // gray-200
      success: 'rgb(34, 197, 94)', // green-500
      successBg: 'rgb(240, 253, 244)', // green-50
      successBorder: 'rgb(187, 247, 208)', // green-200
      successText: 'rgb(21, 128, 61)', // green-700
      error: 'rgb(239, 68, 68)', // red-500
      errorBg: 'rgb(254, 242, 242)', // red-50
      errorBorder: 'rgb(254, 202, 202)', // red-200
      errorText: 'rgb(185, 28, 28)', // red-700
      warning: 'rgb(245, 158, 11)', // amber-500
      warningBg: 'rgb(255, 251, 235)', // amber-50
      warningBorder: 'rgb(253, 230, 138)', // amber-200
      warningText: 'rgb(146, 64, 14)', // amber-800
      info: 'rgb(59, 130, 246)', // blue-500
      infoBg: 'rgb(239, 246, 255)', // blue-50
      infoBorder: 'rgb(191, 219, 254)', // blue-200
      infoText: 'rgb(30, 64, 175)', // blue-800
    },
    fonts: {
      family: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
      sizes: {
        xs: '0.75rem', // 12px
        sm: '0.875rem', // 14px
        base: '1rem', // 16px
        lg: '1.125rem', // 18px
        xl: '1.25rem', // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
      },
    },
    spacing: {
      xs: '0.25rem', // 4px
      sm: '0.5rem', // 8px
      md: '1rem', // 16px
      lg: '1.5rem', // 24px
      xl: '2rem', // 32px
      '2xl': '3rem', // 48px
      '3xl': '4rem', // 64px
    },
  },
  dark: {
    colors: {
      primary: 'rgb(59, 130, 246)', // blue-500
      primaryHover: 'rgb(37, 99, 235)', // blue-600
      secondary: 'rgb(156, 163, 175)', // gray-400
      background: 'rgb(17, 24, 39)', // gray-900
      surface: 'rgb(31, 41, 55)', // gray-800
      surfaceSecondary: 'rgb(55, 65, 81)', // gray-700
      text: 'rgb(243, 244, 246)', // gray-100
      textSecondary: 'rgb(209, 213, 219)', // gray-300
      textMuted: 'rgb(156, 163, 175)', // gray-400
      border: 'rgb(75, 85, 99)', // gray-600
      borderSecondary: 'rgb(55, 65, 81)', // gray-700
      success: 'rgb(34, 197, 94)', // green-500
      successBg: 'rgb(20, 83, 45)', // green-900
      successBorder: 'rgb(34, 197, 94)', // green-500
      successText: 'rgb(187, 247, 208)', // green-200
      error: 'rgb(239, 68, 68)', // red-500
      errorBg: 'rgb(127, 29, 29)', // red-900
      errorBorder: 'rgb(239, 68, 68)', // red-500
      errorText: 'rgb(254, 202, 202)', // red-200
      warning: 'rgb(245, 158, 11)', // amber-500
      warningBg: 'rgb(120, 53, 15)', // amber-900
      warningBorder: 'rgb(245, 158, 11)', // amber-500
      warningText: 'rgb(253, 230, 138)', // amber-200
      info: 'rgb(59, 130, 246)', // blue-500
      infoBg: 'rgb(30, 58, 138)', // blue-900
      infoBorder: 'rgb(59, 130, 246)', // blue-500
      infoText: 'rgb(191, 219, 254)', // blue-200
    },
    fonts: {
      family: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
      sizes: {
        xs: '0.75rem', // 12px
        sm: '0.875rem', // 14px
        base: '1rem', // 16px
        lg: '1.125rem', // 18px
        xl: '1.25rem', // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
      },
    },
    spacing: {
      xs: '0.25rem', // 4px
      sm: '0.5rem', // 8px
      md: '1rem', // 16px
      lg: '1.5rem', // 24px
      xl: '2rem', // 32px
      '2xl': '3rem', // 48px
      '3xl': '4rem', // 64px
    },
  },
};

// Create Theme Context
const ThemeContext = createContext<ThemeContextType | null>(null);

// Theme Provider Component
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Default to light mode

  // Load theme preference from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
      }
    } catch (error) {
      // Handle localStorage errors gracefully (e.g., in private browsing mode)
      console.warn('Failed to load theme preference from localStorage:', error);
    }
  }, []);

  // Save theme preference to localStorage when theme changes
  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      // Handle localStorage errors gracefully
      console.warn('Failed to save theme preference to localStorage:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const setThemeMode = (mode: ThemeMode) => {
    if (mode === 'light' || mode === 'dark') {
      setTheme(mode);
    }
  };

  const currentThemeConfig = themeConfigs[theme];

  const value = {
    theme: {
      mode: theme,
      config: currentThemeConfig,
    },
    toggleTheme,
    setTheme: setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// Export theme configurations for external use
export { themeConfigs };