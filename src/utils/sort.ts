import type { Play, SortState, SortKey } from "../types";

// Cache collator instance for better performance
const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

/**
 * Creates a stable comparator function for sorting plays
 * Optimized for performance with large datasets
 */
export function createPlayComparator(sort: SortState) {
  const { key, direction } = sort;
  const multiplier = direction === "asc" ? 1 : -1;

  // Pre-extract values for better performance in tight loops
  if (key === "ms_played") {
    return (a: Play, b: Play): number => {
      return multiplier * ((a.ms_played || 0) - (b.ms_played || 0));
    };
  }

  if (key === "ts") {
    return (a: Play, b: Play): number => {
      const aValue = a.ts;
      const bValue = b.ts;
      return multiplier * (aValue > bValue ? 1 : aValue < bValue ? -1 : 0);
    };
  }

  // String comparison for other fields
  return (a: Play, b: Play): number => {
    const aValue = String(a[key] ?? "");
    const bValue = String(b[key] ?? "");
    return multiplier * collator.compare(aValue, bValue);
  };
}

/**
 * Sorts an array of plays based on the sort state
 * Uses optimized comparator and avoids unnecessary array copies for small datasets
 */
export function sortPlays(plays: Play[], sort: SortState): Play[] {
  if (plays.length === 0) return plays;

  const comparator = createPlayComparator(sort);

  // For small datasets, sorting in place is faster
  if (plays.length < 1000) {
    return [...plays].sort(comparator);
  }

  // For large datasets, use a more efficient approach
  // Create array copy and sort in place to reduce memory allocations
  const result = plays.slice();
  result.sort(comparator);
  return result;
}

/**
 * Gets the appropriate sort icon for a column
 */
export function getSortIcon(sortKey: SortKey, currentSort: SortState): string {
  if (currentSort.key !== sortKey) return "";
  return currentSort.direction === "asc" ? " ↑" : " ↓";
}
