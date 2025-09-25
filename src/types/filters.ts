export interface DateRangeFilter {
  startDate: string | null;
  endDate: string | null;
}

export interface PlayFilters extends DateRangeFilter {
  searchTerm: string;
  artist: string | null;
  track: string | null;
}
