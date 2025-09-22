import { useState, useCallback } from "react";
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

  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.includes("json")) {
      return "Please select a valid JSON file";
    }

    if (file.size > APP_CONFIG.maxFileSize) {
      return `File size too large. Maximum size is ${APP_CONFIG.maxFileSize / (1024 * 1024)}MB`;
    }

    return null;
  }, []);

  const parseSpotifyData = useCallback((jsonData: any[]): Play[] => {
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

  const saveToDatabase = useCallback(async (plays: Play[]) => {
    await clearPlays();

    // Process in chunks to avoid blocking the UI
    for (let i = 0; i < plays.length; i += APP_CONFIG.chunkSize) {
      const chunk = plays.slice(i, i + APP_CONFIG.chunkSize);
      await addPlaysBulk(chunk);
    }
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const text = await file.text();
        const jsonData = JSON.parse(text);

        if (!Array.isArray(jsonData)) {
          throw new Error(
            "Invalid file format. Expected an array of listening history.",
          );
        }

        const plays = parseSpotifyData(jsonData);
        await saveToDatabase(plays);
        onData(plays);
      } catch (err) {
        console.error("File processing error:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to parse file. Please ensure it's a valid Spotify JSON file.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        // Clear the input to allow re-uploading the same file
        event.target.value = "";
      }
    },
    [validateFile, parseSpotifyData, saveToDatabase, onData],
  );

  if (variant === "prominent") {
    return (
      <div className={className}>
        <label className="block w-full">
          <input
            type="file"
            accept={SUPPORTED_FILE_TYPES.json}
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
            aria-label="Upload Spotify JSON file"
          />
          <div className="group cursor-pointer">
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
                      : "Upload Spotify JSON"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Click to select your downloaded Spotify data file
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
      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 cursor-pointer text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        <input
          type="file"
          accept={SUPPORTED_FILE_TYPES.json}
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
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
