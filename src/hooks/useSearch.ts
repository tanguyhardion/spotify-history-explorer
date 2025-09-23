import { useState, useCallback, useEffect } from "react";

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  debouncedQuery: string;
}

export function useSearch(initialQuery = ""): UseSearchReturn {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150); // 150ms debounce

    return () => clearTimeout(timer);
  }, [query]);

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
    debouncedQuery,
  };
}
