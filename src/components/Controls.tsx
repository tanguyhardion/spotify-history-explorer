import type { SortKey, SortState } from '../types';

export default function Controls({
  query,
  setQuery,
  sort,
  setSort,
  total,
  onClear,
}: {
  query: string;
  setQuery: (s: string) => void;
  sort: SortState;
  setSort: (s: SortState | ((prev: SortState) => SortState)) => void;
  total: number;
  onClear: () => void;
}) {
  const changeSort = (key: SortKey) => {
    setSort((prev: SortState) =>
      prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' },
    );
  };
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2 items-center flex-wrap">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tracks, artists, albums…"
          className="w-72 max-w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 placeholder-gray-400 backdrop-blur text-sm"
        />
        <button onClick={() => changeSort('ts')} className="px-3 py-2 rounded-md border border-gray-600 text-sm hover:bg-gray-700 bg-gray-800 text-gray-100">
          Time {sort.key === 'ts' ? (sort.direction === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button
          onClick={() => changeSort('master_metadata_track_name')}
          className="px-3 py-2 rounded-md border border-gray-600 text-sm hover:bg-gray-700 bg-gray-800 text-gray-100"
        >
          Track {sort.key === 'master_metadata_track_name' ? (sort.direction === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button
          onClick={() => changeSort('master_metadata_album_artist_name')}
          className="px-3 py-2 rounded-md border border-gray-600 text-sm hover:bg-gray-700 bg-gray-800 text-gray-100"
        >
          Artist {sort.key === 'master_metadata_album_artist_name' ? (sort.direction === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button
          onClick={() => changeSort('master_metadata_album_album_name')}
          className="px-3 py-2 rounded-md border border-gray-600 text-sm hover:bg-gray-700 bg-gray-800 text-gray-100"
        >
          Album {sort.key === 'master_metadata_album_album_name' ? (sort.direction === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button onClick={() => changeSort('ms_played')} className="px-3 py-2 rounded-md border border-gray-600 text-sm hover:bg-gray-700 bg-gray-800 text-gray-100">
          Duration {sort.key === 'ms_played' ? (sort.direction === 'asc' ? '↑' : '↓') : ''}
        </button>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-300">{total.toLocaleString()} plays</span>
        <button onClick={onClear} className="px-3 py-2 rounded-md border border-gray-600 hover:bg-gray-700 bg-gray-800 text-gray-100">
          Clear
        </button>
      </div>
    </div>
  );
}
