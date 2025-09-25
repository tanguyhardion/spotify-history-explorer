import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ParseCompleteMessage,
  ParseErrorMessage,
  ParseProgressMessage,
  ParseWorkerOutgoingMessage
} from '../types/parser';
import type { Play } from '../types/plays';

export type ProcessorStatus = 'idle' | 'parsing' | 'ready' | 'error';

interface ProcessorState {
  status: ProcessorStatus;
  progress: number;
  message: string;
  currentFile: string | null;
  error: string | null;
}

const initialState: ProcessorState = {
  status: 'idle',
  progress: 0,
  message: 'Drop your Spotify data files to get started',
  currentFile: null,
  error: null
};

export const useFileProcessor = () => {
  const workerRef = useRef<Worker | null>(null);
  const [state, setState] = useState<ProcessorState>(initialState);
  const [plays, setPlays] = useState<Play[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/parserWorker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current = worker;
    const handleMessage = (event: MessageEvent<ParseWorkerOutgoingMessage>) => {
      const message = event.data;
      if (message.type === 'progress') {
        const { payload } = message as ParseProgressMessage;
        setState((prev) => ({
          ...prev,
          status: 'parsing',
          progress: payload.progress,
          message: payload.message,
          currentFile: payload.currentFile,
          error: null
        }));
      }
      if (message.type === 'complete') {
        const { payload } = message as ParseCompleteMessage;
        setPlays(payload.plays);
        setWarnings(payload.warnings);
        setState((prev) => ({
          ...prev,
          status: 'ready',
          progress: 100,
          message: `Loaded ${payload.plays.length.toLocaleString()} plays`,
          currentFile: null
        }));
      }
      if (message.type === 'error') {
        const { payload } = message as ParseErrorMessage;
        setState({
          status: 'error',
          progress: 0,
          message: 'Parsing failed',
          currentFile: null,
          error: payload.error
        });
      }
    };

    worker.addEventListener('message', handleMessage);
    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const handleFiles = useCallback((input?: FileList | File[] | null) => {
    if (!input || !input.length) return;
    const files = Array.isArray(input) ? input : Array.from(input);
    if (!files.length || !workerRef.current) return;

    setState({
      status: 'parsing',
      progress: 0,
      message: 'Preparing files…',
      currentFile: null,
      error: null
    });
    setPlays([]);
    setWarnings([]);

    workerRef.current.postMessage({
      type: 'parse',
      payload: {
        files
      }
    });
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    setPlays([]);
    setWarnings([]);
  }, []);

  const processor = useMemo(
    () => ({
      ...state,
      plays,
      warnings,
      handleFiles,
      reset
    }),
    [state, plays, warnings, handleFiles, reset]
  );

  return processor;
};
