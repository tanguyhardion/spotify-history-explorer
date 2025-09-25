export interface Play {
  id: string;
  timestamp: string;
  msPlayed: number;
  trackName: string | null;
  artistName: string | null;
  albumName: string | null;
  spotifyTrackUri: string | null;
  source: string;
}

export interface RawPlay {
  ts?: string;
  ms_played?: number;
  spotify_track_uri?: string;
  master_metadata_track_name?: string;
  master_metadata_album_artist_name?: string;
  master_metadata_album_album_name?: string;
  [key: string]: unknown;
}
