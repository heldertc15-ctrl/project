import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ThemeProvider } from '../hooks/useTheme';

import { vi } from 'vitest';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Helper function to render ThemeSwitcher with ThemeProvider
const renderThemeSwitcher = () => {
  return render(
    <ThemeProvider>
      <ThemeSwitcher />
    </ThemeProvider>
  );
};

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('light');
  });

  it('renders without crashing', () => {
    renderThemeSwitcher();
    const button = screen.getByRole('switch');
    expect(button).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    renderThemeSwitcher();
    const button = screen.getByRole('switch');
    
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveAttribute('role', 'switch');
  });

  it('displays sun icon in light mode', () => {
    renderThemeSwitcher();
    const button = screen.getByRole('switch');
    const svg = button.querySelector('svg');
    
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    
    // Check that there is a path element (sun icon)
    const path = button.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('toggles theme when clicked', () => {
    renderThemeSwitcher();
    const button = screen.getByRole('switch');
    
    // Initial state - light mode
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    
    // Click to toggle to dark mode
    fireEvent.click(button);
    
    // Should now be in dark mode
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    
    // Check that there is still a path element (moon icon)
    const path = button.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('updates localStorage when theme is toggled', () => {
    renderThemeSwitcher();
    const button = screen.getByRole('switch');
    
    // Click to toggle theme
    fireEvent.click(button);
    
    // Should save dark theme to localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('displays moon icon in dark mode', () => {
    // Start with dark theme
    mockLocalStorage.getItem.mockReturnValue('dark');
    
    renderThemeSwitcher();
    const button = screen.getByRole('switch');
    
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    
    // Check that there is a path element (moon icon)
    const path = button.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('has proper CSS classes for styling', () => {
    renderThemeSwitcher();
    const button = screen.getByRole('switch');
    
    expect(button).toHaveClass(
      'relative',
      'inline-flex',
      'h-8',
      'w-8',
      'items-center',
      'justify-center',
      'rounded-md',
      'border-2'
    );
  });
});