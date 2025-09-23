import type { Play, PlayStatistics } from "../types";
import { formatMs } from "./format";

/**
 * Calculates comprehensive statistics from play data
 */
export function calculatePlayStatistics(data: Play[]): PlayStatistics {
  if (data.length === 0) {
    return getEmptyStatistics();
  }

  const totalMs = data.reduce((acc, play) => acc + (play.ms_played || 0), 0);

  // Calculate counts and top items
  const { topArtist, uniqueArtists } = calculateArtistStats(data);
  const { topTrack, uniqueTracks } = calculateTrackStats(data);
  const { topAlbum } = calculateAlbumStats(data);

  return {
    totalPlaytime: formatMs(totalMs),
    uniqueTracks,
    uniqueArtists,
    averagePlaytime: formatMs(data.length > 0 ? totalMs / data.length : 0),
    topArtist,
    topTrack,
    topAlbum,
  };
}

function getEmptyStatistics(): PlayStatistics {
  return {
    totalPlaytime: "0s",
    uniqueTracks: 0,
    uniqueArtists: 0,
    averagePlaytime: "0s",
    topArtist: { name: "—", plays: 0 },
    topTrack: { name: "—", plays: 0 },
    topAlbum: { name: "—", plays: 0 },
  };
}

function calculateArtistStats(data: Play[]) {
  const artistPlayCounts = new Map<string, number>();

  for (const play of data) {
    const artist = play.master_metadata_album_artist_name || "Unknown";
    artistPlayCounts.set(artist, (artistPlayCounts.get(artist) || 0) + 1);
  }

  const uniqueArtists = new Set(
    data
      .filter((play) => play.master_metadata_album_artist_name)
      .map((play) => play.master_metadata_album_artist_name),
  ).size;

  const topArtist = Array.from(artistPlayCounts.entries()).reduce(
    (max, [name, plays]) => (plays > max.plays ? { name, plays } : max),
    { name: "—", plays: 0 },
  );

  return { topArtist, uniqueArtists };
}

function calculateTrackStats(data: Play[]) {
  const trackPlayCounts = new Map<string, number>();

  for (const play of data) {
    const track = play.master_metadata_track_name || "Unknown";
    trackPlayCounts.set(track, (trackPlayCounts.get(track) || 0) + 1);
  }

  const uniqueTracks = new Set(
    data
      .filter((play) => play.master_metadata_track_name)
      .map(
        (play) =>
          `${play.master_metadata_track_name}-${play.master_metadata_album_artist_name}`,
      ),
  ).size;

  const topTrack = Array.from(trackPlayCounts.entries()).reduce(
    (max, [name, plays]) => (plays > max.plays ? { name, plays } : max),
    { name: "—", plays: 0 },
  );

  return { topTrack, uniqueTracks };
}

function calculateAlbumStats(data: Play[]) {
  const albumPlayCounts = new Map<string, number>();

  for (const play of data) {
    const album = play.master_metadata_album_album_name || "Unknown";
    albumPlayCounts.set(album, (albumPlayCounts.get(album) || 0) + 1);
  }

  const topAlbum = Array.from(albumPlayCounts.entries()).reduce(
    (max, [name, plays]) => (plays > max.plays ? { name, plays } : max),
    { name: "—", plays: 0 },
  );

  return { topAlbum };
}
