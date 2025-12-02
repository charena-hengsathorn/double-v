'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  Card, 
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Drawer,
  IconButton,
  TextField,
  MenuItem,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { strapiApi } from '@/lib/api';
import { motion } from 'framer-motion';

interface SalesEntry {
  id?: string;
  client: string;
  sale_amount: string;
  construction_cost: string;
  project_profit: string;
  status: 'Confirmed' | 'Pending' | 'Closed';
  notes?: string;
}

export default function CashflowTable() {
  const [sales, setSales] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SalesEntry | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<SalesEntry>({
    client: '',
    sale_amount: '',
    construction_cost: '',
    project_profit: '',
    status: 'Pending',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const salesData = await strapiApi.getSales().catch(() => ({ data: [] }));
      setSales(salesData || { data: [] });
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError(err.message || 'Failed to load data');
        console.error('Error loading data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate project profit when sale_amount or construction_cost changes
  useEffect(() => {
    if (drawerOpen) {
      const saleAmount = parseFloat(formData.sale_amount) || 0;
      const constructionCost = parseFloat(formData.construction_cost) || 0;
      const calculatedProfit = saleAmount - constructionCost;
      setFormData(prev => ({
        ...prev,
        project_profit: calculatedProfit.toString(),
      }));
    }
  }, [formData.sale_amount, formData.construction_cost, drawerOpen]);

  const handleOpenDrawer = (entry?: any) => {
    if (entry) {
      const attrs = entry.attributes || {};
      setEditingEntry(entry);
      setFormData({
        client: attrs.client || '',
        sale_amount: attrs.sale_amount?.toString() || '',
        construction_cost: attrs.construction_cost?.toString() || '',
        project_profit: attrs.project_profit?.toString() || '',
        status: attrs.status || 'Pending',
        notes: attrs.notes || '',
      });
    } else {
      setEditingEntry(null);
      setFormData({
        client: '',
        sale_amount: '',
        construction_cost: '',
        project_profit: '0',
        status: 'Pending',
        notes: '',
      });
    }
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingEntry(null);
    setFormErrors({});
    setError(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.client || formData.client.trim() === '') {
      errors.client = 'Client is required';
    }

    if (!formData.sale_amount || parseFloat(formData.sale_amount) <= 0) {
      errors.sale_amount = 'Sale amount must be greater than 0';
    }

    if (!formData.construction_cost || parseFloat(formData.construction_cost) < 0) {
      errors.construction_cost = 'Construction cost is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const submitData = {
        client: formData.client.trim(),
        sale_amount: parseFloat(formData.sale_amount) || 0,
        construction_cost: parseFloat(formData.construction_cost) || 0,
        project_profit: parseFloat(formData.project_profit) || 0,
        status: formData.status,
        notes: formData.notes?.trim() || '',
      };

      if (editingEntry && editingEntry.id) {
        await strapiApi.updateSales(editingEntry.id, submitData);
      } else {
        await strapiApi.createSales(submitData);
      }
      
      handleCloseDrawer();
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save entry');
      console.error('Error saving sales entry:', err);
    } finally {
      setSubmitting(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Closed':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading sales data...
        </Typography>
      </Box>
    );
  }

  if (error && !sales) {
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

  const salesList = sales?.data || [];

  // Calculate totals
  const totals = salesList.reduce((acc: any, sale: any) => {
    const attrs = sale.attributes || {};
    const cost = parseFloat(attrs.construction_cost || 0);
    const profit = parseFloat(attrs.project_profit || 0);
    const total = cost + profit;
    
    acc.total += total;
    acc.cost += cost;
    acc.profit += profit;
    
    return acc;
  }, { total: 0, cost: 0, profit: 0 });

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 300, mb: 1, letterSpacing: '-0.02em' }}>
              Cashflow Table
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sales table for cashflow tracking
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDrawer()}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Add Entry
          </Button>
        </Box>
      </motion.div>

      {/* Sales Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 400 }}>
              Sales Table
            </Typography>
            {salesList.length > 0 ? (
              <>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 500 }}>Client</TableCell>
                        <TableCell sx={{ fontWeight: 500 }} align="right">ต้นทุนก่อสร้าง</TableCell>
                        <TableCell sx={{ fontWeight: 500 }} align="right">กำไรโปรเจคนี้</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {salesList.map((sale: any, idx: number) => {
                        const attrs = sale.attributes || {};
                        const cost = parseFloat(attrs.construction_cost || 0);
                        const profit = parseFloat(attrs.project_profit || 0);
                        return (
                          <TableRow key={sale.id || idx} hover>
                            <TableCell sx={{ fontWeight: 500 }}>
                              {attrs.client || '—'}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 500 }}>
                              {formatCurrency(cost)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 500, color: 'success.main' }}>
                              {formatCurrency(profit)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={attrs.status || 'Pending'}
                                size="small"
                                color={getStatusColor(attrs.status) as any}
                                sx={{ fontWeight: 400 }}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDrawer(sale)}
                                sx={{ color: 'text.secondary' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Summary Section */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mt: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                        Total
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 300, letterSpacing: '-0.02em' }}>
                        {formatCurrency(totals.total)}
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                        ต้นทุน
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 300, letterSpacing: '-0.02em' }}>
                        {formatCurrency(totals.cost)}
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                        กำไร
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 300, letterSpacing: '-0.02em', color: 'success.main' }}>
                        {formatCurrency(totals.profit)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No sales entries found
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDrawer()}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Add First Entry
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Input Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 480 },
            p: 3,
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 400 }}>
              {editingEntry ? 'Edit Entry' : 'New Entry'}
            </Typography>
            <IconButton onClick={handleCloseDrawer} size="small" disabled={submitting}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Client"
                value={formData.client}
                onChange={(e) => {
                  setFormData({ ...formData, client: e.target.value });
                  if (formErrors.client) {
                    setFormErrors({ ...formErrors, client: '' });
                  }
                }}
                fullWidth
                variant="outlined"
                required
                error={!!formErrors.client}
                helperText={formErrors.client}
              />

              <TextField
                label="Sale Amount"
                type="number"
                value={formData.sale_amount}
                onChange={(e) => {
                  setFormData({ ...formData, sale_amount: e.target.value });
                  if (formErrors.sale_amount) {
                    setFormErrors({ ...formErrors, sale_amount: '' });
                  }
                }}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
                error={!!formErrors.sale_amount}
                helperText={formErrors.sale_amount}
                inputProps={{ min: 0, step: 0.01 }}
              />

              <TextField
                label="ต้นทุนก่อสร้าง (Construction Cost)"
                type="number"
                value={formData.construction_cost}
                onChange={(e) => {
                  setFormData({ ...formData, construction_cost: e.target.value });
                  if (formErrors.construction_cost) {
                    setFormErrors({ ...formErrors, construction_cost: '' });
                  }
                }}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
                error={!!formErrors.construction_cost}
                helperText={formErrors.construction_cost}
                inputProps={{ min: 0, step: 0.01 }}
              />

              <TextField
                label="กำไรโปรเจคนี้ (Project Profit)"
                type="number"
                value={formData.project_profit}
                fullWidth
                variant="outlined"
                disabled
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText="Auto-calculated: Sale Amount - Construction Cost"
              />

              <TextField
                label="Status"
                select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                fullWidth
                variant="outlined"
                required
              >
                <MenuItem value="Confirmed">Confirmed</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </TextField>

              <TextField
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
                variant="outlined"
                multiline
                rows={4}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Footer Actions */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCloseDrawer}
              fullWidth
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<SaveIcon />}
              fullWidth
              disabled={submitting}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              {submitting ? 'Saving...' : editingEntry ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
