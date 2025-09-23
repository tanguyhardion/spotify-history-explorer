import { APP_CONFIG } from "../../constants/app";

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-gray-900/70 border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl font-semibold">
          <span className={`text-${APP_CONFIG.brandColor}`}>Spotify</span>{" "}
          History Explorer
        </h1>
        <div className="flex justify-end">{children}</div>
      </div>
    </header>
  );
}
