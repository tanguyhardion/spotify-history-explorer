import { useMemo } from "react";
import type { Play, SortState } from "../types";

interface SearchTerm {
  type: "general" | "exact" | "track" | "artist" | "album";
  value: string;
  isExact: boolean;
}

function parseSearchQuery(query: string): SearchTerm[] {
  const terms: SearchTerm[] = [];
  let remainingQuery = query;

  // First, extract field-specific searches, allowing quotes
  const fieldRegex = /(track|artist|album):(?:"([^"]*)"|([^\s]+))/g;
  let match;
  while ((match = fieldRegex.exec(remainingQuery)) !== null) {
    const field = match[1];
    const quotedValue = match[2];
    const unquotedValue = match[3];
    const value = quotedValue !== undefined ? quotedValue : unquotedValue;
    const isExact = quotedValue !== undefined;
    terms.push({
      type: field as "track" | "artist" | "album",
      value: value.toLowerCase(),
      isExact,
    });
    remainingQuery = remainingQuery.replace(match[0], "");
  }

  // Then, extract quoted phrases
  const quoteRegex = /"([^"]*)"/g;
  while ((match = quoteRegex.exec(remainingQuery)) !== null) {
    terms.push({ type: "exact", value: match[1].toLowerCase(), isExact: true });
    remainingQuery = remainingQuery.replace(match[0], "");
  }

  // Then, general terms
  const generalTerms = remainingQuery
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 0);
  generalTerms.forEach((term) => {
    terms.push({ type: "general", value: term.toLowerCase(), isExact: false });
  });

  return terms;
}

function matchesSearchTerms(play: Play, terms: SearchTerm[]): boolean {
  // Pre-normalize fields for efficiency
  const normalizedTrack = play.master_metadata_track_name?.toLowerCase() || "";
  const normalizedArtist =
    play.master_metadata_album_artist_name?.toLowerCase() || "";
  const normalizedAlbum =
    play.master_metadata_album_album_name?.toLowerCase() || "";
  const normalizedAll = `${normalizedTrack} ${normalizedArtist} ${normalizedAlbum}`;

  for (const term of terms) {
    switch (term.type) {
      case "track":
        if (term.isExact) {
          const regex = new RegExp(
            `\\b${term.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            "i",
          );
          if (!regex.test(normalizedTrack)) return false;
        } else {
          if (!normalizedTrack.includes(term.value)) return false;
        }
        break;
      case "artist":
        if (term.isExact) {
          const regex = new RegExp(
            `\\b${term.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            "i",
          );
          if (!regex.test(normalizedArtist)) return false;
        } else {
          if (!normalizedArtist.includes(term.value)) return false;
        }
        break;
      case "album":
        if (term.isExact) {
          const regex = new RegExp(
            `\\b${term.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            "i",
          );
          if (!regex.test(normalizedAlbum)) return false;
        } else {
          if (!normalizedAlbum.includes(term.value)) return false;
        }
        break;
      case "exact":
        // Use word boundaries for exact matches to avoid partial word matches
        const regex = new RegExp(
          `\\b${term.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
          "i",
        );
        if (!regex.test(normalizedAll)) return false;
        break;
      case "general":
        // Check if any field contains the term
        if (
          !normalizedTrack.includes(term.value) &&
          !normalizedArtist.includes(term.value) &&
          !normalizedAlbum.includes(term.value)
        ) {
          return false;
        }
        break;
    }
  }
  return true;
}

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
    const normalizedQuery = query.trim();

    // Filter by search query
    let filteredData = data;
    if (normalizedQuery) {
      // Parse advanced search syntax
      const searchTerms = parseSearchQuery(normalizedQuery);

      filteredData = data.filter((play) => {
        return matchesSearchTerms(play, searchTerms);
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
