import { useEffect, useState, useCallback } from "react";
import { SpotifyDataService } from "../services";
import type { Play } from "../types";

interface UseSpotifyDataReturn {
  data: Play[];
  isLoading: boolean;
  error: string | null;
  setData: (data: Play[]) => void;
  clearError: () => void;
  refetchData: () => Promise<void>;
}

/**
 * Custom hook for managing Spotify data from IndexedDB
 * Provides loading state, error handling, and data management
 */
export function useSpotifyData(): UseSpotifyDataReturn {
  const [data, setData] = useState<Play[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const plays = await SpotifyDataService.loadData();
      setData(plays);
    } catch (err) {
      console.error("Failed to load data:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Failed to load your saved listening history";
      setError(errorMessage);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSetData = useCallback((newData: Play[]) => {
    setData(newData);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refetchData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    setData: handleSetData,
    clearError,
    refetchData,
  };
}
