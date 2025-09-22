import { useState } from 'react';
import { addPlaysBulk, clearPlays } from '../db';
import type { Play } from '../types';

export default function Upload({ onData }: { onData: (rows: Play[]) => void }) {
  const [loading, setLoading] = useState(false);
  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text) as any[];
      const rows: Play[] = json.map((r) => ({
        ts: r.ts,
        ms_played: Number(r.ms_played ?? 0),
        spotify_track_uri: r.spotify_track_uri ?? null,
        master_metadata_track_name: r.master_metadata_track_name ?? null,
        master_metadata_album_artist_name: r.master_metadata_album_artist_name ?? null,
        master_metadata_album_album_name: r.master_metadata_album_album_name ?? null,
      }));
      await clearPlays();
      const chunkSize = 2000;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        // eslint-disable-next-line no-await-in-loop
        await addPlaysBulk(chunk);
      }
      onData(rows);
    } catch (err) {
      console.error(err);
      alert('Failed to parse file. Please ensure it\'s a valid Spotify JSON.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };
  return (
    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 cursor-pointer text-sm font-medium">
      <input type="file" accept="application/json" className="hidden" onChange={onChange} />
      {loading ? 'Importing…' : 'Upload Spotify JSON'}
    </label>
  );
}
