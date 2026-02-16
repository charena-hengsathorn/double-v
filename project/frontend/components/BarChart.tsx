'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface BarChartData {
  name: string;
  [key: string]: string | number;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  dataKeys?: { key: string; name: string; color: string }[];
}

export default function BarChart({ data, title, dataKeys = [] }: BarChartProps) {
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
              <RechartsBarChart 
                data={data} 
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b"
                  style={{ fontSize: '0.75rem' }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
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
                  iconType="square"
                />
                {dataKeys.map(({ key, name, color }) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={name}
                    fill={color}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </RechartsBarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

