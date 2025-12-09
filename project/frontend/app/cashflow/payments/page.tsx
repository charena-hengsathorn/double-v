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
  Breadcrumbs,
  TextField,
  MenuItem,
  Drawer,
  IconButton,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { strapiApi } from '@/lib/api';
import { motion } from 'framer-motion';

interface PaymentEntry {
  id?: string;
  billing_id: string;
  customer?: string;
  invoice_number?: string;
  invoice_date: string;
  amount: string;
  currency: string;
  collected_date?: string;
  recognition_month?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_reference?: string;
}

export default function PaymentsTablePage() {
  const [payments, setPayments] = useState<any>(null);
  const [sales, setSales] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PaymentEntry | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<PaymentEntry>({
    billing_id: '',
    customer: '',
    invoice_number: '',
    invoice_date: new Date().toISOString().slice(0, 10),
    amount: '',
    currency: 'USD',
    collected_date: '',
    recognition_month: '',
    status: 'draft',
    payment_reference: '',
  });
  
  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');

  useEffect(() => {
    loadData();
    loadSales();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const billingData = await strapiApi.getBillings().catch(() => ({ data: [] }));
      setPayments(billingData || { data: [] });
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError(err.message || 'Failed to load payment data');
        console.error('Error loading payment data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async () => {
    try {
      const salesData = await strapiApi.getSales().catch(() => ({ data: [] }));
      setSales(salesData || { data: [] });
    } catch (err: any) {
      console.error('Error loading sales data:', err);
    }
  };

  // Get unique customers/clients from sales table
  const getUniqueCustomersFromSales = (): string[] => {
    if (!sales?.data) return [];
    const customers = new Set<string>();
    sales.data.forEach((sale: any) => {
      const attrs = sale.attributes || sale;
      if (attrs.client && attrs.client.trim()) {
        customers.add(attrs.client.trim());
      }
    });
    return Array.from(customers).sort();
  };

  const handleOpenDrawer = (entry?: any) => {
    if (entry) {
      const attrs = entry.attributes || entry;
      setEditingEntry(entry);
      
      setFormData({
        billing_id: attrs.billing_id || '',
        customer: attrs.customer || '',
        invoice_number: attrs.invoice_number || '',
        invoice_date: attrs.invoice_date ? new Date(attrs.invoice_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        amount: attrs.amount?.toString() || '',
        currency: attrs.currency || 'USD',
        collected_date: attrs.collected_date ? new Date(attrs.collected_date).toISOString().slice(0, 10) : '',
        recognition_month: attrs.recognition_month ? new Date(attrs.recognition_month).toISOString().slice(0, 10) : '',
        status: attrs.status || 'draft',
        payment_reference: attrs.payment_reference || '',
      });
    } else {
      setEditingEntry(null);
      // Generate unique billing_id
      const newBillingId = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setFormData({
        billing_id: newBillingId,
        customer: '',
        invoice_number: '',
        invoice_date: new Date().toISOString().slice(0, 10),
        amount: '',
        currency: 'USD',
        collected_date: '',
        recognition_month: '',
        status: 'draft',
        payment_reference: '',
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

    if (!formData.billing_id || formData.billing_id.trim() === '') {
      errors.billing_id = 'Billing ID is required';
    }

    if (!formData.invoice_date) {
      errors.invoice_date = 'Invoice date is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
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
        billing_id: formData.billing_id.trim(),
        customer: formData.customer?.trim() || undefined,
        invoice_number: formData.invoice_number?.trim() || undefined,
        invoice_date: formData.invoice_date,
        amount: parseFloat(formData.amount) || 0,
        currency: formData.currency || 'USD',
        collected_date: formData.collected_date || undefined,
        recognition_month: formData.recognition_month || undefined,
        status: formData.status || 'draft',
        payment_reference: formData.payment_reference?.trim() || undefined,
      };

      if (editingEntry && editingEntry.id) {
        await strapiApi.updateBillings(editingEntry.id, submitData);
      } else {
        await strapiApi.createBillings(submitData);
      }
      
      handleCloseDrawer();
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save payment entry');
      console.error('Error saving payment entry:', err);
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
      case 'paid':
        return 'success';
      case 'sent':
        return 'info';
      case 'overdue':
        return 'error';
      case 'draft':
        return 'default';
      case 'cancelled':
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
          Loading payment data...
        </Typography>
      </Box>
    );
  }

  if (error && !payments) {
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

  const paymentsList = payments?.data || [];

  // Get unique customers from payments data
  const getUniquePaymentCustomers = () => {
    const customers = new Set<string>();
    paymentsList.forEach((payment: any) => {
      const attrs = payment.attributes || payment;
      if (attrs.customer && attrs.customer.trim()) {
        customers.add(attrs.customer.trim());
      }
    });
    return Array.from(customers).sort();
  };

  // Filter payments based on selected month, status, and client
  const filteredPayments = paymentsList.filter((payment: any) => {
    const attrs = payment.attributes || payment;
    
    // Filter by client/customer
    if (selectedClient !== 'all' && attrs.customer !== selectedClient) {
      return false;
    }
    
    // Filter by status
    if (selectedStatus !== 'all' && attrs.status !== selectedStatus) {
      return false;
    }
    
    // Filter by month
    if (selectedMonth) {
      const paymentDate = attrs.invoice_date || attrs.collected_date || attrs.createdAt || payment.invoice_date || payment.collected_date || payment.createdAt;
      if (paymentDate) {
        const date = new Date(paymentDate);
        const paymentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (paymentMonth !== selectedMonth) {
          return false;
        }
      } else {
        return false;
      }
    }
    
    return true;
  });

  // Calculate totals from filtered payments
  const totals = filteredPayments.reduce((acc: any, payment: any) => {
    const attrs = payment.attributes || payment;
    const amount = parseFloat(attrs.amount || 0);
    acc.total += amount;
    return acc;
  }, { total: 0 });

  // Generate list of available months from payments data
  const getAvailableMonths = () => {
    const months = new Set<string>();
    paymentsList.forEach((payment: any) => {
      const attrs = payment.attributes || payment;
      const paymentDate = attrs.invoice_date || attrs.collected_date || attrs.createdAt || payment.invoice_date || payment.collected_date || payment.createdAt;
      if (paymentDate) {
        const date = new Date(paymentDate);
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
              Payment table for cashflow tracking
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
                Payment Table
              </Typography>
            </Breadcrumbs>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                component={Link}
                href="/cashflow/sales"
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Sales Table
              </Button>
              <Button
                variant="contained"
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
              Add Payment Entry
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
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
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
                  {getUniquePaymentCustomers().map((customer) => (
                    <MenuItem key={customer} value={customer}>
                      {customer}
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
                  Showing {filteredPayments.length} of {paymentsList.length} entries
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 400 }}>
              Payment Table
            </Typography>
            {paymentsList.length > 0 ? (
              <>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, mb: 3 }}>
                  <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 500 }}>Invoice Number</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Invoice Date</TableCell>
                        <TableCell sx={{ fontWeight: 500 }} align="right">Amount</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Currency</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Collected Date</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Payment Reference</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPayments.length > 0 ? (
                        filteredPayments.map((payment: any, idx: number) => {
                          const attrs = payment.attributes || payment;
                          const amount = parseFloat(attrs.amount || 0);
                          
                          return (
                            <TableRow key={payment.id || idx} hover>
                              <TableCell sx={{ fontWeight: 500 }}>
                                {attrs.customer || '—'}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 500 }}>
                                {attrs.invoice_number || '—'}
                              </TableCell>
                              <TableCell>
                                {attrs.invoice_date
                                  ? new Date(attrs.invoice_date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : '—'}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 500 }}>
                                {formatCurrency(amount)}
                              </TableCell>
                              <TableCell>
                                {attrs.currency || 'USD'}
                              </TableCell>
                              <TableCell>
                                {attrs.collected_date
                                  ? new Date(attrs.collected_date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : '—'}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={attrs.status || 'draft'}
                                  size="small"
                                  color={getStatusColor(attrs.status) as any}
                                  sx={{ fontWeight: 400 }}
                                />
                              </TableCell>
                              <TableCell>
                                {attrs.payment_reference || '—'}
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDrawer(payment)}
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
                              No payments match the selected filters
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Total Row */}
                {filteredPayments.length > 0 && (
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
                            Total ({filteredPayments.length})
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            {formatCurrency(totals.total)}
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
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
                  No payment entries found
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDrawer()}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Add First Payment Entry
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
              {editingEntry ? 'Edit Payment Entry' : 'New Payment Entry'}
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
                label="Billing ID"
                value={formData.billing_id}
                onChange={(e) => {
                  setFormData({ ...formData, billing_id: e.target.value });
                  if (formErrors.billing_id) {
                    setFormErrors({ ...formErrors, billing_id: '' });
                  }
                }}
                fullWidth
                variant="outlined"
                required
                error={!!formErrors.billing_id}
                helperText={formErrors.billing_id || 'Unique identifier for this billing record'}
              />

              <TextField
                label="Invoice Number"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                fullWidth
                variant="outlined"
              />

              <TextField
                label="Invoice Date"
                type="date"
                value={formData.invoice_date}
                onChange={(e) => {
                  setFormData({ ...formData, invoice_date: e.target.value });
                  if (formErrors.invoice_date) {
                    setFormErrors({ ...formErrors, invoice_date: '' });
                  }
                }}
                fullWidth
                variant="outlined"
                required
                error={!!formErrors.invoice_date}
                helperText={formErrors.invoice_date}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: e.target.value });
                  if (formErrors.amount) {
                    setFormErrors({ ...formErrors, amount: '' });
                  }
                }}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
                error={!!formErrors.amount}
                helperText={formErrors.amount}
                inputProps={{ min: 0, step: 0.01 }}
              />

              <TextField
                label="Currency"
                select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                fullWidth
                variant="outlined"
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="THB">THB</MenuItem>
              </TextField>

              <TextField
                label="Collected Date"
                type="date"
                value={formData.collected_date}
                onChange={(e) => setFormData({ ...formData, collected_date: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                helperText="Date when payment was collected"
              />

              <TextField
                label="Recognition Month"
                type="date"
                value={formData.recognition_month}
                onChange={(e) => setFormData({ ...formData, recognition_month: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                helperText="Month for revenue recognition"
              />

              <TextField
                label="Status"
                select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                fullWidth
                variant="outlined"
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>

              <TextField
                label="Payment Reference"
                value={formData.payment_reference}
                onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
                fullWidth
                variant="outlined"
                helperText="Payment transaction reference or check number"
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

