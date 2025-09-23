# Spotify History Explorer

A minimal web app to upload and explore your Spotify listening history locally in your browser.

## Features

- Upload multiple `Streaming_History_Audio_*.json` files (supports multiple files from split archives)
- Data is stored locally in IndexedDB for persistence
- Search and sort by time, track, artist, album, and duration
- Virtualized list for smooth scrolling through large histories
- Quick stats: total playtime and most played artist

## Getting Your Spotify Data

1. Go to [Spotify Privacy Settings](https://www.spotify.com/account/privacy/)
2. Scroll down to "Download your data" section
3. Request your **Extended streaming history** (not the Account data)
4. Wait for Spotify to prepare your data (can take several days)
5. Download the ZIP file when you receive the email notification
6. **Extract/Unzip the downloaded file** - you'll find multiple `Streaming_History_Audio_*.json` files
7. Select all the JSON files when uploading to this app

> **Note**: Spotify often splits large listening histories into multiple JSON files. This app supports uploading all of them at once for a complete history.

## Getting Started

1. Install dependencies:

```cmd
npm install
```

2. Start the dev server:

```cmd
npm run dev
```

3. Open the app (URL printed in the terminal, e.g. http://localhost:5173) and click `Upload Spotify JSON Files` to select your history files. You can select multiple files at once by holding Ctrl (Windows/Linux) or Cmd (Mac) while clicking.

## Build

```cmd
npm run build
npm run preview
```

## Privacy

Your data never leaves your browser: parsing, storage, and filtering happen entirely on your device using IndexedDB.

## Tech

- React + TypeScript + Vite
- Tailwind CSS
- IndexedDB via `idb`
- Virtual list via `react-virtuoso`
