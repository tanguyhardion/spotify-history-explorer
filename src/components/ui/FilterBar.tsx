import { useMemo } from 'react';
import clsx from 'clsx';
import type { PlayFilters } from '../../types/filters';
import { Button } from './Button';

interface FilterBarProps {
  filters: PlayFilters;
  onFiltersChange: (filters: PlayFilters) => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  artistOptions: string[];
  trackOptions: string[];
  timelineGrouping: 'day' | 'week' | 'month';
  onTimelineGroupingChange: (grouping: 'day' | 'week' | 'month') => void;
}

export const FilterBar = ({
  filters,
  onFiltersChange,
  onExportJson,
  onExportCsv,
  artistOptions,
  trackOptions,
  timelineGrouping,
  onTimelineGroupingChange
}: FilterBarProps) => {
  const updateFilters = (changes: Partial<PlayFilters>) => {
    onFiltersChange({ ...filters, ...changes });
  };

  const groupingButtons = useMemo(
    () => [
      { id: 'day', label: 'Daily' },
      { id: 'week', label: 'Weekly' },
      { id: 'month', label: 'Monthly' }
    ] as const,
    []
  );

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl shadow-black/30 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
          Date from
          <input
            type="date"
            value={filters.startDate ?? ''}
            onChange={(event) => updateFilters({ startDate: event.target.value || null })}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-spotify-green"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
          Date to
          <input
            type="date"
            value={filters.endDate ?? ''}
            onChange={(event) => updateFilters({ endDate: event.target.value || null })}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-spotify-green"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
          Search
          <input
            type="search"
            value={filters.searchTerm}
            placeholder="Track, artist, album…"
            onChange={(event) => updateFilters({ searchTerm: event.target.value })}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-spotify-green"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
          Artist
          <select
            value={filters.artist ?? ''}
            onChange={(event) => updateFilters({ artist: event.target.value || null })}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-spotify-green"
          >
            <option value="">All artists</option>
            {artistOptions.map((artist) => (
              <option key={artist} value={artist}>
                {artist}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-zinc-400 sm:col-span-2 lg:col-span-1">
          Track
          <select
            value={filters.track ?? ''}
            onChange={(event) => updateFilters({ track: event.target.value || null })}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-spotify-green"
          >
            <option value="">All tracks</option>
            {trackOptions.map((track) => (
              <option key={track} value={track}>
                {track}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 p-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
          {groupingButtons.map((button) => (
            <button
              key={button.id}
              type="button"
              onClick={() => onTimelineGroupingChange(button.id)}
              className={clsx(
                'rounded-full px-3 py-1 transition',
                timelineGrouping === button.id
                  ? 'bg-spotify-green text-black'
                  : 'hover:bg-zinc-800/70'
              )}
            >
              {button.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => onFiltersChange({ searchTerm: '', artist: null, track: null, startDate: null, endDate: null })}>
            Reset
          </Button>
          <Button onClick={onExportJson}>Export JSON</Button>
          <Button variant="secondary" onClick={onExportCsv}>
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
};
