'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Card, CardContent } from '@mui/material';
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

      const [forecastData, billingsData] = await Promise.all([
        predictiveApi.getBaseForecast().catch(() => null),
        strapiApi.getBillings().catch(() => ({ data: [] })),
      ]);

      setForecast(forecastData);
      setBillings(billingsData || { data: [] });
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
      const attrs = billing.attributes || {};
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
    </Box>
  );
}





