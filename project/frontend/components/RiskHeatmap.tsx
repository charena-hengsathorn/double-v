'use client';

import { useMemo } from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { motion } from 'framer-motion';

interface HeatmapData {
  stage: string;
  probability_range: string;
  deal_count: number;
  total_value: number;
  at_risk_value: number;
}

interface RiskHeatmapProps {
  data: HeatmapData[];
  stages: string[];
  probabilityBuckets: string[];
}

export default function RiskHeatmap({ data, stages, probabilityBuckets }: RiskHeatmapProps) {
  // Create a matrix for the heatmap
  const matrix = useMemo(() => {
    const matrixMap = new Map<string, HeatmapData>();
    data.forEach(item => {
      const key = `${item.stage}:${item.probability_range}`;
      matrixMap.set(key, item);
    });

    return stages.map(stage => 
      probabilityBuckets.map(bucket => {
        const key = `${stage}:${bucket}`;
        return matrixMap.get(key) || {
          stage,
          probability_range: bucket,
          deal_count: 0,
          total_value: 0,
          at_risk_value: 0,
        };
      })
    );
  }, [data, stages, probabilityBuckets]);

  const maxValue = useMemo(() => {
    return Math.max(...data.map(d => d.at_risk_value), 1);
  }, [data]);

  const getColorIntensity = (value: number) => {
    if (value === 0) return '#f8fafc';
    const intensity = Math.min(value / maxValue, 1);
    const red = Math.round(255 * intensity);
    const green = Math.round(255 * (1 - intensity * 0.5));
    const blue = Math.round(255 * (1 - intensity));
    return `rgb(${red}, ${green}, ${blue})`;
  };

  const getTextColor = (value: number) => {
    const intensity = value / maxValue;
    return intensity > 0.5 ? '#ffffff' : '#1e293b';
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
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 400 }}>
            Risk Heatmap
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table size="small" sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600, borderRight: 1, borderColor: 'divider' }}>
                    Stage / Probability
                  </TableCell>
                  {probabilityBuckets.map(bucket => (
                    <TableCell 
                      key={bucket} 
                      align="center"
                      sx={{ 
                        fontWeight: 600,
                        borderRight: bucket !== probabilityBuckets[probabilityBuckets.length - 1] ? 1 : 0,
                        borderColor: 'divider',
                      }}
                    >
                      {bucket}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {stages.map((stage, stageIdx) => (
                  <TableRow key={stage} hover>
                    <TableCell 
                      component="th" 
                      scope="row"
                      sx={{ 
                        fontWeight: 600,
                        bgcolor: 'grey.50',
                        borderRight: 1,
                        borderColor: 'divider',
                      }}
                    >
                      {stage}
                    </TableCell>
                    {matrix[stageIdx].map((cell, bucketIdx) => (
                      <TableCell
                        key={`${stage}-${bucketIdx}`}
                        align="center"
                        sx={{
                          bgcolor: getColorIntensity(cell.at_risk_value),
                          color: getTextColor(cell.at_risk_value),
                          borderRight: bucketIdx !== probabilityBuckets.length - 1 ? 1 : 0,
                          borderColor: 'divider',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            zIndex: 1,
                            boxShadow: 2,
                          },
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            ${(cell.at_risk_value / 1000).toFixed(0)}k
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {cell.deal_count} deals
                          </Typography>
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Color intensity represents at-risk value (red = higher risk)
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}
