import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient, Match, PredictionRequest } from './apiClient';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getMatches', () => {
    it('should fetch matches successfully', async () => {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMatches,
      } as Response);

      const result = await apiClient.getMatches();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/prediction/matches',
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockMatches);
    });

    it('should handle HTTP error responses', async () => {
      const errorResponse = {
        detail: 'Sports API rate limit exceeded'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => errorResponse,
      } as Response);

      await expect(apiClient.getMatches()).rejects.toThrow(
        'Sports API rate limit exceeded'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

      await expect(apiClient.getMatches()).rejects.toThrow(
        'Unable to connect to server. Please ensure the backend is running.'
      );
    });

    it('should handle HTTP error without detail', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      } as Response);

      await expect(apiClient.getMatches()).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      );
    });

    it('should handle unexpected errors', async () => {
      mockFetch.mockRejectedValueOnce('Unexpected error');

      await expect(apiClient.getMatches()).rejects.toThrow(
        'An unexpected error occurred while fetching matches.'
      );
    });

    it('should return empty array when no matches', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await apiClient.getMatches();

      expect(result).toEqual([]);
    });
  });

  describe('predict', () => {
    const mockPredictionRequest: PredictionRequest = {
      matchId: '1',
      riskLevel: 'Medium'
    };

    const mockPredictionResult = {
      prediction: 'Home win',
      confidence: 0.75,
      suggestedBet: 'Liverpool to win'
    };

    it('should make prediction request successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPredictionResult,
      } as Response);

      const result = await apiClient.predict(mockPredictionRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/prediction/predict',
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockPredictionRequest),
        }
      );
      expect(result).toEqual(mockPredictionResult);
    });

    it('should handle HTTP error responses', async () => {
      const errorResponse = {
        detail: 'Invalid match ID provided'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => errorResponse,
      } as Response);

      await expect(apiClient.predict(mockPredictionRequest)).rejects.toThrow(
        'Invalid match ID provided'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

      await expect(apiClient.predict(mockPredictionRequest)).rejects.toThrow(
        'Unable to connect to server. Please ensure the backend is running.'
      );
    });

    it('should handle HTTP error without detail', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      } as Response);

      await expect(apiClient.predict(mockPredictionRequest)).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      );
    });

    it('should handle unexpected errors', async () => {
      mockFetch.mockRejectedValueOnce('Unexpected error');

      await expect(apiClient.predict(mockPredictionRequest)).rejects.toThrow(
        'An unexpected error occurred while requesting prediction.'
      );
    });

    it('should send correct request body for different risk levels', async () => {
      const lowRiskRequest: PredictionRequest = {
        matchId: '2',
        riskLevel: 'Low'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPredictionResult,
      } as Response);

      await apiClient.predict(lowRiskRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/prediction/predict',
        expect.objectContaining({
          body: JSON.stringify(lowRiskRequest),
        })
      );
    });

    it('should handle high risk level requests', async () => {
      const highRiskRequest: PredictionRequest = {
        matchId: '3',
        riskLevel: 'High'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPredictionResult,
      } as Response);

      await apiClient.predict(highRiskRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/prediction/predict',
        expect.objectContaining({
          body: JSON.stringify(highRiskRequest),
        })
      );
    });
  });
});