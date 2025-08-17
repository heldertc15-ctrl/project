import { useState } from 'react';
import { MatchSelector } from './features/prediction/MatchSelector';
import { Match, apiClient, PredictionResult } from './services/apiClient';

type WorkflowStep = 'selection' | 'loading' | 'result' | 'error';
type RiskLevel = 'Low' | 'Medium' | 'High';

function App() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('selection');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<RiskLevel | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);
    console.log('Selected match:', match);
  };

  const handlePredictionRequest = async (matchId: string, riskLevel: RiskLevel) => {
    try {
      setCurrentStep('loading');
      setSelectedRiskLevel(riskLevel);
      setError(null);
      
      const result = await apiClient.predict({ matchId, riskLevel });
      setPredictionResult(result);
      setCurrentStep('result');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get prediction';
      setError(errorMessage);
      setCurrentStep('error');
    }
  };

  const handleResetToSelection = () => {
    setCurrentStep('selection');
    setSelectedMatch(null);
    setSelectedRiskLevel(null);
    setPredictionResult(null);
    setError(null);
  };

  const renderWorkflowStep = () => {
    switch (currentStep) {
      case 'selection':
        return (
          <MatchSelector 
            onMatchSelect={handleMatchSelect} 
            onPredictionRequest={handlePredictionRequest}
          />
        );
      
      case 'loading':
        return (
          <div className="w-full max-w-4xl mx-auto p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Match</h2>
              <p className="text-gray-600">
                Getting AI prediction for {selectedMatch?.homeTeam} vs {selectedMatch?.awayTeam}
              </p>
              <p className="text-sm text-gray-500 mt-2">Risk Level: {selectedRiskLevel}</p>
            </div>
          </div>
        );
      
      case 'result':
        if (!predictionResult || !selectedMatch) {
          setCurrentStep('error');
          setError('Missing prediction data');
          return null;
        }
        return (
          <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              {/* Header Section with Match Context */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 sm:p-8">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">Prediction Result</h2>
                  <div className="text-blue-100 text-sm sm:text-base">
                    <div className="font-semibold text-lg sm:text-xl mb-1">
                      {selectedMatch?.homeTeam} vs {selectedMatch?.awayTeam}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm">
                      <span>Risk Level: {selectedRiskLevel}</span>
                      {selectedMatch?.startTime && (
                        <span className="hidden sm:inline">•</span>
                      )}
                      {selectedMatch?.startTime && (
                        <span>
                          {new Date(selectedMatch.startTime).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Prominent Betting Suggestion */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-2">
                        Recommended Bet
                      </h3>
                      <p className="text-green-700 text-base sm:text-lg font-semibold leading-relaxed">
                        {predictionResult?.betSuggestion || 'No betting suggestion available'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Analysis/Rationale */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3">
                        AI Analysis
                      </h3>
                      <p className="text-slate-700 text-base leading-relaxed">
                        {predictionResult?.rationale || 'No analysis available'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4 text-center">
                  <button
                    onClick={handleResetToSelection}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  >
                    Make Another Prediction
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div className="w-full max-w-4xl mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-red-800 mb-4">Prediction Failed</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={() => setCurrentStep('selection')}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => selectedMatch && selectedRiskLevel && handlePredictionRequest(selectedMatch.id, selectedRiskLevel)}
                  disabled={!selectedMatch || !selectedRiskLevel}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Soccer Betting Advisor
          </h1>
          <p className="text-lg text-gray-600">
            Select a match to get AI-powered betting predictions
          </p>
        </div>
        
        {renderWorkflowStep()}
      </div>
    </div>
  )
}

export default App