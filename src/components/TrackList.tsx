import { Virtuoso } from "react-virtuoso";
import { memo, useCallback } from "react";
import type { Play, SortKey, SortState } from "../types";
import { formatMs } from "../utils/format";
import { APP_CONFIG } from "../constants/app";

interface TrackListProps {
  data: Play[];
  sort: SortState;
  onSort: (key: SortKey) => void;
}

interface HeaderProps {
  sort: SortState;
  onSort: (key: SortKey) => void;
}

interface TrackRowProps {
  index: number;
  play: Play;
}

const COLUMNS = [
  { key: "ts" as const, label: "Time", span: "col-span-3" },
  {
    key: "master_metadata_track_name" as const,
    label: "Track",
    span: "col-span-3",
  },
  {
    key: "master_metadata_album_artist_name" as const,
    label: "Artist",
    span: "col-span-2",
  },
  {
    key: "master_metadata_album_album_name" as const,
    label: "Album",
    span: "col-span-3",
  },
  { key: "ms_played" as const, label: "Played", span: "col-span-1 text-right" },
] as const;

function getSortIcon(sortKey: SortKey, currentSort: SortState): string {
  if (currentSort.key !== sortKey) return "";
  return currentSort.direction === "asc" ? " ↑" : " ↓";
}

function formatTrackTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? timestamp : date.toLocaleString();
}

function TrackHeader({ sort, onSort }: HeaderProps) {
  const handleColumnClick = useCallback(
    (key: SortKey) => {
      onSort(key);
    },
    [onSort]
  );

  return (
    <div className="grid grid-cols-12 gap-3 px-3 py-2 text-xs font-semibold uppercase text-gray-400 border-b border-gray-700 bg-gray-800 sticky top-0 z-10">
      {COLUMNS.map(({ key, label, span }) => (
        <button
          key={key}
          type="button"
          className={`${span} cursor-pointer hover:text-gray-300 transition-colors select-none text-left focus:outline-none focus:text-gray-300`}
          onClick={() => handleColumnClick(key)}
          aria-label={`Sort by ${label}`}
        >
          {label}
          {getSortIcon(key, sort)}
        </button>
      ))}
    </div>
  );
}

function TrackRow({ play, index }: TrackRowProps) {
  const formattedTime = formatTrackTimestamp(play.ts);
  const playDuration = formatMs(play.ms_played || 0);

  const trackName = play.master_metadata_track_name || "Unknown track";
  const artistName = play.master_metadata_album_artist_name || "—";
  const albumName = play.master_metadata_album_album_name || "—";

  return (
    <div
      className="grid grid-cols-12 gap-3 px-3 py-2 text-sm items-center border-b border-gray-700 hover:bg-gray-700 bg-gray-800 transition-colors"
      role="row"
      aria-rowindex={index + 2} // +2 because header is row 1
    >
      <div className="col-span-3 text-gray-300" title={formattedTime}>
        {formattedTime}
      </div>

      <div className="col-span-3 truncate">
        {play.spotify_track_uri ? (
          <a
            href={play.spotify_track_uri}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-${APP_CONFIG.brandColor} hover:underline focus:outline-none focus:underline`}
            title={trackName}
            aria-label={`Open ${trackName} in Spotify`}
          >
            {trackName}
          </a>
        ) : (
          <span className="text-gray-400" title={trackName}>
            {trackName}
          </span>
        )}
      </div>

      <div className="col-span-2 truncate text-gray-200" title={artistName}>
        {artistName}
      </div>

      <div className="col-span-3 truncate text-gray-200" title={albumName}>
        {albumName}
      </div>

      <div className="col-span-1 text-right tabular-nums text-gray-200">
        {playDuration}
      </div>
    </div>
  );
}

const MemoizedTrackRow = memo(TrackRow);

function TrackList({ data, sort, onSort }: TrackListProps) {
  const itemContent = useCallback(
    (index: number) => {
      const play = data[index];
      return (
        <MemoizedTrackRow
          key={`${play.ts}-${index}`}
          play={play}
          index={index}
        />
      );
    },
    [data]
  );

  if (data.length === 0) {
    return (
      <div className="h-[60vh] sm:h-[70vh] rounded-md border border-gray-700 overflow-hidden flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-lg font-medium">No tracks found</p>
          <p className="text-sm">Try adjusting your search filters</p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="table"
      aria-label="Music listening history"
      className="h-[60vh] sm:h-[70vh] rounded-md border border-gray-700 overflow-hidden flex flex-col"
    >
      <TrackHeader sort={sort} onSort={onSort} />
      <div className="flex-1 min-h-0">
        <Virtuoso
          data={data}
          itemContent={itemContent}
          className="h-full"
        />
      </div>
    </div>
  );
}

export default memo(TrackList);
