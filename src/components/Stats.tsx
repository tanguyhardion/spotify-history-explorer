import { useMemo, memo } from "react";
import type { Play } from "../types";
import { formatMs } from "../utils/format";

interface StatsProps {
  data: Play[];
}

interface StatItem {
  label: string;
  value: string;
  tooltip?: string;
}

function useStatsData(data: Play[]) {
  return useMemo(() => {
    const totalMs = data.reduce((acc, play) => acc + (play.ms_played || 0), 0);

    // Calculate top artist
    const artistPlayCounts = new Map<string, number>();
    for (const play of data) {
      const artist = play.master_metadata_album_artist_name || "Unknown";
      artistPlayCounts.set(artist, (artistPlayCounts.get(artist) || 0) + 1);
    }

    let topArtist = { name: "—", plays: 0 };
    for (const [artistName, playCount] of artistPlayCounts) {
      if (playCount > topArtist.plays) {
        topArtist = { name: artistName, plays: playCount };
      }
    }

    // Calculate additional stats
    const uniqueTracks = new Set(
      data
        .filter((play) => play.master_metadata_track_name)
        .map(
          (play) =>
            `${play.master_metadata_track_name}-${play.master_metadata_album_artist_name}`,
        ),
    ).size;

    const uniqueArtists = new Set(
      data
        .filter((play) => play.master_metadata_album_artist_name)
        .map((play) => play.master_metadata_album_artist_name),
    ).size;

    return {
      totalPlaytime: formatMs(totalMs),
      topArtist,
      uniqueTracks,
      uniqueArtists,
      totalPlays: data.length,
    };
  }, [data]);
}

function StatCard({ label, value, tooltip }: StatItem) {
  return (
    <div className="p-3 rounded-md border border-gray-700 bg-gray-800">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div
        className="text-lg font-semibold text-gray-100 truncate"
        title={tooltip}
      >
        {value}
      </div>
    </div>
  );
}

function Stats({ data }: StatsProps) {
  const stats = useStatsData(data);

  const statItems: StatItem[] = [
    {
      label: "Total Playtime",
      value: stats.totalPlaytime,
    },
    {
      label: "Most Played Artist",
      value: `${stats.topArtist.name}${stats.topArtist.plays > 0 ? ` (${stats.topArtist.plays})` : ""}`,
      tooltip: stats.topArtist.name,
    },
    {
      label: "Unique Tracks",
      value: stats.uniqueTracks.toLocaleString(),
    },
    {
      label: "Unique Artists",
      value: stats.uniqueArtists.toLocaleString(),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {statItems.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          value={stat.value}
          tooltip={stat.tooltip}
        />
      ))}
    </div>
  );
}

export default memo(Stats);
