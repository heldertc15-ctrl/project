import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { apiClient } from './services/apiClient';

// Mock the API client
vi.mock('./services/apiClient', () => ({
  apiClient: {
    getMatches: vi.fn(),
    predict: vi.fn(),
  },
}));

const mockMatches = [
  {
    id: '1',
    homeTeam: 'Liverpool',
    awayTeam: 'Manchester City',
    startTime: '2025-08-17T15:00:00Z',
  },
];

const mockPredictionResult = {
  betSuggestion: 'Liverpool to win',
  rationale: 'Liverpool has strong home form and key players are fit',
  riskLevel: 'Medium' as const,
};

describe('App - Prediction Result Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.getMatches as any).mockResolvedValue(mockMatches);
  });

  it('displays prediction result with proper formatting', async () => {
    (apiClient.predict as any).mockResolvedValue(mockPredictionResult);

    render(<App />);

    // Wait for matches to load and select first match
    await waitFor(() => {
      expect(screen.getByText('Liverpool')).toBeInTheDocument();
      expect(screen.getByText('Manchester City')).toBeInTheDocument();
    });

    // Select match and make prediction
    const matchButton = screen.getByLabelText('Select match between Liverpool and Manchester City');
    fireEvent.click(matchButton);

    const mediumRiskButton = screen.getByText('Medium Risk');
    fireEvent.click(mediumRiskButton);

    const predictButton = screen.getByText('Get Prediction');
    fireEvent.click(predictButton);

    // Wait for prediction result
    await waitFor(() => {
      expect(screen.getByText('Prediction Result')).toBeInTheDocument();
    });

    // Verify result display elements
    expect(screen.getByText('Liverpool vs Manchester City')).toBeInTheDocument();
    expect(screen.getByText('Risk Level: Medium')).toBeInTheDocument();
    expect(screen.getByText('Recommended Bet')).toBeInTheDocument();
    expect(screen.getByText('Liverpool to win')).toBeInTheDocument();
    expect(screen.getByText('AI Analysis')).toBeInTheDocument();
    expect(screen.getByText('Liverpool has strong home form and key players are fit')).toBeInTheDocument();
  });

  it('displays formatted start time when available', async () => {
    (apiClient.predict as any).mockResolvedValue(mockPredictionResult);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Liverpool')).toBeInTheDocument();
      expect(screen.getByText('Manchester City')).toBeInTheDocument();
    });

    const matchButton = screen.getByLabelText('Select match between Liverpool and Manchester City');
    fireEvent.click(matchButton);

    const mediumRiskButton = screen.getByText('Medium Risk');
    fireEvent.click(mediumRiskButton);

    const predictButton = screen.getByText('Get Prediction');
    fireEvent.click(predictButton);

    await waitFor(() => {
      expect(screen.getByText('Prediction Result')).toBeInTheDocument();
    });

    // Check for formatted date display
    const dateText = new Date(mockMatches[0].startTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    expect(screen.getByText(dateText)).toBeInTheDocument();
  });

  it('handles restart functionality correctly', async () => {
    (apiClient.predict as any).mockResolvedValue(mockPredictionResult);

    render(<App />);

    // Complete prediction flow
    await waitFor(() => {
      expect(screen.getByText('Liverpool')).toBeInTheDocument();
      expect(screen.getByText('Manchester City')).toBeInTheDocument();
    });

    const matchButton = screen.getByLabelText('Select match between Liverpool and Manchester City');
    fireEvent.click(matchButton);

    const mediumRiskButton = screen.getByText('Medium Risk');
    fireEvent.click(mediumRiskButton);

    const predictButton = screen.getByText('Get Prediction');
    fireEvent.click(predictButton);

    await waitFor(() => {
      expect(screen.getByText('Prediction Result')).toBeInTheDocument();
    });

    // Click restart button
    const restartButton = screen.getByText('Make Another Prediction');
    fireEvent.click(restartButton);

    // Verify we're back to match selection
    await waitFor(() => {
      expect(screen.getByText('Select a match to get AI-powered betting predictions')).toBeInTheDocument();
    });
  });

  it('handles missing prediction data gracefully', async () => {
    const incompletePrediction = {
      betSuggestion: '',
      rationale: '',
      riskLevel: 'Medium' as const,
    };
    (apiClient.predict as any).mockResolvedValue(incompletePrediction);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Liverpool')).toBeInTheDocument();
      expect(screen.getByText('Manchester City')).toBeInTheDocument();
    });

    const matchButton = screen.getByLabelText('Select match between Liverpool and Manchester City');
    fireEvent.click(matchButton);

    const mediumRiskButton = screen.getByText('Medium Risk');
    fireEvent.click(mediumRiskButton);

    const predictButton = screen.getByText('Get Prediction');
    fireEvent.click(predictButton);

    await waitFor(() => {
      expect(screen.getByText('Prediction Result')).toBeInTheDocument();
    });

    // Verify fallback text is displayed
    expect(screen.getByText('No betting suggestion available')).toBeInTheDocument();
    expect(screen.getByText('No analysis available')).toBeInTheDocument();
  });

  it('handles prediction API errors', async () => {
    (apiClient.predict as any).mockRejectedValue(new Error('Prediction service unavailable'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Liverpool')).toBeInTheDocument();
      expect(screen.getByText('Manchester City')).toBeInTheDocument();
    });

    const matchButton = screen.getByLabelText('Select match between Liverpool and Manchester City');
    fireEvent.click(matchButton);

    const mediumRiskButton = screen.getByText('Medium Risk');
    fireEvent.click(mediumRiskButton);

    const predictButton = screen.getByText('Get Prediction');
    fireEvent.click(predictButton);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Prediction Failed')).toBeInTheDocument();
    });

    expect(screen.getByText('Prediction service unavailable')).toBeInTheDocument();
  });

  it('maintains responsive design classes', async () => {
    (apiClient.predict as any).mockResolvedValue(mockPredictionResult);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Liverpool')).toBeInTheDocument();
      expect(screen.getByText('Manchester City')).toBeInTheDocument();
    });

    const matchButton = screen.getByLabelText('Select match between Liverpool and Manchester City');
    fireEvent.click(matchButton);

    const mediumRiskButton = screen.getByText('Medium Risk');
    fireEvent.click(mediumRiskButton);

    const predictButton = screen.getByText('Get Prediction');
    fireEvent.click(predictButton);

    await waitFor(() => {
      expect(screen.getByText('Prediction Result')).toBeInTheDocument();
    });

    // Check for responsive classes
    const container = screen.getByText('Prediction Result').closest('.bg-white');
    expect(container).toHaveClass('rounded-xl', 'shadow-xl');
    
    const headerSection = screen.getByText('Prediction Result').closest('.bg-gradient-to-r');
    expect(headerSection).toHaveClass('from-blue-600', 'to-blue-700');
  });

  it('displays all required contextual information', async () => {
    (apiClient.predict as any).mockResolvedValue(mockPredictionResult);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Liverpool')).toBeInTheDocument();
      expect(screen.getByText('Manchester City')).toBeInTheDocument();
    });

    const matchButton = screen.getByLabelText('Select match between Liverpool and Manchester City');
    fireEvent.click(matchButton);

    const highRiskButton = screen.getByText('High Risk');
    fireEvent.click(highRiskButton);

    const predictButton = screen.getByText('Get Prediction');
    fireEvent.click(predictButton);

    await waitFor(() => {
      expect(screen.getByText('Prediction Result')).toBeInTheDocument();
    });

    // Verify all contextual information is displayed
    expect(screen.getByText('Liverpool vs Manchester City')).toBeInTheDocument();
    expect(screen.getByText('Risk Level: High')).toBeInTheDocument();
    
    // Verify match start time is displayed
    const expectedDate = new Date(mockMatches[0].startTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });
});