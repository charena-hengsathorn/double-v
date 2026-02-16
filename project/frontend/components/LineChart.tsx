'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface LineChartData {
  name: string;
  [key: string]: string | number;
}

interface LineChartProps {
  data: LineChartData[];
  title?: string;
  dataKeys?: { key: string; name: string; color: string }[];
}

export default function LineChart({ data, title, dataKeys = [] }: LineChartProps) {
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
              <RechartsLineChart 
                data={data} 
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b"
                  style={{ fontSize: '0.75rem' }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  stroke="#64748b"
                  style={{ fontSize: '0.75rem' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                {dataKeys.map(({ key, name, color }) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={name}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

