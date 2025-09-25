import { useEffect, useMemo, useState } from 'react';
import './index.css';
import { AppHeader } from './components/layout/AppHeader';
import { AppFooter } from './components/layout/AppFooter';
import { MainLayout } from './components/layout/MainLayout';
import { FileDropzone } from './components/upload/FileDropzone';
import { ProgressOverlay } from './components/ui/ProgressOverlay';
import { ErrorBanner } from './components/ui/ErrorBanner';
import { DashboardPage } from './pages/DashboardPage';
import { useFileProcessor } from './hooks/useFileProcessor';
import type { PlayFilters } from './types/filters';
import { buildCsvRowsFromPlays, buildOverviewStats, buildTimeline, getTopEntities } from './services/analytics';
import { downloadCsv, downloadJson } from './utils/download';

const defaultFilters: PlayFilters = {
  searchTerm: '',
  artist: null,
  track: null,
  startDate: null,
  endDate: null
};

function App() {
  const processor = useFileProcessor();
  const [filters, setFilters] = useState<PlayFilters>(defaultFilters);
  const [timelineGrouping, setTimelineGrouping] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    if (processor.status === 'ready') {
      setFilters(defaultFilters);
    }
  }, [processor.status]);

  useEffect(() => {
    if (processor.status === 'ready' && processor.plays.length) {
      const first = processor.plays[0]?.timestamp.slice(0, 10) ?? null;
      const last = processor.plays.at(-1)?.timestamp.slice(0, 10) ?? null;
      setFilters((prev) => ({
        ...prev,
        startDate: first,
        endDate: last
      }));
    }
  }, [processor.status, processor.plays]);

  const showDashboard = processor.status === 'ready' && processor.plays.length > 0;

  const exportSummary = useMemo(() => {
    if (!processor.plays.length) return null;
    const overview = buildOverviewStats(processor.plays);
    const topTracks = getTopEntities(processor.plays, 'trackName');
    const topArtists = getTopEntities(processor.plays, 'artistName');
    const topAlbums = getTopEntities(processor.plays, 'albumName');
    const timeline = buildTimeline(processor.plays, timelineGrouping);

    return { overview, topTracks, topArtists, topAlbums, timeline };
  }, [processor.plays, timelineGrouping]);

  const handleExportJson = () => {
    if (!exportSummary) return;
    downloadJson(exportSummary, 'spotify-history-summary.json');
  };

  const handleExportCsv = () => {
    if (!processor.plays.length) return;
    const rows = buildCsvRowsFromPlays(processor.plays);
    downloadCsv(rows, 'spotify-history-plays.csv');
  };

  return (
    <MainLayout
      header={<AppHeader onUpload={processor.handleFiles} isProcessing={processor.status === 'parsing'} />}
      footer={<AppFooter />}
    >
      {!showDashboard && (
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-white">Upload your Spotify streaming history</h2>
            <p className="text-sm text-zinc-400">
              Drop JSON or ZIP files exported from Spotify to explore listening trends, top artists, and more.
            </p>
          </div>
          <FileDropzone
            onFilesSelected={processor.handleFiles}
            isProcessing={processor.status === 'parsing'}
            statusMessage={processor.message}
          />
          {processor.status === 'error' && processor.error && (
            <ErrorBanner title="We hit a snag parsing your files." description={processor.error} onRetry={processor.reset} />
          )}
        </div>
      )}

      {showDashboard && (
        <DashboardPage
          plays={processor.plays}
          filters={filters}
          onFiltersChange={setFilters}
          onExportJson={handleExportJson}
          onExportCsv={handleExportCsv}
          timelineGrouping={timelineGrouping}
          onTimelineGroupingChange={setTimelineGrouping}
          warnings={processor.warnings}
        />
      )}

      <ProgressOverlay
        visible={processor.status === 'parsing'}
        message={processor.message}
        progress={Math.round(processor.progress)}
        currentFile={processor.currentFile}
      />
    </MainLayout>
  );
}

export default App;
