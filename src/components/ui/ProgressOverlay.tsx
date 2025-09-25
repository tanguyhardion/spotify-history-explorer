import clsx from 'clsx';
import { Spinner } from './Spinner';

interface ProgressOverlayProps {
  visible: boolean;
  message: string;
  progress: number;
  currentFile?: string | null;
}

export const ProgressOverlay = ({ visible, message, progress, currentFile }: ProgressOverlayProps) => (
  <div
    className={clsx(
      'pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition opacity-0',
      visible && 'pointer-events-auto opacity-100'
    )}
    aria-live="polite"
  >
    <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 px-8 py-6 shadow-2xl">
      <Spinner size={36} />
      <div className="w-full text-center text-sm text-zinc-300">
        <p className="font-medium text-white">{message}</p>
        {currentFile && <p className="mt-2 truncate text-xs text-zinc-500">{currentFile}</p>}
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full bg-spotify-green transition-all duration-300"
          style={{ width: `${Math.max(5, progress)}%` }}
        />
      </div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{progress}% complete</p>
    </div>
  </div>
);
