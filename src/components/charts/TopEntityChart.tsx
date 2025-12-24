import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TopEntity } from '../../types/analytics';

interface TopEntityChartProps {
  data: TopEntity[];
  color: string;
}

export const TopEntityChart = ({ data, color }: TopEntityChartProps) => (
  <div className="h-128 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 20, left: 80, right: 20, bottom: 20 }} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis type="number" stroke="rgba(255,255,255,0.45)" tickLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          stroke="rgba(255,255,255,0.45)"
          tickLine={false}
          width={160}
          interval={0}
          tick={{ fontSize: 14 }}
        />
        <Tooltip
          contentStyle={{
            background: '#111827',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255,255,255,0.05)',
            color: 'white'
          }}
          formatter={(value: number) => [`${value.toLocaleString()} plays`, 'Plays']}
        />
        <Bar dataKey="count" radius={[6, 6, 6, 6]} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
