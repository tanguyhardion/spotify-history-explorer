import { Virtuoso } from 'react-virtuoso';
import type { Play, SortKey, SortState } from '../types';
import { formatMs } from '../utils/format';

function Header({ 
  sort, 
  onSort 
}: { 
  sort: SortState; 
  onSort: (key: SortKey) => void;
}) {
  const getSortIcon = (key: SortKey) => {
    if (sort.key !== key) return '';
    return sort.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const headerClass = "cursor-pointer hover:text-gray-300 transition-colors select-none";

  return (
    <div className="grid grid-cols-12 gap-3 px-3 py-2 text-xs font-semibold uppercase text-gray-400 border-b border-gray-700 bg-gray-800 sticky top-0 z-10">
      <div className={`col-span-3 ${headerClass}`} onClick={() => onSort('ts')}>
        Time{getSortIcon('ts')}
      </div>
      <div className={`col-span-3 ${headerClass}`} onClick={() => onSort('master_metadata_track_name')}>
        Track{getSortIcon('master_metadata_track_name')}
      </div>
      <div className={`col-span-2 ${headerClass}`} onClick={() => onSort('master_metadata_album_artist_name')}>
        Artist{getSortIcon('master_metadata_album_artist_name')}
      </div>
      <div className={`col-span-3 ${headerClass}`} onClick={() => onSort('master_metadata_album_album_name')}>
        Album{getSortIcon('master_metadata_album_album_name')}
      </div>
      <div className={`col-span-1 text-right ${headerClass}`} onClick={() => onSort('ms_played')}>
        Played{getSortIcon('ms_played')}
      </div>
    </div>
  );
}

function Row({ index, style, data }: { index: number; style: React.CSSProperties; data: Play[] }) {
  const p = data[index] as Play;
  const date = new Date(p.ts);
  return (
    <div style={style} className="grid grid-cols-12 gap-3 px-3 py-2 text-sm items-center border-b border-gray-700 hover:bg-gray-700 bg-gray-800">
      <div className="col-span-3 text-gray-300">{isNaN(date.getTime()) ? p.ts : date.toLocaleString()}</div>
      <div className="col-span-3 truncate">
        {p.spotify_track_uri ? (
          <a
            href={p.spotify_track_uri}
            target="_blank"
            rel="noreferrer"
            className="text-green-400 hover:underline"
            title={p.master_metadata_track_name || ''}
          >
            {p.master_metadata_track_name || 'Unknown track'}
          </a>
        ) : (
          <span className="text-gray-400">{p.master_metadata_track_name || 'Unknown track'}</span>
        )}
      </div>
      <div className="col-span-2 truncate text-gray-200" title={p.master_metadata_album_artist_name || ''}>
        {p.master_metadata_album_artist_name || '—'}
      </div>
      <div className="col-span-3 truncate text-gray-200" title={p.master_metadata_album_album_name || ''}>
        {p.master_metadata_album_album_name || '—'}
      </div>
      <div className="col-span-1 text-right tabular-nums text-gray-200">{formatMs(p.ms_played || 0)}</div>
    </div>
  );
}

export default function TrackList({ 
  data, 
  sort, 
  onSort 
}: { 
  data: Play[]; 
  sort: SortState; 
  onSort: (key: SortKey) => void;
}) {
  return (
    <div className="h-[60vh] sm:h-[70vh] rounded-md border border-gray-700 overflow-hidden">
      <Header sort={sort} onSort={onSort} />
      <Virtuoso data={data} itemContent={(index) => <Row index={index} style={{}} data={data} />} />
    </div>
  );
}
