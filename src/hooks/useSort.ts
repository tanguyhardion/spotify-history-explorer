import { useState, useCallback, useTransition } from "react";
import type { SortState, SortKey } from "../types";
import { DEFAULT_SORT_STATE } from "../constants/app";

interface UseSortReturn {
  sort: SortState;
  changeSort: (key: SortKey) => void;
  resetSort: () => void;
  isTransitioning: boolean;
}

export function useSort(
  initialSort: SortState = DEFAULT_SORT_STATE,
): UseSortReturn {
  const [sort, setSort] = useState<SortState>(initialSort);
  const [isTransitioning, startTransition] = useTransition();

  const changeSort = useCallback((key: SortKey) => {
    startTransition(() => {
      setSort((prevSort) => {
        if (prevSort.key === key) {
          // Toggle direction if same key
          return {
            key,
            direction: prevSort.direction === "asc" ? "desc" : "asc",
          };
        }
        // Default to ascending for new key
        return { key, direction: "asc" };
      });
    });
  }, []);

  const resetSort = useCallback(() => {
    startTransition(() => {
      setSort(DEFAULT_SORT_STATE);
    });
  }, []);

  return {
    sort,
    changeSort,
    resetSort,
    isTransitioning,
  };
}
