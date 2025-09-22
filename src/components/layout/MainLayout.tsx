import { Header } from "./Header";
import Controls from "../Controls";
import TrackList from "../TrackList";
import Stats from "../Stats";
import FileUpload from "../FileUpload";
import type { Play, SortState, SortKey } from "../../types";

interface MainLayoutProps {
  data: Play[];
  filteredData: Play[];
  query: string;
  setQuery: (query: string) => void;
  sort: SortState;
  onSort: (key: SortKey) => void;
  onClear: () => void;
  onDataUpload: (data: Play[]) => void;
}

export function MainLayout({
  data,
  filteredData,
  query,
  setQuery,
  sort,
  onSort,
  onClear,
  onDataUpload,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 dark">
      <Header>
        <FileUpload onData={onDataUpload} variant="header" />
      </Header>

      <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-4">
        <Stats data={filteredData} />

        <div className="p-3 rounded-lg border border-gray-700 bg-gray-800 shadow-sm">
          <Controls
            query={query}
            setQuery={setQuery}
            total={data.length}
            filteredCount={filteredData.length}
            onClear={onClear}
          />
          <TrackList data={filteredData} sort={sort} onSort={onSort} />
        </div>

        <footer className="text-center">
          <p className="text-xs text-gray-400">
            All data is processed locally in your browser. We don't upload
            anything.
          </p>
        </footer>
      </main>
    </div>
  );
}
