import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './Navbar';
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

// Helper function to render Navbar with ThemeProvider and Router
const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('light');
  });

  it('renders without crashing', () => {
    renderNavbar();
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('displays application title as link', () => {
    renderNavbar();
    const titleLink = screen.getByRole('link', { name: /bmad prediction engine/i });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute('href', '/');
  });

  it('displays navigation links', () => {
    renderNavbar();
    const homeLink = screen.getByRole('link', { name: /home/i });
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });

  it('contains ThemeSwitcher component', () => {
    renderNavbar();
    const themeSwitcher = screen.getByRole('switch');
    expect(themeSwitcher).toBeInTheDocument();
    expect(themeSwitcher).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('has proper layout structure', () => {
    renderNavbar();
    const nav = screen.getByRole('navigation');
    
    // Check for main container classes
    expect(nav).toHaveClass('w-full', 'bg-[var(--color-surface)]', 'border-b');
    
    // Check that title and theme switcher are in flex container
    const flexContainer = nav.querySelector('.flex.items-center.justify-between');
    expect(flexContainer).toBeInTheDocument();
  });

  it('integrates properly with theme switching', () => {
    renderNavbar();
    const themeSwitcher = screen.getByRole('switch');
    const titleLink = screen.getByRole('link', { name: /bmad prediction engine/i });
    
    // Initial state - light mode
    expect(themeSwitcher).toHaveAttribute('aria-pressed', 'false');
    
    // Toggle to dark mode
    fireEvent.click(themeSwitcher);
    
    // Should now be in dark mode
    expect(themeSwitcher).toHaveAttribute('aria-pressed', 'true');
    expect(themeSwitcher).toHaveAttribute('aria-label', 'Switch to light mode');
    
    // Title should still be present and styled
    expect(titleLink).toBeInTheDocument();
  });

  it('has responsive design classes', () => {
    renderNavbar();
    const nav = screen.getByRole('navigation');
    const titleLink = screen.getByRole('link', { name: /bmad prediction engine/i });
    
    // Check responsive padding classes on nav
    expect(nav).toHaveClass('px-4', 'py-3', 'sm:px-6', 'lg:px-8');
    
    // Check responsive text size classes on title
    expect(titleLink).toHaveClass('text-xl', 'sm:text-2xl');
  });

  it('maintains proper semantic structure', () => {
    renderNavbar();
    
    // Should have nav element
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    
    // Should have navigation links
    const homeLink = screen.getByRole('link', { name: /home/i });
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(homeLink).toBeInTheDocument();
    expect(dashboardLink).toBeInTheDocument();
    
    // Should have switch for theme toggle
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });
});