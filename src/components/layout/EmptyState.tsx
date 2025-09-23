import { SPOTIFY_URLS, APP_CONFIG } from "../../constants/app";
import FileUpload from "../FileUpload";
import type { Play } from "../../types";

interface EmptyStateProps {
  onUpload: (data: Play[]) => void;
}

export function EmptyState({ onUpload }: EmptyStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 dark">
      <header className="sticky top-0 z-20 backdrop-blur bg-gray-900/70 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <h1 className="text-xl font-semibold text-center">
            <span className={`text-${APP_CONFIG.brandColor}`}>Spotify</span>{" "}
            History Explorer
          </h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-600 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Get Started</h2>
            <p className="text-gray-400">
              Upload your Spotify listening history to explore your music data
            </p>
          </div>

          <FileUpload onData={onUpload} variant="prominent" />

          <DataInstructions />

          <PrivacyNotice />
        </div>
      </main>
    </div>
  );
}

function DataInstructions() {
  const steps = [
    {
      number: 1,
      text: (
        <>
          Go to{" "}
          <a
            href={SPOTIFY_URLS.privacy}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-${APP_CONFIG.brandColor} hover:text-green-300 underline`}
          >
            Spotify Privacy Settings
          </a>
        </>
      ),
    },
    {
      number: 2,
      text: 'Scroll down and click "Request Data"',
    },
    {
      number: 3,
      text: 'Select "Extended streaming history" and request',
    },
    {
      number: 4,
      text: "Wait for Spotify to email you (can take up to 30 days)",
    },
    {
      number: 5,
      text: "Download and unzip the file to extract the JSON files",
    },
    {
      number: 6,
      text: "Upload all the Streaming_History_Audio_*.json files (select multiple files at once)",
    },
  ];

  return (
    <div className="space-y-4 pt-4 border-t border-gray-700">
      <h3 className="text-lg font-semibold text-gray-300">
        How to get your Spotify data:
      </h3>
      <ol className="text-sm text-gray-400 space-y-2 text-left">
        {steps.map((step) => (
          <li key={step.number} className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">
              {step.number}
            </span>
            <span>{step.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PrivacyNotice() {
  return (
    <p className="text-xs text-gray-500 pt-2">
      All data is processed locally in your browser. We don't upload anything.
    </p>
  );
}
