import { format, parseISO } from 'date-fns';
import type { DateRangeFilter } from '../types/filters';

export const formatIsoToFriendly = (iso: string, pattern = 'PPpp') =>
  format(parseISO(iso), pattern);

export const toDayKey = (iso: string) => format(parseISO(iso), 'yyyy-MM-dd');
export const toMonthKey = (iso: string) => format(parseISO(iso), 'yyyy-MM');
export const toWeekKey = (iso: string) => format(parseISO(iso), "RRRR-'W'II");

export const isWithinRange = (iso: string, range: DateRangeFilter) => {
  const date = parseISO(iso);
  if (range.startDate && date < parseISO(range.startDate)) {
    return false;
  }
  if (range.endDate && date > parseISO(range.endDate)) {
    return false;
  }
  return true;
};

export const formatMsToDuration = (ms: number) => {
  if (!ms) return '0s';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [] as string[];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
};
