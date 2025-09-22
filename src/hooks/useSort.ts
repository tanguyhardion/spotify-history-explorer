import { useState, useCallback } from "react";
import type { SortState, SortKey } from "../types";
import { DEFAULT_SORT_STATE } from "../constants/app";

interface UseSortReturn {
  sort: SortState;
  changeSort: (key: SortKey) => void;
  resetSort: () => void;
}

export function useSort(
  initialSort: SortState = DEFAULT_SORT_STATE,
): UseSortReturn {
  const [sort, setSort] = useState<SortState>(initialSort);

  const changeSort = useCallback((key: SortKey) => {
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
  }, []);

  const resetSort = useCallback(() => {
    setSort(DEFAULT_SORT_STATE);
  }, []);

  return {
    sort,
    changeSort,
    resetSort,
  };
}
