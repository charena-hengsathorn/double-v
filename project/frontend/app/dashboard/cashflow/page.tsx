'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Card, CardContent } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { strapiApi, predictiveApi } from '@/lib/api';
import KPICard from '@/components/KPICard';
import StackedAreaChart from '@/components/StackedAreaChart';
import { motion } from 'framer-motion';

export default function DashboardCashflow() {
  const [forecast, setForecast] = useState<any>(null);
  const [billings, setBillings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from all branches
      const [
        forecastData,
        constructionBillings,
        interiorDesignBillings,
        looseFurnitureBillings
      ] = await Promise.all([
        predictiveApi.getBaseForecast().catch(() => null),
        strapiApi.getConstructionBillings().catch(() => ({ data: [] })),
        strapiApi.getInteriorDesignBillings().catch(() => ({ data: [] })),
        strapiApi.getLooseFurnitureBillings().catch(() => ({ data: [] })),
      ]);

      // Combine all billings data
      const allBillings = {
        data: [
          ...(constructionBillings?.data || []),
          ...(interiorDesignBillings?.data || []),
          ...(looseFurnitureBillings?.data || [])
        ]
      };

      setForecast(forecastData);
      setBillings(allBillings);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError(err.message || 'Failed to load data');
        console.error('Error loading data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate cashflow metrics
  const calculateCashflowMetrics = () => {
    if (!billings?.data) return { 
      totalInflow: 0, 
      totalOutflow: 0, 
      netCashflow: 0,
      projectedInflow: 0 
    };

    const today = new Date();
    const currentYear = today.getFullYear();

    let totalInflow = 0;
    let totalOutflow = 0;

    billings.data.forEach((billing: any) => {
      // Handle both Strapi v4 format (with attributes) and direct format
      const attrs = billing.attributes || billing;
      const collectedDate = attrs.collected_date ? new Date(attrs.collected_date) : null;
      const amount = parseFloat(attrs.amount || 0);

      if (collectedDate && collectedDate.getFullYear() === currentYear) {
        totalInflow += amount;
      }
    });

    const summary = forecast?.forecast?.summary || {};
    const projectedInflow = summary.total_forecast || 0;

    return { 
      totalInflow, 
      totalOutflow, 
      netCashflow: totalInflow - totalOutflow,
      projectedInflow 
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading cashflow data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={loadData}>
            Retry
          </Button>
        }
        sx={{ borderRadius: 2 }}
      >
        {error}
      </Alert>
    );
  }

  const metrics = calculateCashflowMetrics();
  const monthlyTotals = forecast?.forecast?.monthly_totals || [];

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 300, mb: 1, letterSpacing: '-0.02em' }}>
          Cashflow
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Monitor cash inflows, outflows, and liquidity
        </Typography>
      </motion.div>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <KPICard
          title="Total Inflow"
          value={formatCurrency(metrics.totalInflow)}
          subtitle="Year-to-date collected"
          delay={0.1}
        />
        <KPICard
          title="Total Outflow"
          value={formatCurrency(metrics.totalOutflow)}
          subtitle="Year-to-date expenses"
          delay={0.2}
        />
        <KPICard
          title="Net Cashflow"
          value={formatCurrency(metrics.netCashflow)}
          subtitle="Current balance"
          trend={metrics.netCashflow >= 0 ? 'up' : 'down'}
          delay={0.3}
        />
        <KPICard
          title="Projected Inflow"
          value={formatCurrency(metrics.projectedInflow)}
          subtitle="12-month forecast"
          delay={0.4}
        />
      </Box>

      {/* Cashflow Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 400 }}>
              Cashflow Projection
            </Typography>
            <StackedAreaChart
              data={monthlyTotals}
              title=""
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Forecast Logic Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <Card sx={{ borderRadius: 3, bgcolor: 'grey.50', mt: 4 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <InfoIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5, flexShrink: 0 }} />
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                  Forecast Logic Disclaimer
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  Forecasts are generated using a hybrid approach: when pipeline deals are available, they are used with probability-weighted revenue recognition. 
                  Otherwise, forecasts are derived from historical sales and billings data. Confirmed sales are projected at 100% probability over 12 months, 
                  while pending sales use 50% probability over 6 months. Historical trends are incorporated as tentative projections. 
                  These forecasts are estimates and should not be considered guarantees of future performance.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}





