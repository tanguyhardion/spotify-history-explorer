import type { Play, SortState, SortKey } from "../types";

/**
 * Creates a stable comparator function for sorting plays
 */
export function createPlayComparator(sort: SortState) {
  const { key, direction } = sort;
  const multiplier = direction === "asc" ? 1 : -1;
  
  return (a: Play, b: Play): number => {
    const aValue = a[key] ?? "";
    const bValue = b[key] ?? "";

    if (key === "ms_played") {
      return multiplier * ((a.ms_played || 0) - (b.ms_played || 0));
    }

    if (key === "ts") {
      return multiplier * (aValue > bValue ? 1 : aValue < bValue ? -1 : 0);
    }

    // Use Intl.Collator for locale-aware string comparison
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    });
    
    return multiplier * collator.compare(String(aValue), String(bValue));
  };
}

/**
 * Sorts an array of plays based on the sort state
 */
export function sortPlays(plays: Play[], sort: SortState): Play[] {
  const comparator = createPlayComparator(sort);
  return [...plays].sort(comparator);
}

/**
 * Gets the appropriate sort icon for a column
 */
export function getSortIcon(sortKey: SortKey, currentSort: SortState): string {
  if (currentSort.key !== sortKey) return "";
  return currentSort.direction === "asc" ? " ↑" : " ↓";
}