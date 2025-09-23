import type { Play, SearchTerm } from "../types";

/**
 * Parses a search query into structured search terms
 * Supports field-specific searches and quoted phrases
 */
export function parseSearchQuery(query: string): SearchTerm[] {
  const terms: SearchTerm[] = [];
  let remainingQuery = query;

  // Extract field-specific searches, allowing quotes
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

  // Extract quoted phrases
  const quoteRegex = /"([^"]*)"/g;
  while ((match = quoteRegex.exec(remainingQuery)) !== null) {
    terms.push({ type: "exact", value: match[1].toLowerCase(), isExact: true });
    remainingQuery = remainingQuery.replace(match[0], "");
  }

  // Extract general terms
  const generalTerms = remainingQuery
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 0);

  generalTerms.forEach((term) => {
    terms.push({ type: "general", value: term.toLowerCase(), isExact: false });
  });

  return terms;
}

/**
 * Checks if a play matches all search terms
 */
export function matchesSearchTerms(play: Play, terms: SearchTerm[]): boolean {
  // Pre-normalize fields for efficiency
  const normalizedTrack = play.master_metadata_track_name?.toLowerCase() || "";
  const normalizedArtist =
    play.master_metadata_album_artist_name?.toLowerCase() || "";
  const normalizedAlbum =
    play.master_metadata_album_album_name?.toLowerCase() || "";
  const normalizedAll = `${normalizedTrack} ${normalizedArtist} ${normalizedAlbum}`;

  for (const term of terms) {
    if (
      !matchesSingleTerm(
        term,
        normalizedTrack,
        normalizedArtist,
        normalizedAlbum,
        normalizedAll,
      )
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if a single term matches the play data
 */
function matchesSingleTerm(
  term: SearchTerm,
  normalizedTrack: string,
  normalizedArtist: string,
  normalizedAlbum: string,
  normalizedAll: string,
): boolean {
  switch (term.type) {
    case "track":
      return matchesField(term, normalizedTrack);
    case "artist":
      return matchesField(term, normalizedArtist);
    case "album":
      return matchesField(term, normalizedAlbum);
    case "exact":
      return matchesExact(term.value, normalizedAll);
    case "general":
      return (
        normalizedTrack.includes(term.value) ||
        normalizedArtist.includes(term.value) ||
        normalizedAlbum.includes(term.value)
      );
    default:
      return false;
  }
}

/**
 * Checks if a term matches a specific field
 */
function matchesField(term: SearchTerm, fieldValue: string): boolean {
  if (term.isExact) {
    return matchesExact(term.value, fieldValue);
  }
  return fieldValue.includes(term.value);
}

/**
 * Checks for exact word boundary matches
 */
function matchesExact(value: string, text: string): boolean {
  const regex = new RegExp(
    `\\b${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
    "i",
  );
  return regex.test(text);
}
