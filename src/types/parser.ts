import type { Play } from './plays';

export interface ParseRequestMessage {
  type: 'parse';
  payload: {
    files: File[];
  };
}

export interface ParseProgressMessage {
  type: 'progress';
  payload: {
    progress: number;
    currentFile: string;
    message: string;
    processedCount: number;
    totalCount: number;
  };
}

export interface ParseCompleteMessage {
  type: 'complete';
  payload: {
    plays: Play[];
    warnings: string[];
  };
}

export interface ParseErrorMessage {
  type: 'error';
  payload: {
    error: string;
    details?: string;
  };
}

export type ParseWorkerOutgoingMessage =
  | ParseProgressMessage
  | ParseCompleteMessage
  | ParseErrorMessage;

export type ParseWorkerIncomingMessage = ParseRequestMessage;
