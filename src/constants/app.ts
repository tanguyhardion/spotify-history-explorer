export const APP_CONFIG = {
  name: "Spotify History Explorer",
  brandColor: "green-400",
  maxFileSize: 50 * 1024 * 1024, // 50MB per file
  chunkSize: 2000,
  virtualListHeight: {
    mobile: "60vh",
    desktop: "70vh",
  },
} as const;

export const SPOTIFY_URLS = {
  privacy: "https://www.spotify.com/account/privacy/",
} as const;

export const DEFAULT_SORT_STATE = {
  key: "ts" as const,
  direction: "desc" as const,
};

export const SUPPORTED_FILE_TYPES = {
  json: "application/json",
  zip: "application/zip",
} as const;
