import { APP_TITLE } from '../../constants/app';
import { UploadButton } from '../upload/UploadButton';

interface AppHeaderProps {
  onUpload: (files: FileList | File[] | null) => void;
  isProcessing: boolean;
}

const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  const id = href.substring(1);
  const element = document.getElementById(id);
  if (element) {
    e.preventDefault();
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export const AppHeader = ({ onUpload, isProcessing }: AppHeaderProps) => (
  <header className="sticky top-0 z-30 border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur">
    <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-spotify-green/10 text-spotify-green">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
          </svg>
        </span>
        <div>
          <h1 className="text-lg font-semibold text-white">{APP_TITLE}</h1>
          <p className="text-xs text-zinc-500">Visualize your Spotify listening history</p>
        </div>
      </div>
      <nav className="flex items-center gap-3 text-sm text-zinc-400">
        <a href="#overview" onClick={(e) => handleNavClick(e, '#overview')} className="hidden rounded-full px-3 py-1 hover:bg-zinc-800/60 sm:block">
          Overview
        </a>
        <a href="#charts" onClick={(e) => handleNavClick(e, '#charts')} className="hidden rounded-full px-3 py-1 hover:bg-zinc-800/60 sm:block">
          Charts
        </a>
        <a href="#insights" onClick={(e) => handleNavClick(e, '#insights')} className="hidden rounded-full px-3 py-1 hover:bg-zinc-800/60 md:block">
          Insights
        </a>
        <UploadButton onFilesSelected={onUpload} isProcessing={isProcessing} />
      </nav>
    </div>
  </header>
);
