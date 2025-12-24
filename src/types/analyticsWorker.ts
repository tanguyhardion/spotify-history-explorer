import type { Play } from './plays';
import type { PlayFilters } from './filters';
import type { TimelineGrouping } from '../services/analytics';
import type {
  OverviewStats,
  TopEntity,
  TimelinePoint,
  ListeningStreakSummary,
  MonthlyTopTrack
} from './analytics';

export type AnalyticsWorkerAction = 'SET_PLAYS' | 'CALCULATE';

export interface SetPlaysMessage {
  type: 'SET_PLAYS';
  payload: {
    plays: Play[];
  };
}

export interface CalculateMessage {
  type: 'CALCULATE';
  payload: {
    filters: PlayFilters;
    timelineGrouping: TimelineGrouping;
  };
}

export type AnalyticsWorkerIncomingMessage = SetPlaysMessage | CalculateMessage;

export interface CalculationResult {
  filteredPlays: Play[];
  overview: OverviewStats;
  topTracks: TopEntity[];
  topArtists: TopEntity[];
  topAlbums: TopEntity[];
  timeline: TimelinePoint[];
  listeningStreak: ListeningStreakSummary;
  monthlyTopTracks: MonthlyTopTrack[];
}

export interface SuccessMessage {
  type: 'RESULT';
  payload: CalculationResult;
}

export type AnalyticsWorkerOutgoingMessage = SuccessMessage;
