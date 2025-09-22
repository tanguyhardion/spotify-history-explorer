import { useEffect, useMemo, useState } from 'react';
import './index.css';
import type { Play, SortState } from './types';
import { clearPlays, getAllPlays, countPlays } from './db';
import Upload from './components/Upload';
import Controls from './components/Controls';
import TrackList from './components/TrackList';
import Stats from './components/Stats';

export default function App() {
  const [all, setAll] = useState<Play[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortState>({ key: 'ts', direction: 'desc' });

  useEffect(() => {
    // load from IndexedDB on start
    (async () => {
      const c = await countPlays();
      if (c > 0) {
        const rows = await getAllPlays();
        // sort by ts desc by default
        rows.sort((a, b) => (a.ts > b.ts ? -1 : a.ts < b.ts ? 1 : 0));
        setAll(rows);
      }
    })();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 dark">
      <header className="sticky top-0 z-20 backdrop-blur bg-gray-900/70 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            <span className="text-green-400">Spotify</span> History Explorer
          </h1>
          <Upload onData={setAll} />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-4">
        <Stats data={filtered} />
        <div className="p-3 rounded-lg border border-gray-700 bg-gray-800 shadow-sm">
          <Controls
            query={query}
            setQuery={setQuery}
            sort={sort}
            setSort={setSort}
            total={all.length}
            onClear={async () => {
              await clearPlays();
              setAll([]);
            }}
          />
          <TrackList data={filtered} />
        </div>
        <p className="text-xs text-gray-400">
          All data is processed locally in your browser. We don't upload anything.
        </p>
      </main>
    </div>
  );
}
