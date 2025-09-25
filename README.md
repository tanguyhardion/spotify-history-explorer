# Spotify History Explorer

Visualize your Spotify streaming history, uncover top tracks and artists, and explore listening trends over time. This app runs entirely in the browser and keeps your data local.

## Features

- **File ingestion**: Drag-and-drop or browse to upload Spotify JSON files or ZIP exports containing *Spotify Extended Streaming History*.
- **Fast parsing**: Large files are processed in a dedicated Web Worker with real-time progress feedback.
- **Interactive dashboard**: Rich cards, charts, and virtualized lists highlight your listening habits.
- **Filtering & search**: Narrow results by date range, artist, track, and free-text search.
- **Insights**: See streaks, monthly favourites, and other personalized metrics.
- **Exports**: Download summaries as JSON or the full play history as CSV.
- **Responsive UI**: Dark, Spotify-inspired theme optimized for desktop and mobile.

## Getting Started

```bash
npm install
npm run dev
```

Open the URL printed in the terminal (typically http://localhost:5173) and upload your Spotify data.

## Supported Files

- Individual `StreamingHistory*.json` files.
- ZIP archives that contain the `Spotify Extended Streaming History/Streaming_History_Audio_*.json` files.

If the expected files can’t be found, the app will display guidance for the proper structure.

## Deployment

The project is built with Vite and outputs a static bundle suitable for Netlify, Vercel, GitHub Pages, or any static host.

```bash
npm run build
npm run preview
```

## Tech Stack

- React + TypeScript
- Tailwind CSS
- Recharts for data visualization
- JSZip for ZIP parsing
- date-fns for date utilities
- react-window for virtualized lists

## License

MIT
