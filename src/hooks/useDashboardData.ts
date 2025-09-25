import { useMemo } from 'react';
import {
  buildTimeline,
  calculateListeningStreaks,
  getMonthlyTopTracks,
  getTopEntities,
  buildOverviewStats,
  type TimelineGrouping
} from '../services/analytics';
import type { PlayFilters } from '../types/filters';
import type { Play } from '../types/plays';
import { isWithinRange } from '../utils/date';

export const useDashboardData = (
  plays: Play[],
  filters: PlayFilters,
  timelineGrouping: TimelineGrouping
) => {
  const filteredPlays = useMemo(() => {
    const searchTerm = filters.searchTerm.trim().toLowerCase();
    return plays.filter((play) => {
      if (!isWithinRange(play.timestamp, filters)) return false;
      if (filters.artist && play.artistName !== filters.artist) return false;
      if (filters.track && play.trackName !== filters.track) return false;
      if (!searchTerm) return true;
      const haystack = `${play.trackName ?? ''} ${play.artistName ?? ''} ${play.albumName ?? ''}`.toLowerCase();
      return haystack.includes(searchTerm);
    });
  }, [plays, filters]);

  const overview = useMemo(() => buildOverviewStats(filteredPlays), [filteredPlays]);
  const topTracks = useMemo(() => getTopEntities(filteredPlays, 'trackName'), [filteredPlays]);
  const topArtists = useMemo(() => getTopEntities(filteredPlays, 'artistName'), [filteredPlays]);
  const topAlbums = useMemo(() => getTopEntities(filteredPlays, 'albumName'), [filteredPlays]);
  const timeline = useMemo(() => buildTimeline(filteredPlays, timelineGrouping), [filteredPlays, timelineGrouping]);
  const listeningStreak = useMemo(() => calculateListeningStreaks(filteredPlays), [filteredPlays]);
  const monthlyTopTracks = useMemo(() => getMonthlyTopTracks(filteredPlays), [filteredPlays]);

  return {
    filteredPlays,
    overview,
    topTracks,
    topArtists,
    topAlbums,
    timeline,
    listeningStreak,
    monthlyTopTracks
  };
};
