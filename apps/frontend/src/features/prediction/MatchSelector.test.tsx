import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MatchSelector } from './MatchSelector';
import { apiClient, Match } from '../../services/apiClient';

// Mock the apiClient
vi.mock('../../services/apiClient', () => ({
  apiClient: {
    getMatches: vi.fn(),
    predict: vi.fn(),
  },
  Match: {},
}));

const mockMatches: Match[] = [
  {
    id: '1',
    homeTeam: 'Liverpool',
    awayTeam: 'Manchester City',
    startTime: '2025-08-20T15:00:00Z'
  },
  {
    id: '2',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    startTime: '2025-08-21T17:30:00Z'
  }
];

describe('MatchSelector', () => {
  const mockOnMatchSelect = vi.fn();
  const mockOnPredictionRequest = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', async () => {
    vi.mocked(apiClient.getMatches).mockImplementation(
      () => new Promise<Match[]>(() => {}) // Never resolves to keep loading state
    );

    render(<MatchSelector onMatchSelect={mockOnMatchSelect} />);

    expect(screen.getByText('Loading matches...')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Select a Match' })).toBeInTheDocument();
  });

  it('should display matches when loaded successfully', async () => {
    vi.mocked(apiClient.getMatches).mockResolvedValue(mockMatches);

    render(<MatchSelector onMatchSelect={mockOnMatchSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Liverpool')).toBeInTheDocument();
      expect(screen.getByText('Manchester City')).toBeInTheDocument();
      expect(screen.getByText('Arsenal')).toBeInTheDocument();
      expect(screen.getByText('Chelsea')).toBeInTheDocument();
    });

    expect(screen.queryByText('Loading matches...')).not.toBeInTheDocument();
  });

  it('should display error state when fetch fails', async () => {
    const errorMessage = 'Failed to fetch matches';
    vi.mocked(apiClient.getMatches).mockRejectedValue(new Error(errorMessage));

    render(<MatchSelector onMatchSelect={mockOnMatchSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Error loading matches')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should display no matches message when empty array returned', async () => {
    vi.mocked(apiClient.getMatches).mockResolvedValue([]);

    render(<MatchSelector onMatchSelect={mockOnMatchSelect} />);

    await waitFor(() => {
      expect(screen.getByText('No upcoming matches available')).toBeInTheDocument();
    });

    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('should allow match selection and call onMatchSelect', async () => {
    vi.mocked(apiClient.getMatches).mockResolvedValue(mockMatches);

    render(<MatchSelector onMatchSelect={mockOnMatchSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Liverpool')).toBeInTheDocument();
    });

    // Click on the first match
    const firstMatch = screen.getByText('Liverpool').closest('div');
    fireEvent.click(firstMatch!);

    expect(mockOnMatchSelect).toHaveBeenCalledWith(mockMatches[0]);
    expect(screen.getByText('Selected')).toBeInTheDocument();
    expect(screen.getByText('Match selected: Liverpool vs Manchester City')).toBeInTheDocument();
  });

  it('should retry fetching matches when Try Again is clicked', async () => {
    vi.mocked(apiClient.getMatches)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockMatches);

    render(<MatchSelector onMatchSelect={mockOnMatchSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Try Again'));

    await waitFor(() => {
      expect(screen.getByText('Liverpool')).toBeInTheDocument();
    });

    expect(vi.mocked(apiClient.getMatches)).toHaveBeenCalledTimes(2);
  });

  it('should format date and time correctly', async () => {
    const matchWithTime: Match[] = [{
      id: '1',
      homeTeam: 'Liverpool',
      awayTeam: 'Manchester City',
      startTime: '2025-08-20T15:30:00Z'
    }];

    vi.mocked(apiClient.getMatches).mockResolvedValue(matchWithTime);

    render(<MatchSelector onMatchSelect={mockOnMatchSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Liverpool')).toBeInTheDocument();
    });

    // Check that some date/time text is displayed
    // Note: Exact format depends on locale, so we just check for presence
    const dateTimeElement = screen.getByText(/Wed|Thu|Fri|Sat|Sun|Mon|Tue/);
    expect(dateTimeElement).toBeInTheDocument();
  });

  it('should handle invalid date gracefully', async () => {
    const matchWithInvalidDate: Match[] = [{
      id: '1',
      homeTeam: 'Liverpool',
      awayTeam: 'Manchester City',
      startTime: 'invalid-date'
    }];

    vi.mocked(apiClient.getMatches).mockResolvedValue(matchWithInvalidDate);

    render(<MatchSelector onMatchSelect={mockOnMatchSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Liverpool')).toBeInTheDocument();
    });

    expect(screen.getByText('Date TBD')).toBeInTheDocument();
  });

  describe('Risk Level Selection and Prediction Request', () => {
    beforeEach(() => {
      vi.mocked(apiClient.getMatches).mockResolvedValue(mockMatches);
    });

    it('should show risk level selection after match is selected', async () => {
      render(<MatchSelector onMatchSelect={mockOnMatchSelect} onPredictionRequest={mockOnPredictionRequest} />);

      await waitFor(() => {
        expect(screen.getByText('Liverpool')).toBeInTheDocument();
      });

      // Select a match
      const firstMatch = screen.getByText('Liverpool').closest('div');
      fireEvent.click(firstMatch!);

      // Should show risk level selection
      expect(screen.getByText('Choose Risk Level')).toBeInTheDocument();
      expect(screen.getByText('Low Risk')).toBeInTheDocument();
      expect(screen.getByText('Medium Risk')).toBeInTheDocument();
      expect(screen.getByText('High Risk')).toBeInTheDocument();
    });

    it('should enable Get Prediction button only when both match and risk level are selected', async () => {
      render(<MatchSelector onMatchSelect={mockOnMatchSelect} onPredictionRequest={mockOnPredictionRequest} />);

      await waitFor(() => {
        expect(screen.getByText('Liverpool')).toBeInTheDocument();
      });

      // Select a match
      const firstMatch = screen.getByText('Liverpool').closest('div');
      fireEvent.click(firstMatch!);

      // Button should be disabled initially
      const getPredictionButton = screen.getByText('Get Prediction');
      expect(getPredictionButton).toBeDisabled();

      // Select risk level
      const lowRiskOption = screen.getByDisplayValue('Low');
      fireEvent.click(lowRiskOption);

      // Button should now be enabled
      expect(getPredictionButton).toBeEnabled();
    });

    it('should call onPredictionRequest with correct parameters when Get Prediction is clicked', async () => {
      render(<MatchSelector onMatchSelect={mockOnMatchSelect} onPredictionRequest={mockOnPredictionRequest} />);

      await waitFor(() => {
        expect(screen.getByText('Liverpool')).toBeInTheDocument();
      });

      // Select a match
      const firstMatch = screen.getByText('Liverpool').closest('div');
      fireEvent.click(firstMatch!);

      // Select risk level
      const mediumRiskOption = screen.getByDisplayValue('Medium');
      fireEvent.click(mediumRiskOption);

      // Click Get Prediction button
      const getPredictionButton = screen.getByText('Get Prediction');
      fireEvent.click(getPredictionButton);

      expect(mockOnPredictionRequest).toHaveBeenCalledWith('1', 'Medium');
    });

    it('should show loading state while prediction request is in progress', async () => {
      const mockSlowPredictionRequest = vi.fn().mockImplementation(
        () => new Promise<void>(() => {}) // Never resolves to keep loading state
      );

      render(<MatchSelector onMatchSelect={mockOnMatchSelect} onPredictionRequest={mockSlowPredictionRequest} />);

      await waitFor(() => {
        expect(screen.getByText('Liverpool')).toBeInTheDocument();
      });

      // Select match and risk level
      const firstMatch = screen.getByText('Liverpool').closest('div');
      fireEvent.click(firstMatch!);
      
      const highRiskOption = screen.getByDisplayValue('High');
      fireEvent.click(highRiskOption);

      // Click Get Prediction button
      const getPredictionButton = screen.getByText('Get Prediction');
      fireEvent.click(getPredictionButton);

      // Should show loading state
      expect(screen.getByText('Getting Prediction...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Getting Prediction/i })).toBeDisabled();
    });

    it('should disable form interactions while prediction request is in progress', async () => {
      const mockSlowPredictionRequest = vi.fn().mockImplementation(
        () => new Promise<void>(() => {}) // Never resolves to keep loading state
      );

      render(<MatchSelector onMatchSelect={mockOnMatchSelect} onPredictionRequest={mockSlowPredictionRequest} />);

      await waitFor(() => {
        expect(screen.getByText('Liverpool')).toBeInTheDocument();
      });

      // Select match and risk level
      const firstMatch = screen.getByText('Liverpool').closest('div');
      fireEvent.click(firstMatch!);
      
      const lowRiskOption = screen.getByDisplayValue('Low');
      fireEvent.click(lowRiskOption);

      // Click Get Prediction button
      const getPredictionButton = screen.getByText('Get Prediction');
      fireEvent.click(getPredictionButton);

      // Risk level options should be disabled
      expect(screen.getByDisplayValue('Low')).toBeDisabled();
      expect(screen.getByDisplayValue('Medium')).toBeDisabled();
      expect(screen.getByDisplayValue('High')).toBeDisabled();
    });

    it('should handle prediction request errors gracefully', async () => {
      const mockFailingPredictionRequest = vi.fn().mockRejectedValue(new Error('Prediction failed'));

      render(<MatchSelector onMatchSelect={mockOnMatchSelect} onPredictionRequest={mockFailingPredictionRequest} />);

      await waitFor(() => {
        expect(screen.getByText('Liverpool')).toBeInTheDocument();
      });

      // Select match and risk level
      const firstMatch = screen.getByText('Liverpool').closest('div');
      fireEvent.click(firstMatch!);
      
      const lowRiskOption = screen.getByDisplayValue('Low');
      fireEvent.click(lowRiskOption);

      // Click Get Prediction button
      const getPredictionButton = screen.getByText('Get Prediction');
      fireEvent.click(getPredictionButton);

      // Wait for the error to be handled and loading state to end
      await waitFor(() => {
        expect(screen.getByText('Get Prediction')).toBeInTheDocument();
      });

      // Button should be enabled again after error
      expect(getPredictionButton).toBeEnabled();
    });

    it('should prevent multiple simultaneous prediction requests', async () => {
      render(<MatchSelector onMatchSelect={mockOnMatchSelect} onPredictionRequest={mockOnPredictionRequest} />);

      await waitFor(() => {
        expect(screen.getByText('Liverpool')).toBeInTheDocument();
      });

      // Select match and risk level
      const firstMatch = screen.getByText('Liverpool').closest('div');
      fireEvent.click(firstMatch!);
      
      const lowRiskOption = screen.getByDisplayValue('Low');
      fireEvent.click(lowRiskOption);

      // Click Get Prediction button multiple times rapidly
      const getPredictionButton = screen.getByText('Get Prediction');
      fireEvent.click(getPredictionButton);
      fireEvent.click(getPredictionButton);
      fireEvent.click(getPredictionButton);

      // Should only be called once
      expect(mockOnPredictionRequest).toHaveBeenCalledTimes(1);
    });
  });
});