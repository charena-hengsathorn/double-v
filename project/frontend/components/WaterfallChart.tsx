'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WaterfallData {
  name: string;
  prior: number;
  current: number;
  change: number;
}

interface WaterfallChartProps {
  data: WaterfallData[];
  title?: string;
}

export default function WaterfallChart({ data, title }: WaterfallChartProps) {
  return (
    <div className="w-full h-96 p-4 bg-white rounded-lg shadow-md">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
          <Legend />
          <Bar dataKey="prior" fill="#94a3b8" name="Prior" />
          <Bar dataKey="current" fill="#3b82f6" name="Current" />
          <Bar dataKey="change" fill="#10b981" name="Change" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

