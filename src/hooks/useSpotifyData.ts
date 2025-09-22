import { useEffect, useState, useCallback } from "react";
import { getAllPlays, countPlays } from "../db";
import type { Play } from "../types";

interface UseSpotifyDataReturn {
  data: Play[];
  isLoading: boolean;
  error: string | null;
  setData: (data: Play[]) => void;
  clearError: () => void;
}

export function useSpotifyData(): UseSpotifyDataReturn {
  const [data, setData] = useState<Play[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const count = await countPlays();

      if (count > 0) {
        const plays = await getAllPlays();
        // Sort by timestamp descending by default
        const sortedPlays = plays.sort((a, b) =>
          a.ts > b.ts ? -1 : a.ts < b.ts ? 1 : 0,
        );
        setData(sortedPlays);
      }
    } catch (err) {
      console.error("Failed to load data from IndexedDB:", err);
      setError("Failed to load your saved listening history");
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    setData: handleSetData,
    clearError,
  };
}
