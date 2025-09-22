export type Play = {
  ts: string; // ISO timestamp
  ms_played: number;
  spotify_track_uri: string | null;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
};

export type SortKey = keyof Pick<
  Play,
  | 'ts'
  | 'ms_played'
  | 'master_metadata_track_name'
  | 'master_metadata_album_artist_name'
  | 'master_metadata_album_album_name'
>;

export type SortState = {
  key: SortKey;
  direction: 'asc' | 'desc';
};
