'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { Download as DownloadIcon, Info as InfoIcon } from '@mui/icons-material';
import { predictiveApi } from '@/lib/api';
import KPICard from '@/components/KPICard';
import { motion } from 'framer-motion';
import ExecutiveTabs from '../components/ExecutiveTabs';

export default function ExecutiveSummary() {
  const [forecast, setForecast] = useState<any>(null);
  const [riskHeatmap, setRiskHeatmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [forecastData, heatmapData] = await Promise.all([
        predictiveApi.getBaseForecast().catch(() => null),
        predictiveApi.getRiskHeatmap().catch(() => null),
      ]);

      setForecast(forecastData);
      setRiskHeatmap(heatmapData);
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

  const exportToCSV = () => {
    if (!riskHeatmap?.top_risks) return;

    const headers = ['Deal ID', 'Risk Score', 'Risk Factors'];
    const rows = riskHeatmap.top_risks.map((risk: any) => [
      risk.deal_id,
      (risk.risk_score * 100).toFixed(1) + '%',
      risk.risk_factors?.join('; ') || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `at-risk-deals-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading executive insights...
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

  const summary = forecast?.forecast?.summary || {};
  const riskSummary = riskHeatmap?.summary || {};
  const topRisks = riskHeatmap?.top_risks || [];

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 300, mb: 1, letterSpacing: '-0.02em' }}>
              Executive Insights
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Rapid insight via concise summary
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Sub Navigation Tabs */}
      <ExecutiveTabs />

      {/* Base Forecast Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>
              Base Forecast
            </Typography>
            <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 300, mb: 1, letterSpacing: '-0.02em' }}>
              {formatCurrency(summary.total_forecast || 0)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              with {formatCurrency(riskSummary.total_at_risk || 0)} at risk
            </Typography>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 400 }}>
                Outlook
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Confirmed Revenue</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatCurrency(summary.total_confirmed || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Tentative Pipeline</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatCurrency(summary.total_tentative || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Conversion Rate</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {((summary.conversion_rate || 0) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 400 }}>
                Risks
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Total At Risk</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>
                    {formatCurrency(riskSummary.total_at_risk || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">High Risk Deals</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {riskSummary.high_risk_count || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Medium Risk Deals</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {riskSummary.medium_risk_count || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 400 }}>
                Actions
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography component="li" variant="body2" color="text.secondary">
                  Review {riskSummary.high_risk_count || 0} high-risk deals
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Focus on deals in negotiation stage
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Address low-activity deals
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Monitor conversion rate trends
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>

      {/* Top At-Risk Deals Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 400 }}>
                Top At-Risk Deals
              </Typography>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={exportToCSV}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Export CSV
              </Button>
            </Box>
            {topRisks.length > 0 ? (
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 500 }}>Deal ID</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>Risk Score</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>Risk Factors</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topRisks.slice(0, 10).map((risk: any, idx: number) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{risk.deal_id}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${(risk.risk_score * 100).toFixed(0)}%`}
                            size="small"
                            color={
                              risk.risk_score > 0.7 ? 'error' :
                              risk.risk_score > 0.4 ? 'warning' :
                              'success'
                            }
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {risk.risk_factors?.map((factor: string, fIdx: number) => (
                              <Chip
                                key={fIdx}
                                label={factor}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" color="text.secondary">
                  No at-risk deals identified
                </Typography>
              </Box>
            )}
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
