'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Remove,
} from '@mui/icons-material';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
}

export default function KPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue,
  delay = 0 
}: KPICardProps) {
  const trendConfig = {
    up: { icon: TrendingUp, color: 'success.main' },
    down: { icon: TrendingDown, color: 'error.main' },
    neutral: { icon: Remove, color: 'text.secondary' },
  }[trend || 'neutral'];

  const TrendIcon = trendConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -4 }}
    >
      <Card
        sx={{
          height: '100%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 500, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 300,
              mb: subtitle ? 1 : 0,
              color: 'text.primary',
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: trend && trendValue ? 1.5 : 0 }}>
              {subtitle}
            </Typography>
          )}
          {trend && trendValue && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <TrendIcon sx={{ fontSize: 18, color: trendConfig.color }} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: trendConfig.color,
                }}
              >
                {trendValue}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
