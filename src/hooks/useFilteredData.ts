import { useMemo, useDeferredValue, useState, useEffect } from "react";
import type { Play, SortState } from "../types";
import { parseSearchQuery, matchesSearchTerms, sortPlays } from "../utils";

interface UseFilteredDataOptions {
  data: Play[];
  query: string;
  sort: SortState;
}

interface UseFilteredDataReturn {
  filteredData: Play[];
  isLoading: boolean;
}

/**
 * Custom hook for filtering and sorting Spotify play data
 * Optimized with memoization, deferred values, and loading states for better UX
 */
export function useFilteredData({
  data,
  query,
  sort,
}: UseFilteredDataOptions): UseFilteredDataReturn {
  const [isLoading, setIsLoading] = useState(false);

  // Defer sort updates to prevent blocking UI during user interactions
  const deferredSort = useDeferredValue(sort);

  // Filter data separately from sorting to minimize recomputation
  const filteredByQuery = useMemo(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return data;

    const searchTerms = parseSearchQuery(normalizedQuery);
    return data.filter((play) => matchesSearchTerms(play, searchTerms));
  }, [data, query]);

  // Sort the filtered data with loading state management
  const sortedData = useMemo(() => {
    // For large datasets, show loading state during sort
    if (filteredByQuery.length > 1000) {
      setIsLoading(true);
    }

    const result = sortPlays(filteredByQuery, deferredSort);

    // Reset loading state after sort is complete
    setTimeout(() => setIsLoading(false), 0);

    return result;
  }, [filteredByQuery, deferredSort]);

  // Reset loading state when sort changes (for immediate feedback)
  useEffect(() => {
    if (sort !== deferredSort && filteredByQuery.length > 1000) {
      setIsLoading(true);
    }
  }, [sort, deferredSort, filteredByQuery.length]);

  return {
    filteredData: sortedData,
    isLoading,
  };
}
