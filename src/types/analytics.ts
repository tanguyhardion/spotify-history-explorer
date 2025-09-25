import type { Play } from './plays';

export interface OverviewStats {
  totalPlays: number;
  uniqueTracks: number;
  uniqueArtists: number;
  totalMsPlayed: number;
  averageMsPlayed: number;
}

export interface TopEntity {
  name: string;
  count: number;
  msPlayed: number;
  percentage: number;
  sampleTrack?: Play;
}

export interface TimelinePoint {
  bucket: string;
  dateLabel: string;
  plays: number;
  msPlayed: number;
}

export interface ListeningStreakSummary {
  longestStreak: number;
  currentStreak: number;
  streaks: Array<{
    start: string;
    end: string;
    length: number;
  }>;
}

export interface MonthlyTopTrack {
  month: string;
  trackName: string | null;
  artistName: string | null;
  playCount: number;
}

export interface ExportBundle {
  plays: Play[];
  overview: OverviewStats;
  topTracks: TopEntity[];
  topArtists: TopEntity[];
  timeline: TimelinePoint[];
}
