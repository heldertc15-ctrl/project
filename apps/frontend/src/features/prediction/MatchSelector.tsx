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
      console.error('Prediction request failed:', error);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Match</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading matches...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Match</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 text-sm font-medium">Error loading matches</div>
          </div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
          <button
            onClick={fetchMatches}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Match</h2>
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No upcoming matches available</div>
          <button
            onClick={fetchMatches}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Match</h2>
      
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
              relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${selectedMatch?.id === match.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-semibold text-gray-900">
                    {match.homeTeam}
                  </div>
                  <div className="text-gray-500 font-medium">vs</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {match.awayTeam}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {formatDateTime(match.startTime)}
                </div>
              </div>
              
              <div className="flex items-center">
                {selectedMatch?.id === match.id && (
                  <div className="text-blue-600 text-sm font-medium mr-3">
                    Selected
                  </div>
                )}
                <div className={`
                  w-4 h-4 rounded-full border-2 transition-all
                  ${selectedMatch?.id === match.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
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
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-800 text-sm font-medium">
              Match selected: {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
            </div>
            <div className="text-green-600 text-sm mt-1">
              Now choose your risk level and get your prediction
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Risk Level</h3>
            <div className="space-y-3">
              {(['Low', 'Medium', 'High'] as RiskLevel[]).map((riskLevel) => (
                <label
                  key={riskLevel}
                  className={`
                    flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedRiskLevel === riskLevel
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
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
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{riskLevel} Risk</div>
                    <div className="text-sm text-gray-600">
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
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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