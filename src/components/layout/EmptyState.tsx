import { SPOTIFY_URLS, APP_CONFIG } from "../../constants/app";
import FileUpload from "../FileUpload";
import { MusicIcon } from "../ui";
import type { Play } from "../../types";

interface EmptyStateProps {
  onUpload: (data: Play[]) => void;
}

/**
 * Welcome screen component displayed when no data is available
 * Provides instructions for obtaining and uploading Spotify data
 */
export function EmptyState({ onUpload }: EmptyStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 dark">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full text-center space-y-6">
          <WelcomeSection />
          <FileUpload onData={onUpload} variant="prominent" />
          <DataInstructions />
          <PrivacyNotice />
        </div>
      </main>
    </div>
  );
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-gray-900/70 border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <h1 className="text-xl font-semibold text-center">
          <span className={`text-${APP_CONFIG.brandColor}`}>Spotify</span>{" "}
          History Explorer
        </h1>
      </div>
    </header>
  );
}

function WelcomeSection() {
  return (
    <div className="space-y-4">
      <div className="w-16 h-16 mx-auto bg-green-600 rounded-full flex items-center justify-center">
        <MusicIcon size="lg" className="text-white" />
      </div>
      <h2 className="text-2xl font-bold">Get Started</h2>
      <p className="text-gray-400">
        Upload your Spotify listening history to explore your music data
      </p>
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
      text: "Download the ZIP file from Spotify",
    },
    {
      number: 6,
      text: "Upload the ZIP file directly, or unzip it and upload the Streaming_History_Audio_*.json files",
    },
  ];

  return (
    <div className="space-y-4 pt-4 border-t border-gray-700">
      <h3 className="text-lg font-semibold text-gray-300">
        How to get your Spotify data:
      </h3>
      <InstructionsList steps={steps} />
    </div>
  );
}

interface InstructionsListProps {
  steps: Array<{
    number: number;
    text: React.ReactNode;
  }>;
}

function InstructionsList({ steps }: InstructionsListProps) {
  return (
    <ol className="text-sm text-gray-400 space-y-2 text-left">
      {steps.map((step) => (
        <InstructionStep key={step.number} {...step} />
      ))}
    </ol>
  );
}

interface InstructionStepProps {
  number: number;
  text: React.ReactNode;
}

function InstructionStep({ number, text }: InstructionStepProps) {
  return (
    <li className="flex items-start">
      <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">
        {number}
      </span>
      <span>{text}</span>
    </li>
  );
}

function PrivacyNotice() {
  return (
    <p className="text-xs text-gray-500 pt-2">
      All data is processed locally in your browser. We don't upload anything.
    </p>
  );
}
