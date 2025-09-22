import { useState } from 'react';
import { addPlaysBulk, clearPlays } from '../db';
import type { Play } from '../types';

export default function Upload({ 
  onData, 
  variant = 'header' 
}: { 
  onData: (rows: Play[]) => void;
  variant?: 'header' | 'prominent';
}) {
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

  if (variant === 'prominent') {
    return (
      <label className="block w-full">
        <input type="file" accept="application/json" className="hidden" onChange={onChange} />
        <div className="group cursor-pointer">
          <div className="w-full p-6 border-2 border-dashed border-gray-600 rounded-xl bg-gray-800/50 hover:bg-gray-800 hover:border-green-500 transition-all duration-200">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white">
                  {loading ? 'Importing your data...' : 'Upload Spotify JSON'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Click to select your downloaded Spotify data file
                </p>
              </div>
            </div>
          </div>
        </div>
      </label>
    );
  }

  return (
    <div className="flex items-center">
      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 cursor-pointer text-sm font-medium">
        <input type="file" accept="application/json" className="hidden" onChange={onChange} />
        {loading ? 'Importing…' : 'Upload New'}
      </label>
    </div>
  );
}
