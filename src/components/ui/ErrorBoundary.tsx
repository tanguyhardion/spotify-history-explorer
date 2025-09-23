import React from "react";
import { Button, ErrorIcon } from "./";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

/**
 * Error boundary component that catches JavaScript errors and displays a fallback UI
 * Provides error recovery functionality for better user experience
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private renderDefaultFallback(error?: Error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-600 rounded-full flex items-center justify-center">
              <ErrorIcon size="lg" className="text-white" />
            </div>
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-gray-400">
              {error?.message || "An unexpected error occurred"}
            </p>
          </div>
          <Button onClick={this.resetError} variant="danger" className="w-full">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }
      return this.renderDefaultFallback(this.state.error);
    }

    return this.props.children;
  }
}
