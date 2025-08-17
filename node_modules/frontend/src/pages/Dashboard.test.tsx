import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../hooks/useTheme';
import { Dashboard } from './Dashboard';

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  it('renders the dashboard page correctly', () => {
    renderDashboard();
    
    // Check if main heading is present
    expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument();
    
    // Check if subtitle is present
    expect(screen.getByText(/your central hub for match insights and predictions/i)).toBeInTheDocument();
  });

  it('displays all placeholder sections', () => {
    renderDashboard();
    
    // Check for all placeholder sections by their exact text
    expect(screen.getByRole('heading', { name: 'Featured Match', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'My Predictions', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quick Stats', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recent Activity', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quick Actions', level: 2 })).toBeInTheDocument();
  });

  it('displays placeholder content for featured match section', () => {
    renderDashboard();
    
    expect(screen.getByText(/no featured match/i)).toBeInTheDocument();
    expect(screen.getByText(/featured matches will appear here when available/i)).toBeInTheDocument();
  });

  it('displays placeholder content for my predictions section', () => {
    renderDashboard();
    
    expect(screen.getByText(/no predictions yet/i)).toBeInTheDocument();
    expect(screen.getByText(/your prediction history will appear here/i)).toBeInTheDocument();
  });

  it('displays quick stats with default values', () => {
    renderDashboard();
    
    expect(screen.getByText('Total Predictions')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(1); // Total predictions count
    expect(screen.getByText('0%')).toBeInTheDocument(); // Success rate
  });

  it('displays placeholder content for recent activity section', () => {
    renderDashboard();
    
    expect(screen.getByText(/no recent activity/i)).toBeInTheDocument();
    expect(screen.getByText(/your recent activity will appear here/i)).toBeInTheDocument();
  });

  it('displays quick action buttons', () => {
    renderDashboard();
    
    expect(screen.getByRole('button', { name: /make prediction/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view all matches/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /prediction history/i })).toBeInTheDocument();
  });

  it('has proper responsive grid layout', () => {
    renderDashboard();
    
    // Check for grid container classes
    const gridContainer = screen.getByRole('heading', { name: /dashboard/i }).closest('div')?.nextElementSibling;
    expect(gridContainer).toHaveClass('grid');
    expect(gridContainer).toHaveClass('grid-cols-1');
    expect(gridContainer).toHaveClass('md:grid-cols-2');
    expect(gridContainer).toHaveClass('lg:grid-cols-3');
  });

  it('applies theme-aware styling classes', () => {
    renderDashboard();
    
    // Check for theme-aware background using CSS variables
    const mainContainer = screen.getByRole('heading', { name: /dashboard/i }).closest('.min-h-screen');
    expect(mainContainer).toHaveClass('bg-[var(--color-background)]');
  });

  it('uses semantic HTML structure', () => {
    renderDashboard();
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument(); // Main dashboard heading
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(5); // Section headings
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3); // Placeholder content headings (Featured Match, My Predictions, Recent Activity)
  });

  it('includes proper SVG icons for each section', () => {
    renderDashboard();
    
    // Count all SVG elements in the dashboard
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBe(8); // 5 section icons + 3 placeholder icons
  });

  it('has accessible button elements', () => {
    renderDashboard();
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('class');
    });
  });
});