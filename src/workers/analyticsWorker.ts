import {
  buildTimeline,
  calculateListeningStreaks,
  getMonthlyTopTracks,
  getTopEntities,
  buildOverviewStats
} from '../services/analytics';
import { isWithinRange } from '../utils/date';
import type { Play } from '../types/plays';
import type { AnalyticsWorkerIncomingMessage } from '../types/analyticsWorker';

let allPlays: Play[] = [];

self.onmessage = (event: MessageEvent<AnalyticsWorkerIncomingMessage>) => {
  const { type, payload } = event.data;

  if (type === 'SET_PLAYS') {
    // @ts-ignore - payload is typed correctly in the union but TS might complain
    allPlays = payload.plays;
  } else if (type === 'CALCULATE') {
    // @ts-ignore
    const { filters, timelineGrouping } = payload;

    const searchTerm = filters.searchTerm.trim().toLowerCase();
    const filteredPlays = allPlays.filter((play) => {
      if (!isWithinRange(play.timestamp, filters)) return false;
      if (filters.artist && play.artistName !== filters.artist) return false;
      if (filters.track && play.trackName !== filters.track) return false;
      if (!searchTerm) return true;
      const haystack = `${play.trackName ?? ''} ${play.artistName ?? ''} ${play.albumName ?? ''}`.toLowerCase();
      return haystack.includes(searchTerm);
    });

    const overview = buildOverviewStats(filteredPlays);
    const topTracks = getTopEntities(filteredPlays, 'trackName');
    const topArtists = getTopEntities(filteredPlays, 'artistName');
    const topAlbums = getTopEntities(filteredPlays, 'albumName');
    const timeline = buildTimeline(filteredPlays, timelineGrouping);
    const listeningStreak = calculateListeningStreaks(filteredPlays);
    const monthlyTopTracks = getMonthlyTopTracks(filteredPlays);

    self.postMessage({
      type: 'RESULT',
      payload: {
        filteredPlays,
        overview,
        topTracks,
        topArtists,
        topAlbums,
        timeline,
        listeningStreak,
        monthlyTopTracks
      }
    });
  }
};
