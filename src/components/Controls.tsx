import { memo } from "react";

interface ControlsProps {
  query: string;
  setQuery: (query: string) => void;
  total: number;
  filteredCount: number;
}

function Controls({
  query,
  setQuery,
  total,
  filteredCount,
}: ControlsProps) {
  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setQuery("");
    }
  };

  const handleClearClick = () => {
    setQuery("");
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex gap-2 items-center flex-wrap">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            placeholder="Search tracks, artists, albums…"
            className="w-72 max-w-full px-3 py-2 pl-10 pr-10 border border-gray-600 rounded-md bg-gray-700 text-gray-100 placeholder-gray-400 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            aria-label="Search your music history"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {query && (
            <button
              onClick={handleClearClick}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-200 transition-colors focus:outline-none focus:text-gray-200 rounded"
              aria-label="Clear search"
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-300">
          {query ? (
            <>
              {filteredCount.toLocaleString()} of {total.toLocaleString()} plays
            </>
          ) : (
            `${total.toLocaleString()} plays`
          )}
        </span>
      </div>
    </div>
  );
}

export default memo(Controls);
