import { useMemo } from "react";
import type { Play, SortState } from "../types";

interface UseFilteredDataOptions {
  data: Play[];
  query: string;
  sort: SortState;
}

export function useFilteredData({
  data,
  query,
  sort,
}: UseFilteredDataOptions): Play[] {
  return useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    // Filter by search query
    let filteredData = data;
    if (normalizedQuery) {
      filteredData = data.filter((play) => {
        const searchableText = [
          play.ts,
          play.master_metadata_track_name,
          play.master_metadata_album_artist_name,
          play.master_metadata_album_album_name,
          String(play.ms_played),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      });
    }

    // Sort the filtered data
    const sortDirection = sort.direction === "asc" ? 1 : -1;
    const sortKey = sort.key;
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    });

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey] ?? "";
      const bValue = b[sortKey] ?? "";

      if (sortKey === "ms_played") {
        return sortDirection * ((a.ms_played || 0) - (b.ms_played || 0));
      }

      if (sortKey === "ts") {
        return sortDirection * (aValue > bValue ? 1 : aValue < bValue ? -1 : 0);
      }

      return sortDirection * collator.compare(String(aValue), String(bValue));
    });
  }, [data, query, sort]);
}
