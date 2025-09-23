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

    // Calculate top track
    const trackPlayCounts = new Map<string, number>();
    for (const play of data) {
      const track = play.master_metadata_track_name || "Unknown";
      trackPlayCounts.set(track, (trackPlayCounts.get(track) || 0) + 1);
    }

    let topTrack = { name: "—", plays: 0 };
    for (const [trackName, playCount] of trackPlayCounts) {
      if (playCount > topTrack.plays) {
        topTrack = { name: trackName, plays: playCount };
      }
    }

    // Calculate top album
    const albumPlayCounts = new Map<string, number>();
    for (const play of data) {
      const album = play.master_metadata_album_album_name || "Unknown";
      albumPlayCounts.set(album, (albumPlayCounts.get(album) || 0) + 1);
    }

    let topAlbum = { name: "—", plays: 0 };
    for (const [albumName, playCount] of albumPlayCounts) {
      if (playCount > topAlbum.plays) {
        topAlbum = { name: albumName, plays: playCount };
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

    const averagePlaytime = data.length > 0 ? totalMs / data.length : 0;

    return {
      totalPlaytime: formatMs(totalMs),
      topArtist,
      topTrack,
      topAlbum,
      uniqueTracks,
      uniqueArtists,
      totalPlays: data.length,
      averagePlaytime: formatMs(averagePlaytime),
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
      label: "Total Plays",
      value: stats.totalPlays.toLocaleString(),
    },
    {
      label: "Total Playtime",
      value: stats.totalPlaytime,
    },
    {
      label: "Unique Artists",
      value: stats.uniqueArtists.toLocaleString(),
    },
    {
      label: "Unique Tracks",
      value: stats.uniqueTracks.toLocaleString(),
    },
    {
      label: "Most Played Artist",
      value: `${stats.topArtist.name}`,
      tooltip: stats.topArtist.name,
    },
    {
      label: "Most Played Track",
      value: `${stats.topTrack.name}`,
      tooltip: stats.topTrack.name,
    },
    {
      label: "Most Played Album",
      value: `${stats.topAlbum.name}`,
      tooltip: stats.topAlbum.name,
    },
    {
      label: "Avg Playtime",
      value: stats.averagePlaytime,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
