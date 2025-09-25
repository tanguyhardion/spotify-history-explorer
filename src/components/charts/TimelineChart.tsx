import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { TimelinePoint } from '../../types/analytics';
import { CHART_COLORS } from '../../constants/charts';

interface TimelineChartProps {
  data: TimelinePoint[];
}

export const TimelineChart = ({ data }: TimelineChartProps) => (
  <div className="h-72 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="timeline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.timelineStroke} stopOpacity={0.8} />
            <stop offset="95%" stopColor={CHART_COLORS.timelineArea} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="dateLabel" stroke="rgba(255,255,255,0.45)" tickLine={false} minTickGap={20} />
        <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} allowDecimals={false} width={60} />
        <Tooltip
          contentStyle={{
            background: '#111827',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255,255,255,0.05)',
            color: 'white'
          }}
          formatter={(value: number) => [`${value.toLocaleString()} plays`, 'Plays']}
        />
        <Area
          type="monotone"
          dataKey="plays"
          stroke={CHART_COLORS.timelineStroke}
          fill="url(#timeline)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
