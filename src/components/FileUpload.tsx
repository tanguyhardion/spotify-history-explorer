import { useState, useCallback } from "react";
import { SUPPORTED_FILE_TYPES } from "../constants/app";
import { LoadingSpinner, UploadIcon } from "./ui";
import { SpotifyDataService } from "../services";
import type { Play, FileUploadVariant } from "../types";

interface FileUploadProps {
  onData: (data: Play[]) => void;
  variant?: FileUploadVariant;
  className?: string;
}

export default function FileUpload({
  onData,
  variant = "header",
  className = "",
}: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (!files || files.length === 0) return;

      setIsLoading(true);
      setError(null);

      try {
        const allPlays = await SpotifyDataService.importData(files);
        onData(allPlays);
      } catch (err) {
        console.error("File processing error:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to parse files. Please ensure they are valid Spotify JSON or ZIP files.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [onData],
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);
      await handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) {
        await handleFiles(files);
      }
      // Clear the input to allow re-uploading the same files
      event.target.value = "";
    },
    [handleFiles],
  );

  if (variant === "prominent") {
    return (
      <ProminentUpload
        onFileChange={handleFileChange}
        onDragHandlers={{
          onDragOver: handleDragOver,
          onDragEnter: handleDragEnter,
          onDragLeave: handleDragLeave,
          onDrop: handleDrop,
        }}
        isLoading={isLoading}
        isDragOver={isDragOver}
        error={error}
        className={className}
      />
    );
  }

  return (
    <HeaderUpload
      onFileChange={handleFileChange}
      onDragHandlers={{
        onDragOver: handleDragOver,
        onDragEnter: handleDragEnter,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
      }}
      isLoading={isLoading}
      isDragOver={isDragOver}
      error={error}
      className={className}
    />
  );
}

interface DragHandlers {
  onDragOver: (event: React.DragEvent) => void;
  onDragEnter: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
}

interface UploadComponentProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragHandlers: DragHandlers;
  isLoading: boolean;
  isDragOver: boolean;
  error: string | null;
  className: string;
}

function ProminentUpload({
  onFileChange,
  onDragHandlers,
  isLoading,
  isDragOver,
  error,
  className,
}: UploadComponentProps) {
  return (
    <div className={className}>
      <label className="block w-full">
        <input
          type="file"
          accept={`${SUPPORTED_FILE_TYPES.json},${SUPPORTED_FILE_TYPES.zip}`}
          className="hidden"
          onChange={onFileChange}
          disabled={isLoading}
          multiple
          aria-label="Upload Spotify JSON or ZIP file"
        />
        <div
          className={`group cursor-pointer ${
            isDragOver ? "border-green-400 bg-green-800/50" : ""
          }`}
          {...onDragHandlers}
        >
          <div className="w-full p-6 border-2 border-dashed border-gray-600 rounded-xl bg-gray-800/50 hover:bg-gray-800 hover:border-green-500 transition-all duration-200">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <UploadIcon size="md" className="text-white" />
                )}
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white">
                  {isLoading
                    ? "Importing your data..."
                    : "Upload Spotify JSON or ZIP File"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Click to select your downloaded Spotify data files (JSON or
                  ZIP)
                </p>
              </div>
            </div>
          </div>
        </div>
      </label>

      {error && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-md text-red-300 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

function HeaderUpload({
  onFileChange,
  onDragHandlers,
  isLoading,
  isDragOver,
  error,
  className,
}: UploadComponentProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <label
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-md 
          bg-green-600 text-white hover:bg-green-700 cursor-pointer 
          text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed 
          transition-colors
          ${isDragOver ? "bg-green-500" : ""}
        `}
        {...onDragHandlers}
      >
        <input
          type="file"
          accept={`${SUPPORTED_FILE_TYPES.json},${SUPPORTED_FILE_TYPES.zip}`}
          className="hidden"
          onChange={onFileChange}
          disabled={isLoading}
          multiple
          aria-label="Upload new Spotify data"
        />
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            Importing...
          </>
        ) : (
          "Upload New"
        )}
      </label>

      {error && <div className="ml-3 text-red-400 text-sm">{error}</div>}
    </div>
  );
}
