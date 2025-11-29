'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { predictiveApi } from '@/lib/api';
import StackedAreaChart from '@/components/StackedAreaChart';
import RiskHeatmap from '@/components/RiskHeatmap';
import KPICard from '@/components/KPICard';
import ScenarioToggle from '@/components/ScenarioToggle';
import { motion } from 'framer-motion';

export default function PipelineIntegrity() {
  const [forecast, setForecast] = useState<any>(null);
  const [riskHeatmap, setRiskHeatmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scenario, setScenario] = useState('base');

  useEffect(() => {
    loadData();
  }, [scenario]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [forecastData, heatmapData] = await Promise.all([
        predictiveApi.getScenarioForecast(scenario).catch(() => null),
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading pipeline data...
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
  const monthlyTotals = forecast?.forecast?.monthly_totals || [];
  const heatmapData = riskHeatmap?.heatmap?.matrix || [];
  const heatmapStages = riskHeatmap?.heatmap?.stages || [];
  const heatmapBuckets = riskHeatmap?.heatmap?.probability_buckets || [];

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
              Pipeline Integrity
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor conversion health and risk exposure
            </Typography>
          </Box>
          <ScenarioToggle selectedScenario={scenario} onScenarioChange={setScenario} />
        </Box>
      </motion.div>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <KPICard
          title="Confirmed Revenue"
          value={formatCurrency(summary.total_confirmed || 0)}
          subtitle="High confidence deals"
          delay={0.1}
        />
        <KPICard
          title="Tentative Pipeline"
          value={formatCurrency(summary.total_tentative || 0)}
          subtitle="Lower confidence deals"
          delay={0.2}
        />
        <KPICard
          title="Total Forecast"
          value={formatCurrency(summary.total_forecast || 0)}
          subtitle={`${((summary.conversion_rate || 0) * 100).toFixed(1)}% conversion`}
          delay={0.3}
        />
        <KPICard
          title="Risk Exposure"
          value={formatCurrency(riskHeatmap?.summary?.total_at_risk || 0)}
          subtitle={`${riskHeatmap?.summary?.high_risk_count || 0} high-risk deals`}
          delay={0.4}
        />
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        <StackedAreaChart
          data={monthlyTotals}
          title="Revenue Outlook"
        />
        <RiskHeatmap
          data={heatmapData}
          stages={heatmapStages}
          probabilityBuckets={heatmapBuckets}
        />
      </Box>

      {/* Top Risks Table */}
      {riskHeatmap?.top_risks && riskHeatmap.top_risks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 400 }}>
                Top Risks
              </Typography>
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
                    {riskHeatmap.top_risks.slice(0, 10).map((risk: any, idx: number) => (
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
            </CardContent>
          </Card>
        </motion.div>
      )}
    </Box>
  );
}
