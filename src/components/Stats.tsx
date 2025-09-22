import { useMemo } from 'react';
import type { Play } from '../types';
import { formatMs } from '../utils/format';

export default function Stats({ data }: { data: Play[] }) {
  const totalMs = useMemo(() => data.reduce((acc, p) => acc + (p.ms_played || 0), 0), [data]);
  const topArtist = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of data) {
      const a = p.master_metadata_album_artist_name || 'Unknown';
      map.set(a, (map.get(a) || 0) + 1);
    }
    let best = '—';
    let count = 0;
    for (const [k, v] of map) if (v > count) {
      best = k;
      count = v;
    }
    return { artist: best, plays: count };
  }, [data]);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="p-3 rounded-md border border-gray-700 bg-gray-800">
        <div className="text-xs text-gray-400">Total Playtime</div>
        <div className="text-lg font-semibold text-gray-100">{formatMs(totalMs)}</div>
      </div>
      <div className="p-3 rounded-md border border-gray-700 bg-gray-800">
        <div className="text-xs text-gray-400">Most Played Artist</div>
        <div className="text-lg font-semibold truncate text-gray-100" title={topArtist.artist}>
          {topArtist.artist} <span className="text-gray-400 text-sm">({topArtist.plays})</span>
        </div>
      </div>
    </div>
  );
}
