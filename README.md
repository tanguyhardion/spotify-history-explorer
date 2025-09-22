# Spotify History Explorer

A minimal web app to upload and explore your Spotify listening history locally in your browser.

## Features

- Upload your `Streaming_History_Audio_*.json` file(s)
- Data is stored locally in IndexedDB for persistence
- Search and sort by time, track, artist, album, and duration
- Virtualized list for smooth scrolling through large histories
- Quick stats: total playtime and most played artist

## Getting Started

1. Install dependencies:

```cmd
npm install
```

2. Start the dev server:

```cmd
npm run dev
```

3. Open the app (URL printed in the terminal, e.g. http://localhost:5173) and click `Upload Spotify JSON` to select your history file. An example is available at `example_file.json`.

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

