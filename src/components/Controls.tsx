export default function Controls({
  query,
  setQuery,
  total,
  onClear,
}: {
  query: string;
  setQuery: (s: string) => void;
  total: number;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex gap-2 items-center flex-wrap">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tracks, artists, albums…"
          className="w-72 max-w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 placeholder-gray-400 backdrop-blur text-sm"
        />
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-300">{total.toLocaleString()} plays</span>
        <button onClick={onClear} className="px-3 py-2 rounded-md border border-gray-600 hover:bg-gray-700 bg-gray-800 text-gray-100">
          Clear filters
        </button>
      </div>
    </div>
  );
}
