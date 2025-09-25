import { useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import { Button } from '../ui/Button';

interface FileDropzoneProps {
  onFilesSelected: (files: FileList | File[] | null) => void;
  isProcessing: boolean;
  statusMessage: string;
}

export const FileDropzone = ({ onFilesSelected, isProcessing, statusMessage }: FileDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (isProcessing) return;
      onFilesSelected(event.dataTransfer.files);
    },
    [isProcessing, onFilesSelected]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (!isProcessing) setIsDragging(true);
  }, [isProcessing]);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onChange = useCallback(() => {
    onFilesSelected(inputRef.current?.files ?? null);
  }, [onFilesSelected]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <label
        htmlFor="file-upload"
        className={clsx(
          'group relative block cursor-pointer rounded-3xl border-2 border-dashed border-zinc-700 bg-zinc-900/40 p-12 text-center transition hover:border-spotify-green hover:bg-zinc-900/60',
          isDragging && 'border-spotify-green bg-zinc-900/70',
          isProcessing && 'pointer-events-none opacity-60'
        )}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          id="file-upload"
          ref={inputRef}
          type="file"
          multiple
          accept=".json,.zip,application/zip"
          className="hidden"
          onChange={onChange}
          disabled={isProcessing}
        />
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-zinc-300">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-spotify-green/10 text-spotify-green">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M12 16a1 1 0 001-1V8.41l1.29 1.3a1 1 0 101.42-1.42l-3-3a1 1 0 00-1.42 0l-3 3a1 1 0 001.42 1.42L11 8.41V15a1 1 0 001 1zm7 2H5a3 3 0 01-3-3V7a3 3 0 013-3h5a1 1 0 110 2H5a1 1 0 00-1 1v8a1 1 0 001 1h14a1 1 0 001-1V7a1 1 0 00-1-1h-5a1 1 0 110-2h5a3 3 0 013 3v8a3 3 0 01-3 3z" />
            </svg>
          </span>
          <div>
            <p className="text-lg font-semibold text-white">Drop your Spotify data here</p>
            <p className="mt-2 text-sm text-zinc-400">
              Supports JSON files (StreamingHistory*.json) or ZIP archives with Spotify Extended Streaming History.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-wide text-zinc-500">
            <span>10MB+ files</span>
            <span>Multiple files supported</span>
            <span>Secure & in-browser</span>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
          >
            Browse files
          </Button>
          <p className="text-xs text-zinc-500">{statusMessage}</p>
        </div>
      </label>
    </div>
  );
};
