import { useState, useEffect } from 'react';
import { apiClient, Match } from '../../services/apiClient';

type RiskLevel = 'Low' | 'Medium' | 'High';

interface MatchSelectorProps {
  onMatchSelect?: (match: Match) => void;
  onPredictionRequest?: (matchId: string, riskLevel: RiskLevel) => void;
}

export function MatchSelector({ onMatchSelect, onPredictionRequest }: MatchSelectorProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<RiskLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequestingPrediction, setIsRequestingPrediction] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedMatches = await apiClient.getMatches();
      setMatches(fetchedMatches);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch matches';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);
    onMatchSelect?.(match);
  };

  const handleRiskLevelSelect = (riskLevel: RiskLevel) => {
    setSelectedRiskLevel(riskLevel);
  };

  const handleGetPrediction = async () => {
    if (!selectedMatch || !selectedRiskLevel || isRequestingPrediction) {
      return;
    }

    setIsRequestingPrediction(true);
    try {
      await onPredictionRequest?.(selectedMatch.id, selectedRiskLevel);
    } catch (error) {
      // Log error for debugging but don't show to user as onPredictionRequest handles UI feedback
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Prediction request failed:', { error: errorMessage, matchId: selectedMatch.id, riskLevel: selectedRiskLevel });
    } finally {
      setIsRequestingPrediction(false);
    }
  };

  const isFormValid = selectedMatch && selectedRiskLevel && !isRequestingPrediction;

  const formatDateTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Date TBD';
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Date TBD';
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-theme-text mb-6">Select a Match</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
          <span className="ml-3 text-theme-text-secondary">Loading matches...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-theme-text mb-6">Select a Match</h2>
        <div className="bg-theme-error-bg border border-theme-error-border rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-theme-error-text text-sm font-medium">Error loading matches</div>
          </div>
          <div className="text-theme-error-text text-sm mt-1">{error}</div>
          <button
            onClick={fetchMatches}
            className="mt-3 bg-theme-error text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-theme-error transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-theme-text mb-6">Select a Match</h2>
        <div className="text-center py-12">
          <div className="text-theme-text-muted text-lg">No upcoming matches available</div>
          <button
            onClick={fetchMatches}
            className="mt-4 bg-theme-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-theme-primary-hover transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-theme-text mb-6">Select a Match</h2>
      
      <div className="space-y-3">
        {matches.map((match) => (
          <div
            key={match.id}
            onClick={() => handleMatchSelect(match)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMatchSelect(match);
              }
            }}
            aria-selected={selectedMatch?.id === match.id}
            aria-label={`Select match between ${match.homeTeam} and ${match.awayTeam}`}
            className={`
              relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2
              ${selectedMatch?.id === match.id
                ? 'border-theme-primary bg-theme-info-bg ring-2 ring-theme-info-border'
                : 'border-theme-border bg-theme-surface hover:border-theme-border-secondary'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-semibold text-theme-text">
                    {match.homeTeam}
                  </div>
                  <div className="text-theme-text-muted font-medium">vs</div>
                  <div className="text-lg font-semibold text-theme-text">
                    {match.awayTeam}
                  </div>
                </div>
                <div className="mt-2 text-sm text-theme-text-secondary">
                  {formatDateTime(match.startTime)}
                </div>
              </div>
              
              <div className="flex items-center">
                {selectedMatch?.id === match.id && (
                  <div className="text-theme-primary text-sm font-medium mr-3">
                    Selected
                  </div>
                )}
                <div className={`
                  w-4 h-4 rounded-full border-2 transition-all
                  ${selectedMatch?.id === match.id
                    ? 'border-theme-primary bg-theme-primary'
                    : 'border-theme-border'
                  }
                `}>
                  {selectedMatch?.id === match.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMatch && (
        <div className="mt-6 space-y-6">
          <div className="p-4 bg-theme-success-bg border border-theme-success-border rounded-lg">
            <div className="text-theme-success-text text-sm font-medium">
              Match selected: {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
            </div>
            <div className="text-theme-success-text text-sm mt-1">
              Now choose your risk level and get your prediction
            </div>
          </div>

          <div className="p-6 bg-theme-surface border border-theme-border rounded-lg">
            <h3 className="text-lg font-semibold text-theme-text mb-4">Choose Risk Level</h3>
            <div className="space-y-3">
              {(['Low', 'Medium', 'High'] as RiskLevel[]).map((riskLevel) => (
                <label
                  key={riskLevel}
                  className={`
                    flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedRiskLevel === riskLevel
                      ? 'border-theme-primary bg-theme-info-bg'
                      : 'border-theme-border hover:border-theme-border-secondary'
                    }
                    ${isRequestingPrediction ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    type="radio"
                    name="riskLevel"
                    value={riskLevel}
                    checked={selectedRiskLevel === riskLevel}
                    onChange={() => handleRiskLevelSelect(riskLevel)}
                    disabled={isRequestingPrediction}
                    className="h-4 w-4 text-theme-primary border-theme-border focus:ring-theme-primary"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-theme-text">{riskLevel} Risk</div>
                    <div className="text-sm text-theme-text-secondary">
                      {riskLevel === 'Low' && 'Conservative predictions with safer bets'}
                      {riskLevel === 'Medium' && 'Balanced approach with moderate risk'}
                      {riskLevel === 'High' && 'Aggressive predictions with higher potential returns'}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={handleGetPrediction}
              disabled={!isFormValid}
              className={`
                mt-6 w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center
                ${isFormValid
                  ? 'bg-theme-primary hover:bg-theme-primary-hover text-white'
                  : 'bg-theme-secondary text-theme-text-muted cursor-not-allowed'
                }
              `}
            >
              {isRequestingPrediction ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Getting Prediction...
                </>
              ) : (
                'Get Prediction'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}