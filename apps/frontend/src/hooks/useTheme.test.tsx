import { renderHook, act, render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme, themeConfigs } from './useTheme';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Helper component for testing
function TestComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <div>
      <div data-testid="theme-mode">{theme.mode}</div>
      <div data-testid="theme-primary-color">{theme.config.colors.primary}</div>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
    </div>
  );
}

describe('useTheme hook', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.clear.mockClear();
    
    // Mock console.warn to suppress expected warnings in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw error when used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleError.mockRestore();
  });

  it('should initialize with light theme as default', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    expect(screen.getByTestId('theme-primary-color')).toHaveTextContent(themeConfigs.light.colors.primary);
  });

  it('should load saved theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('theme-primary-color')).toHaveTextContent(themeConfigs.dark.colors.primary);
  });

  it('should ignore invalid theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('invalid-theme');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
  });

  it('should handle localStorage errors gracefully during load', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    expect(console.warn).toHaveBeenCalledWith('Failed to load theme preference from localStorage:', expect.any(Error));
  });

  it('should toggle theme between light and dark', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Start with light theme
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');

    // Toggle to dark
    act(() => {
      screen.getByTestId('toggle-theme').click();
    });
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');

    // Toggle back to light
    act(() => {
      screen.getByTestId('toggle-theme').click();
    });
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
  });

  it('should set specific theme modes', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Set to dark
    act(() => {
      screen.getByTestId('set-dark').click();
    });
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');

    // Set to light
    act(() => {
      screen.getByTestId('set-light').click();
    });
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
  });

  it('should ignore invalid theme mode when setting', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      // @ts-expect-error Testing invalid mode handling
      result.current.setTheme('invalid-mode');
    });

    // Should remain light (default)
    expect(result.current.theme.mode).toBe('light');
  });

  it('should save theme to localStorage when changed', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    act(() => {
      screen.getByTestId('toggle-theme').click();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should handle localStorage errors gracefully during save', () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    act(() => {
      screen.getByTestId('toggle-theme').click();
    });

    expect(console.warn).toHaveBeenCalledWith('Failed to save theme preference to localStorage:', expect.any(Error));
  });

  it('should provide correct theme configuration for light mode', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme.mode).toBe('light');
    expect(result.current.theme.config).toEqual(themeConfigs.light);
  });

  it('should provide correct theme configuration for dark mode', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme.mode).toBe('dark');
    expect(result.current.theme.config).toEqual(themeConfigs.dark);
  });

  it('should have all required theme properties', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    // Check that theme object has correct structure
    expect(result.current.theme).toHaveProperty('mode');
    expect(result.current.theme).toHaveProperty('config');
    
    // Check config properties
    const config = result.current.theme.config;
    expect(config).toHaveProperty('colors');
    expect(config).toHaveProperty('fonts');
    expect(config).toHaveProperty('spacing');
    
    // Check essential color properties
    expect(config.colors).toHaveProperty('primary');
    expect(config.colors).toHaveProperty('background');
    expect(config.colors).toHaveProperty('text');
    expect(config.colors).toHaveProperty('surface');
    
    // Check functions are available
    expect(typeof result.current.toggleTheme).toBe('function');
    expect(typeof result.current.setTheme).toBe('function');
  });
});