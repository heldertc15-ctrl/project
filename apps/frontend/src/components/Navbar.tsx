import { Link, useLocation } from 'react-router-dom';
import { ThemeSwitcher } from './ThemeSwitcher';

export function Navbar() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        {/* Application Title/Branding */}
        <div className="flex items-center">
          <Link to="/" className="text-xl font-semibold text-[var(--color-text)] sm:text-2xl hover:text-[var(--color-primary)] transition-colors">
            BMAD Prediction Engine
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden sm:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-[var(--color-primary)] ${
              isActive('/') 
                ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] pb-1' 
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/dashboard" 
            className={`text-sm font-medium transition-colors hover:text-[var(--color-primary)] ${
              isActive('/dashboard') 
                ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] pb-1' 
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            Dashboard
          </Link>
        </div>

        {/* Mobile Navigation & Theme Switcher */}
        <div className="flex items-center space-x-4">
          {/* Mobile Navigation Menu */}
          <div className="sm:hidden">
            <select 
              value={location.pathname} 
              onChange={(e) => window.location.href = e.target.value}
              className="bg-[var(--color-surface-secondary)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md px-2 py-1 text-sm"
            >
              <option value="/">Home</option>
              <option value="/dashboard">Dashboard</option>
            </select>
          </div>
          
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}