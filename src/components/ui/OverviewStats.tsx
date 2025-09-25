import { formatNumber } from '../../utils/format';
import { formatMsToDuration } from '../../utils/date';
import type { OverviewStats as OverviewStatsType } from '../../types/analytics';

interface OverviewStatsProps {
  overview: OverviewStatsType;
}

export const OverviewStatsGrid = ({ overview }: OverviewStatsProps) => {
  const items = [
    {
      label: 'Total plays',
      value: formatNumber(overview.totalPlays)
    },
    {
      label: 'Unique tracks',
      value: formatNumber(overview.uniqueTracks)
    },
    {
      label: 'Unique artists',
      value: formatNumber(overview.uniqueArtists)
    },
    {
      label: 'Total listening time',
      value: formatMsToDuration(overview.totalMsPlayed)
    },
    {
      label: 'Average play length',
      value: formatMsToDuration(overview.averageMsPlayed)
    }
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-5 shadow-lg shadow-black/30"
        >
          <p className="text-xs uppercase tracking-wide text-zinc-500">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
};
