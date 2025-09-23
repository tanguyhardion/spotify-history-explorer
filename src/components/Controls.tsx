import { memo, useCallback } from "react";
import { Input, Button, SearchIcon, CloseIcon } from "./ui";

interface ControlsProps {
  query: string;
  setQuery: (query: string) => void;
  total: number;
  filteredCount: number;
}

/**
 * Search controls component with advanced search functionality
 * Supports field-specific searches and exact phrase matching
 */
function Controls({ query, setQuery, total, filteredCount }: ControlsProps) {
  const handleQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  }, [setQuery]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setQuery("");
    }
  }, [setQuery]);

  const handleClearClick = useCallback(() => {
    setQuery("");
  }, [setQuery]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex gap-2 items-center flex-wrap">
        <SearchField
          query={query}
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          onClear={handleClearClick}
        />
      </div>

      <PlayCountDisplay
        query={query}
        total={total}
        filteredCount={filteredCount}
      />
    </div>
  );
}

interface SearchFieldProps {
  query: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

function SearchField({ query, onChange, onKeyDown, onClear }: SearchFieldProps) {
  return (
    <div className="relative">
      <Input
        type="text"
        value={query}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder='Search tracks, artists, albums… Use "exact phrase", track:name, artist:name, album:name'
        className="w-full sm:w-[40rem] max-w-full pl-10 pr-10"
        aria-label="Search your music history"
      />
      
      <SearchIcon 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        size="sm"
        aria-hidden={true}
      />
      
      {query && (
        <Button
          variant="ghost"
          onClick={onClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded"
          aria-label="Clear search"
        >
          <CloseIcon size="sm" />
        </Button>
      )}
    </div>
  );
}

interface PlayCountDisplayProps {
  query: string;
  total: number;
  filteredCount: number;
}

function PlayCountDisplay({ query, total, filteredCount }: PlayCountDisplayProps) {
  return (
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
  );
}

export default memo(Controls);
