export const AppFooter = () => (
  <footer className="mt-16 border-t border-zinc-800/60 bg-zinc-950/70">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Built for music lovers. Your data never leaves the browser.
      </p>
      <div className="flex items-center gap-4">
        <a
          href="https://www.spotify.com"
          target="_blank"
          rel="noreferrer"
          className="hover:text-spotify-green"
        >
          Spotify
        </a>
        <a
          href="https://github.com/tanguyhardion/spotify-history-explorer"
          target="_blank"
          rel="noreferrer"
          className="hover:text-spotify-green"
        >
          GitHub
        </a>
      </div>
    </div>
  </footer>
);
