import { memo } from "react";
import type { Play } from "../types";
import { StatCard } from "./ui";
import { usePlayStatistics } from "../hooks";

interface StatsProps {
  data: Play[];
}

/**
 * Statistics component displaying comprehensive play data analytics
 * Optimized with memoization and separated statistics calculation
 */
function Stats({ data }: StatsProps) {
  const stats = usePlayStatistics(data);

  const statItems = [
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
      value: stats.topArtist.name,
      tooltip: `${stats.topArtist.plays} plays`,
    },
    {
      label: "Most Played Track",
      value: stats.topTrack.name,
      tooltip: `${stats.topTrack.plays} plays`,
    },
    {
      label: "Most Played Album",
      value: stats.topAlbum.name,
      tooltip: `${stats.topAlbum.plays} plays`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
      {statItems.map((stat, index) => (
        <StatCard
          key={`${stat.label}-${index}`}
          label={stat.label}
          value={stat.value}
          tooltip={stat.tooltip}
        />
      ))}
    </div>
  );
}

export default memo(Stats);
