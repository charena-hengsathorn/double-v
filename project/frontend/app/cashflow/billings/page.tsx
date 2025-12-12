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
  FormControl,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { strapiApi } from '@/lib/api';
import { motion } from 'framer-motion';

interface BillingEntry {
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

export default function BillingsTablePage() {
  // Calculate current month and year once
  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentYear = String(currentDate.getFullYear());
  
  const [billings, setBillings] = useState<any>(null);
  const [sales, setSales] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<BillingEntry>({
    billing_id: '',
    customer: '',
    invoice_number: '',
    invoice_date: new Date().toISOString().slice(0, 10),
    amount: '',
    currency: 'USD',
    collected_date: '',
    recognition_month: `${currentYear}-${currentMonth}`,
    status: 'draft',
    payment_reference: '',
  });
  // Separate state for month and year selectors - preset to current month/year
  const [recognitionMonth, setRecognitionMonth] = useState<string>(currentMonth);
  const [recognitionYear, setRecognitionYear] = useState<string>(currentYear);
  
  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Notification state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadData();
    loadSales();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const billingData = await strapiApi.getBillings().catch(() => ({ data: [] }));
      setBillings(billingData || { data: [] });
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError(err.message || 'Failed to load billing data');
        console.error('Error loading billing data:', err);
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
      
      // Handle recognition_month - parse to month and year
      let month = '';
      let year = '';
      if (attrs.recognition_month) {
        const date = new Date(attrs.recognition_month);
        if (!isNaN(date.getTime())) {
          month = String(date.getMonth() + 1).padStart(2, '0');
          year = String(date.getFullYear());
        } else if (attrs.recognition_month.match(/^\d{4}-\d{2}$/)) {
          // Already in YYYY-MM format
          const parts = attrs.recognition_month.split('-');
          year = parts[0];
          month = parts[1];
        }
      }
      
      // If no recognition_month exists, use current month/year as default
      const finalMonth = month || currentMonth;
      const finalYear = year || currentYear;
      
      setRecognitionMonth(finalMonth);
      setRecognitionYear(finalYear);
      
      setFormData({
        billing_id: attrs.billing_id || '',
        customer: attrs.customer || '',
        invoice_number: attrs.invoice_number || '',
        invoice_date: attrs.invoice_date ? new Date(attrs.invoice_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        amount: attrs.amount?.toString() || '',
        currency: attrs.currency || 'USD',
        collected_date: attrs.collected_date ? new Date(attrs.collected_date).toISOString().slice(0, 10) : '',
        recognition_month: finalMonth && finalYear ? `${finalYear}-${finalMonth}` : '',
        status: attrs.status || 'draft',
        payment_reference: attrs.payment_reference || '',
      });
    } else {
      setEditingEntry(null);
      // Generate unique billing_id
      const newBillingId = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Reset to current month/year for new entries
      setRecognitionMonth(currentMonth);
      setRecognitionYear(currentYear);
      
      setFormData({
        billing_id: newBillingId,
        customer: '',
        invoice_number: '',
        invoice_date: new Date().toISOString().slice(0, 10),
        amount: '',
        currency: 'USD',
        collected_date: '',
        recognition_month: `${currentYear}-${currentMonth}`,
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
    // Reset to current month/year when closing
    setRecognitionMonth(currentMonth);
    setRecognitionYear(currentYear);
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

      // Combine month and year into YYYY-MM-DD format (first day of month) for Strapi date field
      const recognitionMonthValue = recognitionMonth && recognitionYear 
        ? `${recognitionYear}-${recognitionMonth}-01` 
        : undefined;
      
      const submitData: any = {
        billing_id: formData.billing_id.trim(),
        customer: formData.customer?.trim() || undefined,
        invoice_number: formData.invoice_number?.trim() || undefined,
        invoice_date: formData.invoice_date, // Already in YYYY-MM-DD format
        amount: parseFloat(formData.amount) || 0,
        currency: formData.currency || 'USD',
        collected_date: formData.collected_date || undefined, // Already in YYYY-MM-DD format or undefined
        recognition_month: recognitionMonthValue, // YYYY-MM-01 format for date type
        status: formData.status || 'draft',
        payment_reference: formData.payment_reference?.trim() || undefined,
      };

      // Handle both Strapi response formats (with/without attributes)
      // For UPDATE, prefer documentId (Strapi v4 standard)
      const entryId = editingEntry?.documentId || editingEntry?.id || (editingEntry?.attributes?.documentId) || (editingEntry?.attributes?.id);
      
      if (editingEntry && entryId) {
        await strapiApi.updateBillings(entryId, submitData);
      } else {
        await strapiApi.createBillings(submitData);
      }
      
      handleCloseDrawer();
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save billing entry');
      console.error('Error saving billing entry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!editingEntry) {
      console.error('[DELETE] No editing entry found');
      return;
    }

    // Prevent duplicate calls (React StrictMode in dev renders twice)
    if (deleting) {
      console.log('[DELETE] Delete already in progress, ignoring duplicate call');
      return;
    }

    // Handle both Strapi response formats (with/without attributes)
    // Strapi v4 returns: { id: 1, documentId: '...', attributes: {...} }
    // For DELETE, Strapi v4 prefers documentId over id
    const entryId = editingEntry.documentId || editingEntry.id || (editingEntry.attributes?.documentId) || (editingEntry.attributes?.id);
    
    console.log('[DELETE] Editing entry structure:', editingEntry);
    console.log('[DELETE] Extracted ID:', entryId);
    
    if (!entryId) {
      console.error('[DELETE] No ID found in entry. Full entry:', JSON.stringify(editingEntry, null, 2));
      setSnackbar({
        open: true,
        message: 'Cannot delete: Entry ID not found',
        severity: 'error',
      });
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      
      console.log('[DELETE] Attempting to delete billing entry with ID:', entryId, 'Type:', typeof entryId);
      await strapiApi.deleteBillings(entryId);
      
      setSnackbar({
        open: true,
        message: 'Billing entry deleted successfully',
        severity: 'success',
      });
      
      setDeleteDialogOpen(false);
      handleCloseDrawer();
      await loadData();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete billing entry',
        severity: 'error',
      });
      console.error('Error deleting billing entry:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
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
                Loading billing data...
              </Typography>
      </Box>
    );
  }

  if (error && !billings) {
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

  const billingsList = billings?.data || [];

  // Get unique customers from billings data
  const getUniqueBillingCustomers = () => {
    const customers = new Set<string>();
    billingsList.forEach((billing: any) => {
      const attrs = billing.attributes || billing;
      if (attrs.customer && attrs.customer.trim()) {
        customers.add(attrs.customer.trim());
      }
    });
    return Array.from(customers).sort();
  };

  // Filter billings based on selected month, status, and client
  const filteredBillings = billingsList.filter((billing: any) => {
    const attrs = billing.attributes || billing;
    
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
      const billingDate = attrs.invoice_date || attrs.collected_date || attrs.createdAt || billing.invoice_date || billing.collected_date || billing.createdAt;
      if (billingDate) {
        const date = new Date(billingDate);
        const billingMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (billingMonth !== selectedMonth) {
          return false;
        }
      } else {
        return false;
      }
    }
    
    return true;
  });

  // Calculate totals from filtered billings
  const totals = filteredBillings.reduce((acc: any, billing: any) => {
    const attrs = billing.attributes || billing;
    const amount = parseFloat(attrs.amount || 0);
    acc.total += amount;
    return acc;
  }, { total: 0 });

  // Generate list of available months from billings data
  const getAvailableMonths = () => {
    const months = new Set<string>();
    billingsList.forEach((billing: any) => {
      const attrs = billing.attributes || billing;
      const billingDate = attrs.invoice_date || attrs.collected_date || attrs.createdAt || billing.invoice_date || billing.collected_date || billing.createdAt;
      if (billingDate) {
        const date = new Date(billingDate);
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
              Billing table for cashflow tracking
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
                Billing Table
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
                href="/cashflow/billings"
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Billing Table
              </Button>
            </Box>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDrawer()}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Add Billing Entry
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
                  {getUniqueBillingCustomers().map((customer) => (
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
                  Showing {filteredBillings.length} of {billingsList.length} entries
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

        {/* Billings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 400 }}>
                Billing Table
              </Typography>
              {billingsList.length > 0 ? (
              <>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 500 }}>Billing ID</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Client</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Invoice Number</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Invoice Date</TableCell>
                        <TableCell sx={{ fontWeight: 500 }} align="right">Amount</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Currency</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Collected Date</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Recognition Month</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Payment Reference</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredBillings.length > 0 ? (
                        filteredBillings.map((billing: any, idx: number) => {
                          const attrs = billing.attributes || billing;
                          const amount = parseFloat(attrs.amount || 0);
                          let recognitionMonthDisplay = '—';
                          if (attrs.recognition_month) {
                            const recDate = new Date(attrs.recognition_month);
                            if (!isNaN(recDate.getTime())) {
                              recognitionMonthDisplay = recDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                              });
                            }
                          }
                          return (<TableRow key={billing.id || idx} hover>
                              <TableCell sx={{ fontWeight: 500 }}>
                                {attrs.billing_id || '—'}
                              </TableCell>
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
                                {recognitionMonthDisplay}
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
                                  onClick={() => handleOpenDrawer(billing)}
                                  sx={{ color: 'text.secondary' }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>);
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={11} align="center" sx={{ py: 4 }}><Typography variant="body2" color="text.secondary">No billings match the selected filters</Typography></TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Total Row */}
                {filteredBillings.length > 0 && (
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableBody>
                        <TableRow sx={{ backgroundColor: 'grey.300', '& .MuiTableCell-root': { fontWeight: 600, borderBottom: 'none', fontSize: '0.95rem' } }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Total ({filteredBillings.length})</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(totals.total)}</TableCell>
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
                      No billing entries found
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDrawer()}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Add First Billing Entry
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 400 }}>
                {editingEntry ? 'Edit Billing Entry' : 'New Billing Entry'}
              </Typography>
              {editingEntry && (
                <IconButton
                  onClick={handleDeleteClick}
                  size="small"
                  disabled={submitting || deleting}
                  sx={{ color: 'error.main', ml: 1 }}
                  title="Delete entry"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
            <IconButton onClick={handleCloseDrawer} size="small" disabled={submitting || deleting}>
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
                label="Client"
                select
                value={formData.customer || ''}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                fullWidth
                variant="outlined"
                helperText="Select client from sales table"
              >
                <MenuItem value="">
                  <em>Select Client</em>
                </MenuItem>
                {getUniqueCustomersFromSales().map((client) => (
                  <MenuItem key={client} value={client}>
                    {client}
                  </MenuItem>
                ))}
              </TextField>

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
                helperText="Date when billing was collected"
              />

              <FormControl fullWidth variant="outlined">
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Month"
                    select
                    value={recognitionMonth}
                    onChange={(e) => {
                      setRecognitionMonth(e.target.value);
                      if (e.target.value && recognitionYear) {
                        setFormData({ ...formData, recognition_month: `${recognitionYear}-${e.target.value}` });
                      }
                    }}
                    sx={{ flex: 1 }}
                    variant="outlined"
                  >
                    {[
                      { value: '01', label: 'January' },
                      { value: '02', label: 'February' },
                      { value: '03', label: 'March' },
                      { value: '04', label: 'April' },
                      { value: '05', label: 'May' },
                      { value: '06', label: 'June' },
                      { value: '07', label: 'July' },
                      { value: '08', label: 'August' },
                      { value: '09', label: 'September' },
                      { value: '10', label: 'October' },
                      { value: '11', label: 'November' },
                      { value: '12', label: 'December' },
                    ].map((month) => (
                      <MenuItem key={month.value} value={month.value}>
                        {month.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Year"
                    select
                    value={recognitionYear}
                    onChange={(e) => {
                      setRecognitionYear(e.target.value);
                      if (recognitionMonth && e.target.value) {
                        setFormData({ ...formData, recognition_month: `${e.target.value}-${recognitionMonth}` });
                      }
                    }}
                    sx={{ flex: 1 }}
                    variant="outlined"
                  >
                    {(() => {
                      const years = [];
                      const currentYear = new Date().getFullYear();
                      // Generate years from 5 years ago to 5 years ahead
                      for (let i = -5; i <= 5; i++) {
                        const year = currentYear + i;
                        years.push(year);
                      }
                      return years.map((year) => (
                        <MenuItem key={year} value={String(year)}>
                          {year}
                        </MenuItem>
                      ));
                    })()}
                  </TextField>
                </Box>
                <FormHelperText>Recognition Month & Year</FormHelperText>
              </FormControl>

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
                helperText="Billing transaction reference or check number"
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCloseDrawer}
              fullWidth
              disabled={submitting || deleting}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<SaveIcon />}
              fullWidth
              disabled={submitting || deleting}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              {submitting ? 'Saving...' : editingEntry ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Billing Entry?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this billing entry? This action cannot be undone.
            {(() => {
              const attrs = editingEntry?.attributes || editingEntry;
              const billingId = attrs?.billing_id;
              if (billingId) {
                return (
                  <Typography component="span" sx={{ display: 'block', mt: 1, fontWeight: 500 }}>
                    Billing ID: {billingId}
                  </Typography>
                );
              }
              return null;
            })()}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            sx={{ textTransform: 'none' }}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

