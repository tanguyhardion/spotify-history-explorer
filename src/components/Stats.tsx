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

    // Calculate activity stats
    const dayOfWeekCounts = new Map<string, number>();
    const hourCounts = new Map<number, number>();
    const dateCounts = new Map<string, number>();
    const uniqueDays = new Set<string>();

    for (const play of data) {
      const date = new Date(play.ts);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

      dayOfWeekCounts.set(dayOfWeek, (dayOfWeekCounts.get(dayOfWeek) || 0) + 1);
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      dateCounts.set(dateStr, (dateCounts.get(dateStr) || 0) + 1);
      uniqueDays.add(dateStr);
    }

    // Most active day of week
    let mostActiveDayOfWeek = { day: "—", plays: 0 };
    for (const [day, plays] of dayOfWeekCounts) {
      if (plays > mostActiveDayOfWeek.plays) {
        mostActiveDayOfWeek = { day, plays };
      }
    }

    // Most active hour
    let mostActiveHour = { hour: -1, plays: 0 };
    for (const [hour, plays] of hourCounts) {
      if (plays > mostActiveHour.plays) {
        mostActiveHour = { hour, plays };
      }
    }

    // Most active day ever
    let mostActiveDayEver = { date: "—", plays: 0 };
    for (const [date, plays] of dateCounts) {
      if (plays > mostActiveDayEver.plays) {
        mostActiveDayEver = { date, plays };
      }
    }

    // Average plays per day
    const averagePlaysPerDay = uniqueDays.size > 0 ? data.length / uniqueDays.size : 0;

    // Listening streak
    const sortedDates = Array.from(uniqueDays).sort();
    let currentStreak = 0;
    let maxStreak = 0;
    let prevDate: Date | null = null;

    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr);
      if (prevDate) {
        const diffTime = currentDate.getTime() - prevDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      prevDate = currentDate;
    }
    maxStreak = Math.max(maxStreak, currentStreak);

    return {
      totalPlaytime: formatMs(totalMs),
      topArtist,
      topTrack,
      topAlbum,
      uniqueTracks,
      uniqueArtists,
      averagePlaytime: formatMs(averagePlaytime),
      mostActiveDayOfWeek,
      mostActiveHour,
      mostActiveDayEver,
      averagePlaysPerDay,
      listeningStreak: maxStreak,
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
      label: "Unique Artists",
      value: stats.uniqueArtists.toLocaleString(),
    },
    {
      label: "Unique Tracks",
      value: stats.uniqueTracks.toLocaleString(),
    },
    {
      label: "Average Playtime",
      value: stats.averagePlaytime,
    },
    {
      label: "Average Plays/Day",
      value: stats.averagePlaysPerDay.toFixed(1),
    },
    {
      label: "Listening Streak",
      value: `${stats.listeningStreak} days`,
    },
    {
      label: "Most Active Day",
      value: stats.mostActiveDayOfWeek.day,
      tooltip: `${stats.mostActiveDayOfWeek.plays} plays`,
    },
    {
      label: "Most Active Hour",
      value: stats.mostActiveHour.hour >= 0 ? `${stats.mostActiveHour.hour}:00` : "—",
      tooltip: `${stats.mostActiveHour.plays} plays`,
    },
    {
      label: "Most Active Date",
      value: stats.mostActiveDayEver.date,
      tooltip: `${stats.mostActiveDayEver.plays} plays`,
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
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
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
