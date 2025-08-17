export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string; // ISO 8601 format
}

export interface PredictionRequest {
  matchId: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface PredictionResult {
  betSuggestion: string;
  rationale: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface ApiError {
  detail: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:8000';
  }

  async getMatches(): Promise<Match[]> {
    try {
      const response = await fetch(`${this.baseUrl}/prediction/matches`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const matches: Match[] = await response.json();
      return matches;
    } catch (error) {
      if (error instanceof Error) {
        // Re-throw with more context for common errors
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to server. Please ensure the backend is running.');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching matches.');
    }
  }

  async predict(request: PredictionRequest): Promise<PredictionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/prediction/predict`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to server. Please ensure the backend is running.');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred while requesting prediction.');
    }
  }
}

export const apiClient = new ApiClient();