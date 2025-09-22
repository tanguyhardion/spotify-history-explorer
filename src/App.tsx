import { useEffect, useMemo, useState } from 'react';
import './index.css';
import type { Play, SortState, SortKey } from './types';
import { getAllPlays, countPlays } from './db';
import Upload from './components/Upload';
import Controls from './components/Controls';
import TrackList from './components/TrackList';
import Stats from './components/Stats';

export default function App() {
  const [all, setAll] = useState<Play[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortState>({ key: 'ts', direction: 'desc' });
  const [isLoading, setIsLoading] = useState(true);

  const changeSort = (key: SortKey) => {
    setSort((prev: SortState) =>
      prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' },
    );
  };

  useEffect(() => {
    // load from IndexedDB on start
    (async () => {
      try {
        const c = await countPlays();
        if (c > 0) {
          const rows = await getAllPlays();
          // sort by ts desc by default
          rows.sort((a, b) => (a.ts > b.ts ? -1 : a.ts < b.ts ? 1 : 0));
          setAll(rows);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleDataUpload = (data: Play[]) => {
    setAll(data);
    setIsLoading(false);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = all;
    if (q) {
      out = all.filter((p) => {
        const parts = [
          p.ts,
          p.master_metadata_track_name,
          p.master_metadata_album_artist_name,
          p.master_metadata_album_album_name,
          String(p.ms_played),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return parts.includes(q);
      });
    }
    const dir = sort.direction === 'asc' ? 1 : -1;
    const key = sort.key;
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    out = [...out].sort((a, b) => {
      const av = a[key] ?? '';
      const bv = b[key] ?? '';
      if (key === 'ms_played') return dir * ((a.ms_played || 0) - (b.ms_played || 0));
      if (key === 'ts') return dir * (av > bv ? 1 : av < bv ? -1 : 0);
      return dir * collator.compare(String(av), String(bv));
    });
    return out;
  }, [all, query, sort]);

  // Show empty state when no data is available and not loading
  if (!isLoading && all.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 dark">
        <header className="sticky top-0 z-20 backdrop-blur bg-gray-900/70 border-b border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <h1 className="text-xl font-semibold text-center">
              <span className="text-green-400">Spotify</span> History Explorer
            </h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Get Started</h2>
              <p className="text-gray-400">
                Upload your Spotify listening history to explore your music data
              </p>
            </div>
            
            <Upload onData={handleDataUpload} variant="prominent" />
            
            <div className="space-y-4 pt-4 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-gray-300">How to get your Spotify data:</h3>
              <ol className="text-sm text-gray-400 space-y-2 text-left">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">1</span>
                  <span>Go to <a href="https://www.spotify.com/account/privacy/" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">Spotify Privacy Settings</a></span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">2</span>
                  <span>Scroll down and click "Request Data"</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">3</span>
                  <span>Select "Extended streaming history" and request</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">4</span>
                  <span>Wait for Spotify to email you (can take up to 30 days)</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">5</span>
                  <span>Upload any of the JSON files from the download</span>
                </li>
              </ol>
              <p className="text-xs text-gray-500 pt-2">
                All data is processed locally in your browser. We don't upload anything.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show main app when data is available
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 dark">
      <header className="sticky top-0 z-20 backdrop-blur bg-gray-900/70 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            <span className="text-green-400">Spotify</span> History Explorer
          </h1>
          <Upload onData={handleDataUpload} />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-4">
        <Stats data={filtered} />
        <div className="p-3 rounded-lg border border-gray-700 bg-gray-800 shadow-sm">
          <Controls
            query={query}
            setQuery={setQuery}
            total={all.length}
            onClear={() => {
              setQuery('');
              setSort({ key: 'ts', direction: 'desc' });
            }}
          />
          <TrackList data={filtered} sort={sort} onSort={changeSort} />
        </div>
        <p className="text-xs text-gray-400">
          All data is processed locally in your browser. We don't upload anything.
        </p>
      </main>
    </div>
  );
}
