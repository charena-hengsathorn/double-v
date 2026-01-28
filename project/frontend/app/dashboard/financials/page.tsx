'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Card, CardContent } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { strapiApi, predictiveApi } from '@/lib/api';
import StackedAreaChart from '@/components/StackedAreaChart';
import WaterfallChart from '@/components/WaterfallChart';
import KPICard from '@/components/KPICard';
import { motion } from 'framer-motion';

export default function Financials() {
  const [forecast, setForecast] = useState<any>(null);
  const [billings, setBillings] = useState<any>(null);
  const [waterfall, setWaterfall] = useState<any>(null);
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
        looseFurnitureBillings,
        waterfallData
      ] = await Promise.all([
        predictiveApi.getBaseForecast().catch(() => null),
        strapiApi.getConstructionBillings().catch(() => ({ data: [] })),
        strapiApi.getInteriorDesignBillings().catch(() => ({ data: [] })),
        strapiApi.getLooseFurnitureBillings().catch(() => ({ data: [] })),
        predictiveApi.getForecastWaterfall().catch(() => null),
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
      setWaterfall(waterfallData);
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

  // Calculate financial metrics from billings
  const calculateMetrics = () => {
    if (!billings?.data) return { billedYTD: 0, collectedYTD: 0, outstandingAR: 0 };

    const today = new Date();
    const currentYear = today.getFullYear();

    let billedYTD = 0;
    let collectedYTD = 0;
    let outstandingAR = 0;

    billings.data.forEach((billing: any) => {
      // Handle both Strapi v4 format (with attributes) and direct format
      const attrs = billing.attributes || billing;
      const invoiceDate = attrs.invoice_date ? new Date(attrs.invoice_date) : null;
      const collectedDate = attrs.collected_date ? new Date(attrs.collected_date) : null;
      const amount = parseFloat(attrs.amount || 0);

      if (invoiceDate && invoiceDate.getFullYear() === currentYear) {
        billedYTD += amount;
      }

      if (collectedDate && collectedDate.getFullYear() === currentYear) {
        collectedYTD += amount;
      }

      if (attrs.status === 'sent' || attrs.status === 'overdue') {
        outstandingAR += amount;
      }
    });

    return { billedYTD, collectedYTD, outstandingAR };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading financial data...
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

  const metrics = calculateMetrics();
  const summary = forecast?.forecast?.summary || {};
  const monthlyTotals = forecast?.forecast?.monthly_totals || [];
  const waterfallData = waterfall?.variance?.breakdown || [];

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 300, mb: 1, letterSpacing: '-0.02em' }}>
          Financials
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Evaluate cash flow and overall revenue outlook
        </Typography>
      </motion.div>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <KPICard
          title="Billed YTD"
          value={formatCurrency(metrics.billedYTD)}
          subtitle="Year-to-date invoiced"
          delay={0.1}
        />
        <KPICard
          title="Collected YTD"
          value={formatCurrency(metrics.collectedYTD)}
          subtitle="Year-to-date collected"
          delay={0.2}
        />
        <KPICard
          title="Outstanding AR"
          value={formatCurrency(metrics.outstandingAR)}
          subtitle="Accounts receivable"
          delay={0.3}
        />
        <KPICard
          title="Total Forecast"
          value={formatCurrency(summary.total_forecast || 0)}
          subtitle="12-month outlook"
          delay={0.4}
        />
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        <StackedAreaChart
          data={monthlyTotals}
          title="Revenue Forecast"
        />
        <WaterfallChart
          data={waterfallData.length > 0 ? waterfallData : [
            { name: 'Total', prior: 0, current: 0, change: 0 }
          ]}
          title="Forecast Waterfall"
        />
      </Box>

      {/* Forecast Logic Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <Card sx={{ borderRadius: 3, bgcolor: 'grey.50' }}>
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
