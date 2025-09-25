import { differenceInCalendarDays, parseISO } from 'date-fns';
import { MAX_TOP_ENTITIES } from '../constants/charts';
import type {
  ListeningStreakSummary,
  MonthlyTopTrack,
  OverviewStats,
  TimelinePoint,
  TopEntity
} from '../types/analytics';
import type { Play } from '../types/plays';
import { formatMinutes, formatNumber } from '../utils/format';
import { formatMsToDuration, toDayKey, toMonthKey, toWeekKey } from '../utils/date';

export const buildOverviewStats = (plays: Play[]): OverviewStats => {
  const totalPlays = plays.length;
  const uniqueTracks = new Set(plays.map((play) => play.trackName || play.id)).size;
  const uniqueArtists = new Set(plays.map((play) => play.artistName || play.id)).size;
  const totalMsPlayed = plays.reduce((sum, play) => sum + play.msPlayed, 0);
  const averageMsPlayed = totalPlays ? totalMsPlayed / totalPlays : 0;

  return {
    totalPlays,
    uniqueTracks,
    uniqueArtists,
    totalMsPlayed,
    averageMsPlayed
  };
};

export const getTopEntities = (
  plays: Play[],
  key: 'trackName' | 'artistName' | 'albumName',
  limit = MAX_TOP_ENTITIES
): TopEntity[] => {
  const totals = new Map<string, { count: number; ms: number; sample?: Play }>();

  for (const play of plays) {
    const value = (play[key] || 'Unknown') as string;
    const entry = totals.get(value) || { count: 0, ms: 0, sample: play };
    entry.count += 1;
    entry.ms += play.msPlayed;
    if (!entry.sample) entry.sample = play;
    totals.set(value, entry);
  }

  const grandTotal = plays.length || 1;

  return Array.from(totals.entries())
    .map(([name, info]) => ({
      name,
      count: info.count,
      msPlayed: info.ms,
      percentage: (info.count / grandTotal) * 100,
      sampleTrack: info.sample
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export type TimelineGrouping = 'day' | 'week' | 'month';

export const buildTimeline = (
  plays: Play[],
  grouping: TimelineGrouping = 'week'
): TimelinePoint[] => {
  const map = new Map<string, TimelinePoint>();
  const keyFn = grouping === 'day' ? toDayKey : grouping === 'week' ? toWeekKey : toMonthKey;

  for (const play of plays) {
    const key = keyFn(play.timestamp);
    const point =
      map.get(key) ||
      ({
        bucket: key,
        dateLabel: formatBucketLabel(play.timestamp, grouping),
        plays: 0,
        msPlayed: 0
      } as TimelinePoint);
    point.plays += 1;
    point.msPlayed += play.msPlayed;
    map.set(key, point);
  }

  return Array.from(map.values()).sort((a, b) => (a.bucket > b.bucket ? 1 : -1));
};

const formatBucketLabel = (iso: string, grouping: TimelineGrouping) => {
  if (grouping === 'day') return toDayKey(iso);
  if (grouping === 'week') return toWeekKey(iso);
  return toMonthKey(iso);
};

export const calculateListeningStreaks = (plays: Play[]): ListeningStreakSummary => {
  if (!plays.length) {
    return { longestStreak: 0, currentStreak: 0, streaks: [] };
  }

  const sortedDays = Array.from(new Set(plays.map((play) => toDayKey(play.timestamp)))).sort();
  let longest = 1;
  let current = 1;
  let currentStart = sortedDays[0];
  const streaks: ListeningStreakSummary['streaks'] = [];

  for (let i = 1; i < sortedDays.length; i += 1) {
    const previous = parseISO(sortedDays[i - 1]);
    const currentDate = parseISO(sortedDays[i]);
    const diff = differenceInCalendarDays(currentDate, previous);

    if (diff === 1) {
      current += 1;
      if (current > longest) {
        longest = current;
      }
    } else {
      streaks.push({ start: currentStart, end: sortedDays[i - 1], length: current });
      current = 1;
      currentStart = sortedDays[i];
    }
  }
  streaks.push({ start: currentStart, end: sortedDays.at(-1) ?? currentStart, length: current });

  const todayKey = toDayKey(new Date().toISOString());
  const currentStreak = streaks
    .filter((streak) => streak.end === todayKey || streak.end === sortedDays.at(-1))
    .at(-1)?.length;

  return {
    longestStreak: longest,
    currentStreak: currentStreak ?? 0,
    streaks
  };
};

export const getMonthlyTopTracks = (plays: Play[]): MonthlyTopTrack[] => {
  const monthMap = new Map<string, Map<string, { count: number; artist: string | null }>>();

  for (const play of plays) {
    const month = toMonthKey(play.timestamp);
    const trackKey = play.trackName || 'Unknown track';
    const monthEntry = monthMap.get(month) || new Map();
    const trackEntry = monthEntry.get(trackKey) || { count: 0, artist: play.artistName };
    trackEntry.count += 1;
    trackEntry.artist ||= play.artistName;
    monthEntry.set(trackKey, trackEntry);
    monthMap.set(month, monthEntry);
  }

  return Array.from(monthMap.entries())
    .map(([month, tracks]) => {
      const [trackName, info] = Array.from(tracks.entries()).sort((a, b) => b[1].count - a[1].count)[0];
      return {
        month,
        trackName,
        artistName: info.artist,
        playCount: info.count
      } satisfies MonthlyTopTrack;
    })
    .sort((a, b) => (a.month > b.month ? -1 : 1));
};

export const buildCsvRowsFromPlays = (plays: Play[]): string[][] => {
  const header = ['Timestamp', 'Track', 'Artist', 'Album', 'Milliseconds Played', 'Spotify URI', 'Source'];
  const rows = plays.map((play) => [
    play.timestamp,
    play.trackName ?? '',
    play.artistName ?? '',
    play.albumName ?? '',
    String(play.msPlayed),
    play.spotifyTrackUri ?? '',
    play.source
  ]);
  return [header, ...rows];
};

export const describeOverview = (overview: OverviewStats) => [
  ['Total plays', formatNumber(overview.totalPlays)],
  ['Unique tracks', formatNumber(overview.uniqueTracks)],
  ['Unique artists', formatNumber(overview.uniqueArtists)],
  ['Total time', formatMsToDuration(overview.totalMsPlayed)],
  ['Average play length', formatMinutes(overview.averageMsPlayed)]
];
