'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyData {
  month: string;
  confirmed: number;
  tentative: number;
  total: number;
}

interface StackedAreaChartProps {
  data: MonthlyData[];
  title?: string;
}

export default function StackedAreaChart({ data, title }: StackedAreaChartProps) {
  return (
    <div className="w-full h-96 p-4 bg-white rounded-lg shadow-md">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          />
          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
          <Tooltip 
            formatter={(value: number) => `$${value.toLocaleString()}`}
            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="confirmed" 
            stackId="1" 
            stroke="#10b981" 
            fill="#10b981" 
            fillOpacity={0.8}
            name="Confirmed"
          />
          <Area 
            type="monotone" 
            dataKey="tentative" 
            stackId="1" 
            stroke="#f59e0b" 
            fill="#f59e0b" 
            fillOpacity={0.8}
            name="Tentative"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

