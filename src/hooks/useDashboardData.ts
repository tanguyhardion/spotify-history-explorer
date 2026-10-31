import { useEffect, useRef, useState } from 'react';
import type { TimelineGrouping } from '../services/analytics';
import type { PlayFilters } from '../types/filters';
import type { Play } from '../types/plays';
import type { AnalyticsWorkerOutgoingMessage, CalculationResult } from '../types/analyticsWorker';

const initialResult: CalculationResult = {
  filteredCount: 0,
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
  const latestRequestRef = useRef(0);
  const [data, setData] = useState<CalculationResult>(initialResult);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/analyticsWorker.ts', import.meta.url), {
      type: 'module'
    });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<AnalyticsWorkerOutgoingMessage>) => {
      // Ignore results of superseded requests so stale data never overwrites newer filters.
      if (event.data.type !== 'RESULT' || event.data.requestId !== latestRequestRef.current) return;
      setData(event.data.payload);
      setIsCalculating(false);
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Worker holds its own copy of the plays; only re-send when they change.
  useEffect(() => {
    workerRef.current?.postMessage({ type: 'SET_PLAYS', payload: { plays } });
  }, [plays]);

  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;
    latestRequestRef.current += 1;
    setIsCalculating(true);
    worker.postMessage({
      type: 'CALCULATE',
      payload: { requestId: latestRequestRef.current, filters, timelineGrouping }
    });
  }, [plays, filters, timelineGrouping]);

  return { ...data, isCalculating };
};
