import { useMemo } from "react";
import type { Play, SortState } from "../types";

interface SearchTerm {
  type: 'general' | 'exact' | 'track' | 'artist' | 'album';
  value: string;
}

function parseSearchQuery(query: string): SearchTerm[] {
  const terms: SearchTerm[] = [];
  let remainingQuery = query;

  // Extract quoted phrases
  const quoteRegex = /"([^"]*)"/g;
  let match;
  while ((match = quoteRegex.exec(query)) !== null) {
    terms.push({ type: 'exact', value: match[1].toLowerCase() });
    remainingQuery = remainingQuery.replace(match[0], '');
  }

  // Extract field-specific searches
  const fieldRegex = /(track|artist|album):([^\s]+)/g;
  while ((match = fieldRegex.exec(remainingQuery)) !== null) {
    const [, field, value] = match;
    terms.push({ type: field as 'track' | 'artist' | 'album', value: value.toLowerCase() });
    remainingQuery = remainingQuery.replace(match[0], '');
  }

  // Extract general terms
  const generalTerms = remainingQuery.trim().split(/\s+/).filter(term => term.length > 0);
  generalTerms.forEach(term => {
    terms.push({ type: 'general', value: term.toLowerCase() });
  });

  return terms;
}

function matchesSearchTerms(play: Play, terms: SearchTerm[]): boolean {
  // Pre-normalize fields for efficiency
  const normalizedTrack = play.master_metadata_track_name?.toLowerCase() || '';
  const normalizedArtist = play.master_metadata_album_artist_name?.toLowerCase() || '';
  const normalizedAlbum = play.master_metadata_album_album_name?.toLowerCase() || '';
  const normalizedAll = `${normalizedTrack} ${normalizedArtist} ${normalizedAlbum}`;

  for (const term of terms) {
    switch (term.type) {
      case 'track':
        if (!normalizedTrack.includes(term.value)) return false;
        break;
      case 'artist':
        if (!normalizedArtist.includes(term.value)) return false;
        break;
      case 'album':
        if (!normalizedAlbum.includes(term.value)) return false;
        break;
      case 'exact':
        // Use word boundaries for exact matches to avoid partial word matches
        const regex = new RegExp(`\\b${term.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (!regex.test(normalizedAll)) return false;
        break;
      case 'general':
        // Check if any field contains the term
        if (!normalizedTrack.includes(term.value) &&
            !normalizedArtist.includes(term.value) &&
            !normalizedAlbum.includes(term.value)) {
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
