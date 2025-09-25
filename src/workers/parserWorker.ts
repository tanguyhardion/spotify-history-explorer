/// <reference lib="webworker" />

import JSZip, { type JSZipObject } from 'jszip';
import { FILE_ERROR_MESSAGE, ZIP_EXPECTED_FOLDER, ZIP_FILE_PREFIX } from '../constants/app';
import type {
  ParseRequestMessage,
  ParseWorkerIncomingMessage,
  ParseWorkerOutgoingMessage
} from '../types/parser';
import type { Play, RawPlay } from '../types/plays';

const ctx = self as DedicatedWorkerGlobalScope;

ctx.addEventListener('message', async (event: MessageEvent<ParseWorkerIncomingMessage>) => {
  const message = event.data as ParseRequestMessage;
  if (message.type !== 'parse') return;

  const { files } = message.payload;
  try {
    const { plays, warnings } = await parseFiles(files);
    ctx.postMessage({
      type: 'complete',
      payload: {
        plays,
        warnings
      }
    } satisfies ParseWorkerOutgoingMessage);
  } catch (error) {
    ctx.postMessage({
      type: 'error',
      payload: {
        error: error instanceof Error ? error.message : 'Failed to parse files'
      }
    } satisfies ParseWorkerOutgoingMessage);
  }
});

interface ParseTask {
  name: string;
  parser: () => Promise<Play[]>;
}

const parseFiles = async (files: File[]) => {
  const tasks: ParseTask[] = [];
  const warnings: string[] = [];

  for (const file of files) {
    if (file.name.toLowerCase().endsWith('.json')) {
      tasks.push({ name: file.name, parser: () => parseJsonFile(file.name, file) });
    } else if (file.name.toLowerCase().endsWith('.zip')) {
      const zip = await JSZip.loadAsync(file);
      const folder = zip.folder(ZIP_EXPECTED_FOLDER);
      if (!folder) {
        warnings.push(`File ${file.name} is missing the "${ZIP_EXPECTED_FOLDER}" folder.`);
        continue;
      }

      const folderTasks: ParseTask[] = [];
  folder.forEach((relativePath: string, entry: JSZipObject) => {
        if (entry.dir) return;
        const baseName = relativePath.split('/').pop() ?? relativePath;
        if (baseName.startsWith(ZIP_FILE_PREFIX) && baseName.endsWith('.json')) {
          folderTasks.push({
            name: baseName,
            parser: async () => {
              const content = await entry.async('string');
              return normalizeJson(content, baseName);
            }
          });
        }
      });

      if (!folderTasks.length) {
        warnings.push(`No streaming history files found inside ${file.name}. Expected files named "${ZIP_FILE_PREFIX}*.json".`);
      }
      tasks.push(...folderTasks);
    } else {
      warnings.push(`Skipping unsupported file: ${file.name}`);
    }
  }

  if (!tasks.length) {
    throw new Error(FILE_ERROR_MESSAGE);
  }

  const plays: Play[] = [];
  let processed = 0;
  const total = tasks.length;

  for (const task of tasks) {
    ctx.postMessage({
      type: 'progress',
      payload: {
        progress: Math.round((processed / total) * 100),
        currentFile: task.name,
        message: `Parsing ${task.name}…`,
        processedCount: processed,
        totalCount: total
      }
    } satisfies ParseWorkerOutgoingMessage);

    try {
      const result = await task.parser();
      plays.push(...result);
    } catch (error) {
      warnings.push(`Failed to parse ${task.name}: ${error instanceof Error ? error.message : String(error)}`);
    }

    processed += 1;
    ctx.postMessage({
      type: 'progress',
      payload: {
        progress: Math.round((processed / total) * 100),
        currentFile: task.name,
        message: `Finished ${task.name}`,
        processedCount: processed,
        totalCount: total
      }
    } satisfies ParseWorkerOutgoingMessage);
  }

  const sorted = plays.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
  return { plays: sorted, warnings };
};

const parseJsonFile = async (name: string, file: File) => {
  try {
    const text = await file.text();
    return normalizeJson(text, name);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

const normalizeJson = (jsonText: string, source: string): Play[] => {
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) {
    throw new Error('JSON content must be an array');
  }

  const plays: Play[] = [];
  for (let index = 0; index < parsed.length; index += 1) {
    const raw = parsed[index] as RawPlay;
    const normalized = normalizePlay(raw, source, index);
    if (normalized) plays.push(normalized);
  }
  return plays;
};

const normalizePlay = (raw: RawPlay, source: string, index: number): Play | null => {
  if (!raw.ts) return null;
  return {
    id: `${raw.ts}-${index}`,
    timestamp: raw.ts,
    msPlayed: raw.ms_played ?? 0,
    trackName: raw.master_metadata_track_name ?? null,
    artistName: raw.master_metadata_album_artist_name ?? null,
    albumName: raw.master_metadata_album_album_name ?? null,
    spotifyTrackUri: raw.spotify_track_uri ?? null,
    source
  } satisfies Play;
};
