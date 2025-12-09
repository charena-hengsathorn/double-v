'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Breadcrumbs,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  FilterList as FilterIcon,
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
  sale_date?: string;
  notes?: string;
}

export default function SalesTablePage() {
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
    sale_date: new Date().toISOString().slice(0, 10) + 'T00:00',
    notes: '',
  });
  
  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');

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
      const attrs = entry.attributes || entry;
      setEditingEntry(entry);
      
      let saleDate = '';
      if (attrs.sale_date) {
        saleDate = new Date(attrs.sale_date).toISOString().slice(0, 10) + 'T00:00';
      } else if (attrs.createdAt || entry.createdAt) {
        saleDate = new Date(attrs.createdAt || entry.createdAt).toISOString().slice(0, 10) + 'T00:00';
      } else {
        saleDate = new Date().toISOString().slice(0, 10) + 'T00:00';
      }
      
      setFormData({
        client: attrs.client || '',
        sale_amount: attrs.sale_amount?.toString() || '',
        construction_cost: attrs.construction_cost?.toString() || '',
        project_profit: attrs.project_profit?.toString() || '',
        status: attrs.status || 'Pending',
        sale_date: saleDate,
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
        sale_date: new Date().toISOString().slice(0, 10) + 'T00:00',
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
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const submitData: any = {
        client: formData.client.trim(),
        sale_amount: parseFloat(formData.sale_amount) || 0,
        construction_cost: parseFloat(formData.construction_cost) || 0,
        project_profit: parseFloat(formData.project_profit) || 0,
        status: formData.status,
        notes: formData.notes?.trim() || '',
      };

      if (formData.sale_date) {
        const dateValue = formData.sale_date.split('T')[0];
        submitData.sale_date = dateValue;
      }

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

  // Get unique clients from sales data
  const getUniqueClients = () => {
    const clients = new Set<string>();
    salesList.forEach((sale: any) => {
      const attrs = sale.attributes || sale;
      if (attrs.client && attrs.client.trim()) {
        clients.add(attrs.client.trim());
      }
    });
    return Array.from(clients).sort();
  };

  // Filter sales based on selected month, status, and client
  const filteredSales = salesList.filter((sale: any) => {
    const attrs = sale.attributes || sale;
    
    // Filter by client
    if (selectedClient !== 'all' && attrs.client !== selectedClient) {
      return false;
    }
    
    // Filter by status
    if (selectedStatus !== 'all' && attrs.status !== selectedStatus) {
      return false;
    }
    
    // Filter by month
    if (selectedMonth) {
      const saleDate = attrs.sale_date || attrs.createdAt || attrs.updatedAt || sale.sale_date || sale.createdAt || sale.updatedAt;
      if (saleDate) {
        const date = new Date(saleDate);
        const saleMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (saleMonth !== selectedMonth) {
          return false;
        }
      } else {
        return false;
      }
    }
    
    return true;
  });

  // Calculate totals from filtered sales
  const totals = filteredSales.reduce((acc: any, sale: any) => {
    const attrs = sale.attributes || sale;
    const saleAmount = parseFloat(attrs.sale_amount || 0);
    const cost = parseFloat(attrs.construction_cost || 0);
    const profit = parseFloat(attrs.project_profit || 0);
    
    acc.total += saleAmount;
    acc.cost += cost;
    acc.profit += profit;
    
    return acc;
  }, { total: 0, cost: 0, profit: 0 });

  // Generate list of available months from sales data
  const getAvailableMonths = () => {
    const months = new Set<string>();
    salesList.forEach((sale: any) => {
      const attrs = sale.attributes || sale;
      const saleDate = attrs.sale_date || attrs.createdAt || attrs.updatedAt || sale.sale_date || sale.createdAt || sale.updatedAt;
      if (saleDate) {
        const date = new Date(saleDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthKey);
      }
    });
    return Array.from(months).sort().reverse();
  };

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

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
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Sales table for cashflow tracking
            </Typography>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 0.5 }}>
              <Link
                href="/cashflow"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'text.primary',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Cashflow
                </Typography>
              </Link>
              <Typography variant="body2" color="text.primary">
                Sales Table
              </Typography>
            </Breadcrumbs>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                component={Link}
                href="/cashflow/sales"
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Sales Table
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/cashflow/payments"
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Payment Table
              </Button>
            </Box>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDrawer()}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Add Sales Entry
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <FilterIcon sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, minWidth: 60 }}>
                  Filters:
                </Typography>
                
                <TextField
                  select
                  label="Month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  sx={{ minWidth: 200 }}
                  size="small"
                  variant="outlined"
                >
                  <MenuItem value="">
                    <em>All Months</em>
                  </MenuItem>
                  {getAvailableMonths().map((month) => (
                    <MenuItem key={month} value={month}>
                      {formatMonthLabel(month)}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{ minWidth: 150 }}
                  size="small"
                  variant="outlined"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Confirmed">Confirmed</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Client"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  sx={{ minWidth: 200 }}
                  size="small"
                  variant="outlined"
                >
                  <MenuItem value="all">All Clients</MenuItem>
                  {getUniqueClients().map((client) => (
                    <MenuItem key={client} value={client}>
                      {client}
                    </MenuItem>
                  ))}
                </TextField>

                {(selectedMonth || selectedStatus !== 'all' || selectedClient !== 'all') && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSelectedMonth('');
                      setSelectedStatus('all');
                      setSelectedClient('all');
                    }}
                    sx={{ textTransform: 'none', ml: 'auto' }}
                  >
                    Clear Filters
                  </Button>
                )}

                <Typography variant="body2" sx={{ color: 'text.secondary', ml: 'auto' }}>
                  Showing {filteredSales.length} of {salesList.length} entries
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
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
                        <TableCell sx={{ fontWeight: 500 }} align="right">Sale Amount</TableCell>
                        <TableCell sx={{ fontWeight: 500 }} align="right">Construction Cost</TableCell>
                        <TableCell sx={{ fontWeight: 500 }} align="right">Project Profit</TableCell>
                        <TableCell sx={{ fontWeight: 500 }} align="right">Margin</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Sale Date</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Notes</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSales.length > 0 ? (
                        filteredSales.map((sale: any, idx: number) => {
                          const attrs = sale.attributes || sale;
                          const saleAmount = parseFloat(attrs.sale_amount || 0);
                          const cost = parseFloat(attrs.construction_cost || 0);
                          const profit = parseFloat(attrs.project_profit || 0);
                          const margin = saleAmount > 0 ? ((profit / saleAmount) * 100).toFixed(1) : '0.0';
                          const saleDate = attrs.sale_date || attrs.createdAt || sale.sale_date || sale.createdAt;
                          
                          return (
                            <TableRow key={sale.id || idx} hover>
                              <TableCell sx={{ fontWeight: 500 }}>
                                {attrs.client || '—'}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 500 }}>
                                {formatCurrency(saleAmount)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 500 }}>
                                {formatCurrency(cost)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 500, color: 'success.main' }}>
                                {formatCurrency(profit)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 500 }}>
                                {margin}%
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
                                {saleDate
                                  ? new Date(saleDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : '—'}
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    maxWidth: 200,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={attrs.notes || ''}
                                >
                                  {attrs.notes || '—'}
                                </Typography>
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
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No sales entries match the selected filters
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Total Row */}
                {filteredSales.length > 0 && (
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableBody>
                        <TableRow 
                          sx={{ 
                            backgroundColor: 'grey.300',
                            '& .MuiTableCell-root': {
                              fontWeight: 600,
                              borderBottom: 'none',
                              fontSize: '0.95rem',
                            }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>
                            Total ({filteredSales.length})
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            {formatCurrency(totals.total)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            {formatCurrency(totals.cost)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>
                            {formatCurrency(totals.profit)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            {totals.total > 0 ? ((totals.profit / totals.total) * 100).toFixed(1) : 0}%
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
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
                  Add First Sales Entry
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 400 }}>
              {editingEntry ? 'Edit Sales Entry' : 'New Sales Entry'}
            </Typography>
            <IconButton onClick={handleCloseDrawer} size="small" disabled={submitting}>
              <CloseIcon />
            </IconButton>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Sale Date"
                type="date"
                value={formData.sale_date ? formData.sale_date.split('T')[0] : ''}
                onChange={(e) => {
                  const dateValue = e.target.value;
                  const datetimeValue = dateValue ? `${dateValue}T00:00` : '';
                  setFormData({ ...formData, sale_date: datetimeValue });
                }}
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                helperText="Date when the sale occurred"
              />

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
                label="Construction Cost"
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
                label="Project Profit"
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

