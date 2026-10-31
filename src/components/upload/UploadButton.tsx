import { useRef } from 'react';
import { Button } from '../ui/Button';

interface UploadButtonProps {
  onFilesSelected: (files: FileList | File[] | null) => void;
  isProcessing: boolean;
}

export const UploadButton = ({ onFilesSelected, isProcessing }: UploadButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".json,.zip,application/zip"
        className="hidden"
        onChange={() => {
          onFilesSelected(inputRef.current?.files ?? null);
          // Allow selecting the same file again later.
          if (inputRef.current) inputRef.current.value = '';
        }}
        disabled={isProcessing}
      />
      <Button
        size="sm"
        variant="primary"
        disabled={isProcessing}
        onClick={() => inputRef.current?.click()}
      >
        {isProcessing ? 'Processing…' : 'Upload data'}
      </Button>
    </>
  );
};
