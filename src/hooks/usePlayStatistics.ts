import { useMemo } from "react";
import type { Play, PlayStatistics } from "../types";
import { calculatePlayStatistics } from "../utils";

/**
 * Custom hook for calculating play statistics
 * Memoized for performance with large datasets
 */
export function usePlayStatistics(data: Play[]): PlayStatistics {
  return useMemo(() => calculatePlayStatistics(data), [data]);
}