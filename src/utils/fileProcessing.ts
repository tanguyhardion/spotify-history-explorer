import JSZip from "jszip";
import type {
  RawSpotifyData,
  Play,
  FileValidationResult,
  UploadedFile,
} from "../types";
import { APP_CONFIG } from "../constants/app";

/**
 * Validates uploaded files for type and size constraints
 */
export function validateFiles(files: FileList): FileValidationResult {
  if (files.length === 0) {
    return {
      isValid: false,
      errorMessage: "Please select at least one JSON or ZIP file",
    };
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = validateSingleFile(file);
    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
}

/**
 * Validates a single file
 */
function validateSingleFile(file: File): FileValidationResult {
  const isJson = file.type.includes("json");
  const isZip =
    file.type.includes("zip") || file.name.toLowerCase().endsWith(".zip");

  if (!isJson && !isZip) {
    return {
      isValid: false,
      errorMessage: `File "${file.name}" is not a valid JSON or ZIP file`,
    };
  }

  if (file.size > APP_CONFIG.maxFileSize) {
    const maxSizeMB = APP_CONFIG.maxFileSize / (1024 * 1024);
    return {
      isValid: false,
      errorMessage: `File "${file.name}" is too large. Maximum size is ${maxSizeMB}MB per file`,
    };
  }

  return { isValid: true };
}

/**
 * Extracts JSON files from a ZIP archive
 */
export async function extractJsonFromZip(zipFile: File): Promise<string[]> {
  try {
    const zip = await JSZip.loadAsync(zipFile);
    const jsonContents: string[] = [];

    for (const [filename, file] of Object.entries(zip.files)) {
      // Check if file is inside "Spotify Extended Streaming History" folder and matches the pattern
      if (
        filename.startsWith("Spotify Extended Streaming History/") &&
        filename.includes("Streaming_History_Audio_") &&
        filename.endsWith(".json")
      ) {
        const content = await file.async("text");
        jsonContents.push(content);
      }
    }

    if (jsonContents.length === 0) {
      throw new Error(
        "No valid Spotify streaming history files found in the ZIP. " +
          'Files should be inside a "Spotify Extended Streaming History" folder ' +
          'and start with "Streaming_History_Audio_".',
      );
    }

    return jsonContents;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to extract ZIP file: ${String(error)}`);
  }
}

/**
 * Parses raw Spotify data into the expected Play format
 */
export function parseSpotifyData(jsonData: RawSpotifyData[]): Play[] {
  if (!Array.isArray(jsonData)) {
    throw new Error(
      "Invalid file format. Expected an array of listening history.",
    );
  }

  return jsonData.map((item, index) => {
    try {
      return {
        ts: item.ts,
        ms_played: Number(item.ms_played ?? 0),
        spotify_track_uri: item.spotify_track_uri ?? null,
        master_metadata_track_name: item.master_metadata_track_name ?? null,
        master_metadata_album_artist_name:
          item.master_metadata_album_artist_name ?? null,
        master_metadata_album_album_name:
          item.master_metadata_album_album_name ?? null,
      };
    } catch (error) {
      throw new Error(
        `Invalid data format at index ${index}: ${String(error)}`,
      );
    }
  });
}

/**
 * Processes files (JSON or ZIP) and returns parsed Play data
 */
export async function processFiles(files: FileList): Promise<Play[]> {
  const validation = validateFiles(files);
  if (!validation.isValid) {
    throw new Error(validation.errorMessage);
  }

  let allPlays: Play[] = [];

  // Process each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let jsonContents: string[] = [];

    if (file.type.includes("zip") || file.name.toLowerCase().endsWith(".zip")) {
      // Handle ZIP file
      jsonContents = await extractJsonFromZip(file);
    } else {
      // Handle JSON file
      const text = await file.text();
      jsonContents = [text];
    }

    // Process each JSON content
    for (const jsonText of jsonContents) {
      try {
        const jsonData = JSON.parse(jsonText);
        const plays = parseSpotifyData(jsonData);
        allPlays = allPlays.concat(plays);
      } catch (error) {
        throw new Error(
          `Failed to parse JSON in "${file.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  // Sort by timestamp to maintain chronological order
  allPlays.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

  return allPlays;
}

/**
 * Creates a file object with metadata
 */
export function createUploadedFile(file: File): UploadedFile {
  return {
    file,
    size: file.size,
    type: file.type,
    name: file.name,
  };
}
