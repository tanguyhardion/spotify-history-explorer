import { useState, useCallback } from "react";
import JSZip from "jszip";
import { addPlaysBulk, clearPlays } from "../db";
import { APP_CONFIG, SUPPORTED_FILE_TYPES } from "../constants/app";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import type { Play } from "../types";

interface FileUploadProps {
  onData: (data: Play[]) => void;
  variant?: "header" | "prominent";
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

  const validateFiles = useCallback((files: FileList): string | null => {
    if (files.length === 0) {
      return "Please select at least one JSON or ZIP file";
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isJson = file.type.includes("json");
      const isZip = file.type.includes("zip") || file.name.toLowerCase().endsWith('.zip');

      if (!isJson && !isZip) {
        return `File "${file.name}" is not a valid JSON or ZIP file`;
      }

      if (file.size > APP_CONFIG.maxFileSize) {
        return `File "${file.name}" is too large. Maximum size is ${APP_CONFIG.maxFileSize / (1024 * 1024)}MB per file`;
      }
    }

    return null;
  }, []);

  const parseSpotifyData = useCallback((jsonData: any[]): Play[] => { // eslint-disable-line @typescript-eslint/no-explicit-any
    return jsonData.map((item) => ({
      ts: item.ts,
      ms_played: Number(item.ms_played ?? 0),
      spotify_track_uri: item.spotify_track_uri ?? null,
      master_metadata_track_name: item.master_metadata_track_name ?? null,
      master_metadata_album_artist_name:
        item.master_metadata_album_artist_name ?? null,
      master_metadata_album_album_name:
        item.master_metadata_album_album_name ?? null,
    }));
  }, []);

  const extractJsonFromZip = useCallback(async (zipFile: File): Promise<string[]> => {
    const zip = await JSZip.loadAsync(zipFile);
    const jsonContents: string[] = [];

    for (const [filename, file] of Object.entries(zip.files)) {
      // Check if file is inside "Spotify Extended Streaming History" folder and matches the pattern
      if (filename.startsWith('Spotify Extended Streaming History/') && 
          filename.includes('Streaming_History_Audio_') && 
          filename.endsWith('.json')) {
        const content = await file.async('text');
        jsonContents.push(content);
      }
    }

    if (jsonContents.length === 0) {
      throw new Error('No valid Spotify streaming history files found in the ZIP. Files should be inside a "Spotify Extended Streaming History" folder and start with "Streaming_History_Audio_".');
    }

    return jsonContents;
  }, []);

  const saveToDatabase = useCallback(async (plays: Play[]) => {
    await clearPlays();

    // Process in chunks to avoid blocking the UI
    for (let i = 0; i < plays.length; i += APP_CONFIG.chunkSize) {
      const chunk = plays.slice(i, i + APP_CONFIG.chunkSize);
      await addPlaysBulk(chunk);
    }
  }, []);

  const processFiles = useCallback(
    async (files: FileList) => {
      const validationError = validateFiles(files);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let allPlays: Play[] = [];

        // Process each file and combine the data
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          let jsonContents: string[] = [];

          if (file.type.includes("zip") || file.name.toLowerCase().endsWith('.zip')) {
            // Handle ZIP file
            jsonContents = await extractJsonFromZip(file);
          } else {
            // Handle JSON file
            const text = await file.text();
            jsonContents = [text];
          }

          // Process each JSON content
          for (const jsonText of jsonContents) {
            const jsonData = JSON.parse(jsonText);

            if (!Array.isArray(jsonData)) {
              throw new Error(
                `Invalid file format in "${file.name}". Expected an array of listening history.`,
              );
            }

            const plays = parseSpotifyData(jsonData);
            allPlays = allPlays.concat(plays);
          }
        }

        // Sort by timestamp to maintain chronological order
        allPlays.sort(
          (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime(),
        );

        await saveToDatabase(allPlays);
        onData(allPlays);
      } catch (err) {
        console.error("File processing error:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to parse files. Please ensure they are valid Spotify JSON or ZIP file.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [validateFiles, parseSpotifyData, extractJsonFromZip, saveToDatabase, onData],
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);

      const files = event.dataTransfer.files;
      if (!files || files.length === 0) return;

      await processFiles(files);
    },
    [processFiles],
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      await processFiles(files);

      // Clear the input to allow re-uploading the same files
      event.target.value = "";
    },
    [processFiles],
  );

  if (variant === "prominent") {
    return (
      <div className={className}>
        <label className="block w-full">
          <input
            type="file"
            accept={`${SUPPORTED_FILE_TYPES.json},${SUPPORTED_FILE_TYPES.zip}`}
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
            multiple
            aria-label="Upload Spotify JSON or ZIP file"
          />
          <div
            className={`group cursor-pointer ${isDragOver ? 'border-green-400 bg-green-800/50' : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-full p-6 border-2 border-dashed border-gray-600 rounded-xl bg-gray-800/50 hover:bg-gray-800 hover:border-green-500 transition-all duration-200">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-white">
                    {isLoading
                      ? "Importing your data..."
                      : "Upload Spotify JSON or ZIP File"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Click to select your downloaded Spotify data files (JSON or ZIP)
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

  return (
    <div className={`flex items-center ${className}`}>
      <label
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 cursor-pointer text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isDragOver ? 'bg-green-500' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={`${SUPPORTED_FILE_TYPES.json},${SUPPORTED_FILE_TYPES.zip}`}
          className="hidden"
          onChange={handleFileChange}
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
