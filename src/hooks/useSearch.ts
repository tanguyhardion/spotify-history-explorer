import { useState, useCallback } from "react";

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
}

export function useSearch(initialQuery = ""): UseSearchReturn {
  const [query, setQuery] = useState(initialQuery);

  const handleSetQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearQuery = useCallback(() => {
    setQuery("");
  }, []);

  return {
    query,
    setQuery: handleSetQuery,
    clearQuery,
  };
}
