interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        className="animate-spin text-white"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-30"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-100"
          fill="currentColor"
          d="m12 2 c 5.523 0 10 4.477 10 10 h -2 c 0 -4.418 -3.582 -8 -8 -8 v -2 z"
        />
      </svg>
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  children?: React.ReactNode;
}

export function LoadingState({
  message = "Loading...",
  children,
}: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" className="mx-auto" />
        <p className="text-gray-300">{message}</p>
        {children}
      </div>
    </div>
  );
}
