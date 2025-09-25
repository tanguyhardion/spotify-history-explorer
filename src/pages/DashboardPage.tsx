import { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { OverviewStatsGrid } from '../components/ui/OverviewStats';
import { TimelineChart } from '../components/charts/TimelineChart';
import { TopEntityChart } from '../components/charts/TopEntityChart';
import { VirtualizedList } from '../components/ui/VirtualizedList';
import { FilterBar } from '../components/ui/FilterBar';
import { CHART_COLORS } from '../constants/charts';
import type { Play } from '../types/plays';
import type { PlayFilters } from '../types/filters';
import { useDashboardData } from '../hooks/useDashboardData';

interface DashboardPageProps {
  plays: Play[];
  filters: PlayFilters;
  onFiltersChange: (filters: PlayFilters) => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  timelineGrouping: 'day' | 'week' | 'month';
  onTimelineGroupingChange: (grouping: 'day' | 'week' | 'month') => void;
  warnings: string[];
}

export const DashboardPage = ({
  plays,
  filters,
  onFiltersChange,
  onExportJson,
  onExportCsv,
  timelineGrouping,
  onTimelineGroupingChange,
  warnings
}: DashboardPageProps) => {
  const { overview, topTracks, topArtists, topAlbums, timeline, listeningStreak, monthlyTopTracks, filteredPlays } = useDashboardData(
    plays,
    filters,
    timelineGrouping
  );

  const artistOptions = useMemo(() =>
    Array.from(new Set(plays.map((play) => play.artistName).filter(Boolean) as string[])).sort(),
  [plays]);

  const trackOptions = useMemo(() =>
    Array.from(new Set(plays.map((play) => play.trackName).filter(Boolean) as string[])).sort(),
  [plays]);

  const topTrackItems = topTracks.map((track) => ({
    key: track.name,
    primary: track.name,
    secondary: track.sampleTrack?.artistName ?? 'Unknown artist',
    value: `${track.count.toLocaleString()} plays`,
    meta: `${track.percentage.toFixed(1)}%`
  }));

  const topArtistItems = topArtists.map((artist) => ({
    key: artist.name,
    primary: artist.name,
    secondary: artist.sampleTrack?.trackName ?? 'Unknown track',
    value: `${artist.count.toLocaleString()} plays`,
    meta: `${artist.percentage.toFixed(1)}%`
  }));

  const topAlbumItems = topAlbums.map((album) => ({
    key: album.name,
    primary: album.name,
    secondary: album.sampleTrack?.artistName ?? 'Unknown artist',
    value: `${album.count.toLocaleString()} plays`,
    meta: `${album.percentage.toFixed(1)}%`
  }));

  return (
    <div className="flex flex-col gap-10">
      <section id="filters" className="space-y-6">
        <FilterBar
          filters={filters}
          onFiltersChange={onFiltersChange}
          onExportJson={onExportJson}
          onExportCsv={onExportCsv}
          artistOptions={artistOptions}
          trackOptions={trackOptions}
          timelineGrouping={timelineGrouping}
          onTimelineGroupingChange={onTimelineGroupingChange}
        />
        {warnings.length > 0 && (
          <div className="space-y-2 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
            <p className="font-semibold">Some files had issues:</p>
            <ul className="list-disc space-y-1 pl-5 text-yellow-100/80">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section id="overview" className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Overview</h2>
        <OverviewStatsGrid overview={overview} />
        <Card
          title="Listening timeline"
          subtitle={`Showing ${filteredPlays.length.toLocaleString()} plays`}
          className="mt-6"
        >
          <TimelineChart data={timeline} />
        </Card>
      </section>

      <section id="charts" className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Top music</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Top tracks" subtitle="Most played tracks">
            <TopEntityChart data={topTracks} color={CHART_COLORS.tracks} />
          </Card>
          <Card title="Top artists" subtitle="Artists you return to the most">
            <TopEntityChart data={topArtists} color={CHART_COLORS.artists} />
          </Card>
        </div>
        <Card title="Top albums" subtitle="Albums on repeat">
          <TopEntityChart data={topAlbums} color={CHART_COLORS.albums} />
        </Card>
      </section>

      <section id="lists" className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Detailed breakdowns</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="Tracks" subtitle="Virtualized list for fast scrolling">
            <VirtualizedList items={topTrackItems} height={360} itemSize={64} />
          </Card>
          <Card title="Artists" subtitle="Who you listen to most">
            <VirtualizedList items={topArtistItems} height={360} itemSize={64} />
          </Card>
          <Card title="Albums" subtitle="Albums on rotation">
            <VirtualizedList items={topAlbumItems} height={360} itemSize={64} />
          </Card>
        </div>
      </section>

      <section id="insights" className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Insights</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card
            title="Listening streaks"
            subtitle="Track your consistency"
            actions={<span className="text-xs text-zinc-500">Longest streak {listeningStreak.longestStreak} days</span>}
          >
            <div className="space-y-3 text-sm text-zinc-300">
              <p>
                Current streak:{' '}
                <span className="font-semibold text-spotify-green">{listeningStreak.currentStreak} days</span>
              </p>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4 text-xs leading-relaxed">
                <ul className="space-y-2">
                  {listeningStreak.streaks.map((streak) => (
                    <li key={`${streak.start}-${streak.end}`} className="flex justify-between">
                      <span className="text-zinc-400">
                        {streak.start} → {streak.end}
                      </span>
                      <span className="font-medium text-white">{streak.length} days</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
          <Card title="Monthly favourites" subtitle="Top track every month">
            <div className="space-y-3 text-sm">
              {monthlyTopTracks.map((entry) => (
                <div key={entry.month} className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-950/40 px-4 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">{entry.month}</p>
                    <p className="text-sm font-semibold text-white">{entry.trackName ?? 'Unknown track'}</p>
                    <p className="text-xs text-zinc-400">{entry.artistName ?? 'Unknown artist'}</p>
                  </div>
                  <span className="text-sm font-semibold text-spotify-green">{entry.playCount.toLocaleString()} plays</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
