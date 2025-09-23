export type FileUploadVariant = "header" | "prominent";

export interface FileValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export interface FileProcessingState {
  isProcessing: boolean;
  progress?: number;
  currentFile?: string;
  error?: string;
}

export interface UploadedFile {
  file: File;
  size: number;
  type: string;
  name: string;
}