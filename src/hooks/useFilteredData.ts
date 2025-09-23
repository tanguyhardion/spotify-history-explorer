import { useMemo } from "react";
import type { Play, SortState } from "../types";
import { parseSearchQuery, matchesSearchTerms, sortPlays } from "../utils";

interface UseFilteredDataOptions {
  data: Play[];
  query: string;
  sort: SortState;
}

/**
 * Custom hook for filtering and sorting Spotify play data
 * Optimized with memoization and efficient search algorithms
 */
export function useFilteredData({
  data,
  query,
  sort,
}: UseFilteredDataOptions): Play[] {
  return useMemo(() => {
    const normalizedQuery = query.trim();

    // Filter by search query if present
    let filteredData = data;
    if (normalizedQuery) {
      const searchTerms = parseSearchQuery(normalizedQuery);
      filteredData = data.filter((play) => matchesSearchTerms(play, searchTerms));
    }

    // Sort the filtered data
    return sortPlays(filteredData, sort);
  }, [data, query, sort]);
}
