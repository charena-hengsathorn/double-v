'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface LineChartData {
  name: string;
  [key: string]: string | number;
}

interface LineChartProps {
  data: LineChartData[];
  title?: string;
  dataKeys?: { key: string; name: string; color: string }[];
  showDifferenceFill?: boolean;
}

export default function LineChart({ data, title, dataKeys = [], showDifferenceFill = false }: LineChartProps) {
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
              <ComposedChart 
                data={data} 
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  {showDifferenceFill && dataKeys.length >= 2 && (
                    <linearGradient id="differenceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  )}
                </defs>
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
                {showDifferenceFill && dataKeys.length >= 2 && (
                  <>
                    {/* Base area for Cost - fills from 0 to Cost */}
                    <Area
                      type="monotone"
                      dataKey={dataKeys[1].key}
                      stroke="none"
                      fill="#ef4444"
                      fillOpacity={0.05}
                      stackId="fill"
                    />
                    {/* Difference area - fills from Cost to Revenue */}
                    <Area
                      type="monotone"
                      dataKey={`${dataKeys[0].key}_diff`}
                      stroke="none"
                      fill="url(#differenceFill)"
                      fillOpacity={0.3}
                      stackId="fill"
                    />
                  </>
                )}
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                  content={({ active, payload, label }: any) => {
                    if (!active || !payload || !payload.length) return null;
                    
                    // Get the actual data point to ensure we show correct values
                    const dataPoint = payload[0]?.payload;
                    if (!dataPoint) return null;
                    
                    // Build tooltip entries from dataKeys to ensure correct mapping
                    const tooltipEntries = dataKeys
                      .map((dk) => {
                        const value = dataPoint[dk.key];
                        if (value === undefined || value === null) return null;
                        const payloadEntry = payload.find((p: any) => p.dataKey === dk.key);
                        return {
                          name: dk.name,
                          value: typeof value === 'number' ? value : parseFloat(value) || 0,
                          color: dk.color,
                          payloadEntry,
                        };
                      })
                      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
                    
                    return (
                      <div>
                        <div style={{ marginBottom: '4px', fontWeight: 600, fontSize: '0.875rem' }}>
                          {label}
                        </div>
                        {tooltipEntries.map((entry, index) => (
                          <div key={index} style={{ fontSize: '0.875rem', color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                          </div>
                        ))}
                      </div>
                    );
                  }}
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
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

