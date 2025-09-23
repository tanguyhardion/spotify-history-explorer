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
  
  // Calculate time-based statistics
  const timeStats = calculateTimeStatistics(data);
  
  return {
    totalPlaytime: formatMs(totalMs),
    uniqueTracks,
    uniqueArtists,
    averagePlaytime: formatMs(data.length > 0 ? totalMs / data.length : 0),
    topArtist,
    topTrack,
    topAlbum,
    ...timeStats,
  };
}

function getEmptyStatistics(): PlayStatistics {
  return {
    totalPlaytime: "0s",
    uniqueTracks: 0,
    uniqueArtists: 0,
    averagePlaytime: "0s",
    averagePlaysPerDay: 0,
    listeningStreak: 0,
    mostActiveDayOfWeek: { day: "—", plays: 0 },
    mostActiveHour: { hour: -1, plays: 0 },
    mostActiveDayEver: { date: "—", plays: 0 },
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
      .map((play) => play.master_metadata_album_artist_name)
  ).size;

  const topArtist = Array.from(artistPlayCounts.entries()).reduce(
    (max, [name, plays]) => (plays > max.plays ? { name, plays } : max),
    { name: "—", plays: 0 }
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
      .map((play) => 
        `${play.master_metadata_track_name}-${play.master_metadata_album_artist_name}`
      )
  ).size;

  const topTrack = Array.from(trackPlayCounts.entries()).reduce(
    (max, [name, plays]) => (plays > max.plays ? { name, plays } : max),
    { name: "—", plays: 0 }
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
    { name: "—", plays: 0 }
  );

  return { topAlbum };
}

function calculateTimeStatistics(data: Play[]) {
  const dayOfWeekCounts = new Map<string, number>();
  const hourCounts = new Map<number, number>();
  const dateCounts = new Map<string, number>();
  const uniqueDays = new Set<string>();

  for (const play of data) {
    const date = new Date(play.ts);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = date.getHours();
    const dateStr = date.toISOString().split('T')[0];

    dayOfWeekCounts.set(dayOfWeek, (dayOfWeekCounts.get(dayOfWeek) || 0) + 1);
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    dateCounts.set(dateStr, (dateCounts.get(dateStr) || 0) + 1);
    uniqueDays.add(dateStr);
  }

  const mostActiveDayOfWeek = Array.from(dayOfWeekCounts.entries()).reduce(
    (max, [day, plays]) => (plays > max.plays ? { day, plays } : max),
    { day: "—", plays: 0 }
  );

  const mostActiveHour = Array.from(hourCounts.entries()).reduce(
    (max, [hour, plays]) => (plays > max.plays ? { hour, plays } : max),
    { hour: -1, plays: 0 }
  );

  const mostActiveDayEver = Array.from(dateCounts.entries()).reduce(
    (max, [date, plays]) => (plays > max.plays ? { date, plays } : max),
    { date: "—", plays: 0 }
  );

  const averagePlaysPerDay = uniqueDays.size > 0 ? data.length / uniqueDays.size : 0;
  const listeningStreak = calculateListeningStreak(uniqueDays);

  return {
    averagePlaysPerDay,
    listeningStreak,
    mostActiveDayOfWeek,
    mostActiveHour,
    mostActiveDayEver,
  };
}

function calculateListeningStreak(uniqueDays: Set<string>): number {
  const sortedDates = Array.from(uniqueDays).sort();
  let currentStreak = 0;
  let maxStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const currentDate = new Date(dateStr);
    if (prevDate) {
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    prevDate = currentDate;
  }
  
  return Math.max(maxStreak, currentStreak);
}