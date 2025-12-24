import { useEffect, useRef, useState } from 'react';
import type { TimelineGrouping } from '../services/analytics';
import type { PlayFilters } from '../types/filters';
import type { Play } from '../types/plays';
import type { AnalyticsWorkerOutgoingMessage, CalculationResult } from '../types/analyticsWorker';

const initialResult: CalculationResult = {
  filteredPlays: [],
  overview: {
    totalPlays: 0,
    uniqueTracks: 0,
    uniqueArtists: 0,
    totalMsPlayed: 0,
    averageMsPlayed: 0
  },
  topTracks: [],
  topArtists: [],
  topAlbums: [],
  timeline: [],
  listeningStreak: {
    currentStreak: 0,
    longestStreak: 0,
    streaks: []
  },
  monthlyTopTracks: []
};

export const useDashboardData = (
  plays: Play[],
  filters: PlayFilters,
  timelineGrouping: TimelineGrouping
) => {
  const workerRef = useRef<Worker | null>(null);
  const [data, setData] = useState<CalculationResult>(initialResult);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/analyticsWorker.ts', import.meta.url), {
      type: 'module'
    });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<AnalyticsWorkerOutgoingMessage>) => {
      if (event.data.type === 'RESULT') {
        setData(event.data.payload);
        setIsCalculating(false);
      }
    };

    return () => {
      worker.terminate();
    };
  }, []);

  useEffect(() => {
    if (workerRef.current) {
      setIsCalculating(true);
      workerRef.current.postMessage({
        type: 'SET_PLAYS',
        payload: { plays }
      });
      workerRef.current.postMessage({
        type: 'CALCULATE',
        payload: { filters, timelineGrouping }
      });
    }
  }, [plays]);

  useEffect(() => {
    if (workerRef.current) {
      setIsCalculating(true);
      workerRef.current.postMessage({
        type: 'CALCULATE',
        payload: { filters, timelineGrouping }
      });
    }
  }, [filters, timelineGrouping]);

  return { ...data, isCalculating };
};
