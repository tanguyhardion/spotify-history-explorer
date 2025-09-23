export interface Play {
  ts: string; // ISO timestamp
  ms_played: number;
  spotify_track_uri: string | null;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
}

export interface StoredPlay extends Play {
  id?: number;
}

export type SortKey = keyof Pick<
  Play,
  | "ts"
  | "ms_played"
  | "master_metadata_track_name"
  | "master_metadata_album_artist_name"
  | "master_metadata_album_album_name"
>;

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

export interface SearchTerm {
  type: "general" | "exact" | "track" | "artist" | "album";
  value: string;
  isExact: boolean;
}

export interface PlayStatistics {
  totalPlaytime: string;
  uniqueTracks: number;
  uniqueArtists: number;
  averagePlaytime: string;
  topArtist: {
    name: string;
    plays: number;
  };
  topTrack: {
    name: string;
    plays: number;
  };
  topAlbum: {
    name: string;
    plays: number;
  };
}

export interface RawSpotifyData {
  ts: string;
  ms_played?: number;
  spotify_track_uri?: string;
  master_metadata_track_name?: string;
  master_metadata_album_artist_name?: string;
  master_metadata_album_album_name?: string;
  [key: string]: unknown; // Allow additional fields from Spotify
}
