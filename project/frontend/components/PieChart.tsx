'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface PieChartData {
  name: string;
  value: number;
  actualValue?: number; // Optional: actual value if different from displayed value (e.g., for profit/loss)
}

interface PieChartProps {
  data: PieChartData[];
  title?: string;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#6366f1', // indigo
];

export default function PieChart({ data, title, colors = DEFAULT_COLORS }: PieChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 2,
          '&:hover': {
            boxShadow: 4,
          },
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {title && (
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 400 }}>
              {title}
            </Typography>
          )}
          <Box sx={{ height: 400, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                  formatter={(value: number, name: string, props: any) => {
                    // Use actualValue if available (for profit/loss), otherwise use value
                    const displayValue = props.payload?.actualValue !== undefined ? props.payload.actualValue : value;
                    return formatCurrency(displayValue);
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                  formatter={(value, entry: any) => {
                    const displayValue = entry.payload?.actualValue !== undefined ? entry.payload.actualValue : entry.payload.value;
                    return `${value}: ${formatCurrency(displayValue)}`;
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

