import { useCallback } from "react";
import "./index.css";

import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { LoadingState } from "./components/ui/LoadingSpinner";
import { EmptyState } from "./components/layout/EmptyState";
import { MainLayout } from "./components/layout/MainLayout";

import { useSpotifyData, useFilteredData, useSort, useSearch } from "./hooks";
import type { Play } from "./types";

function AppContent() {
  const { data, isLoading, error, setData, clearError } = useSpotifyData();
  const { query, setQuery, clearQuery, debouncedQuery } = useSearch();
  const { sort, changeSort } = useSort();

  const { filteredData, isLoading: isSorting } = useFilteredData({
    data,
    query: debouncedQuery,
    sort,
  });

  const handleDataUpload = useCallback(
    (newData: Play[]) => {
      setData(newData);
      // Clear any existing search when new data is uploaded
      clearQuery();
    },
    [setData, clearQuery],
  );

  // Show loading state
  if (isLoading) {
    return <LoadingState message="Loading your music history..." />;
  }

  // Show error state with retry option
  if (error) {
    return (
      <LoadingState message="Error loading data">
        <div className="space-y-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={clearError}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </LoadingState>
    );
  }

  // Show empty state when no data is available
  if (data.length === 0) {
    return <EmptyState onUpload={handleDataUpload} />;
  }

  // Show main application with data
  return (
    <MainLayout
      data={data}
      filteredData={filteredData}
      query={query}
      setQuery={setQuery}
      sort={sort}
      onSort={changeSort}
      onDataUpload={handleDataUpload}
      isSorting={isSorting}
    />
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
