'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  FormControl,
  FormHelperText,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  LinearProgress,
  Alert,
  Checkbox,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface MultiMonthBillingDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (entries: MonthlyBillingEntry[]) => Promise<void>;
  currentMonth: string;
  currentYear: string;
  clients: string[];
  branchType: 'construction' | 'loose-furniture' | 'interior-design' | 'cashflow';
}

export interface MonthlyBillingEntry {
  billing_id: string;
  customer: string;
  invoice_number: string;
  invoice_date: string;
  amount: number;
  currency: string;
  recognition_month: string; // YYYY-MM-01 format
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  collected_date?: string;
  payment_reference?: string;
  construction_cost?: number;
  project_profit?: number;
  // For updates: Strapi entry ID (documentId preferred, fallback to id)
  id?: string | number;
  documentId?: string;
}

type DistributionMethod = 'even' | 'custom' | 'percentage';

export default function MultiMonthBillingDrawer({
  open,
  onClose,
  onSubmit,
  currentMonth,
  currentYear,
  clients,
  branchType,
}: MultiMonthBillingDrawerProps) {
  const [formData, setFormData] = useState({
    customer: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    currency: 'USD',
    selectedYear: currentYear,
    selectedMonths: [] as string[], // Array of month values like ['01', '03', '09']
    totalAmount: '',
    totalCost: '',
    distributionMethod: 'even' as DistributionMethod,
    defaultStatus: 'draft' as MonthlyBillingEntry['status'],
    applyCollectedDate: false,
    collectedDate: '',
    paymentReference: '',
  });

  const [monthlyEntries, setMonthlyEntries] = useState<MonthlyBillingEntry[]>([]);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [customCosts, setCustomCosts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [monthStatuses, setMonthStatuses] = useState<Record<string, MonthlyBillingEntry['status']>>({});
  // Track existing entry IDs from Strapi (monthKey -> { id, documentId })
  const [existingEntryIds, setExistingEntryIds] = useState<Record<string, { id?: string | number; documentId?: string }>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingPrevious, setLoadingPrevious] = useState(false);

  const getBillingsEndpoint = () => {
    switch (branchType) {
      case 'construction':
        return '/api/construction-billings';
      case 'loose-furniture':
        return '/api/loose-furniture-billings';
      case 'interior-design':
        return '/api/interior-design-billings';
      case 'cashflow':
      default:
        return '/api/billings';
    }
  };

  // Calculate selected months based on user selection
  const monthsInRange = useMemo(() => {
    if (!formData.selectedYear || formData.selectedMonths.length === 0) {
      return [];
    }
    
    // Sort months to ensure consistent order
    const sortedMonths = [...formData.selectedMonths].sort();
    
    return sortedMonths.map((month) => `${formData.selectedYear}-${month}`);
  }, [formData.selectedYear, formData.selectedMonths]);

  // When selecting a client, auto-populate from previous Strapi entries
  useEffect(() => {
    const customer = (formData.customer || '').trim();
    if (!open || !customer) return;

    let cancelled = false;

    async function loadPrevious() {
      try {
        setLoadingPrevious(true);
        setError(null);

        const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const qs = new URLSearchParams();
        qs.append('filters[customer][$eq]', customer);
        qs.append('sort', 'invoice_date:desc');
        qs.append('pagination[pageSize]', '200');

        const res = await fetch(`${getBillingsEndpoint()}?${qs.toString()}`, { headers });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = json?.error?.message || json?.error || `HTTP ${res.status}: ${res.statusText}`;
          throw new Error(msg);
        }

        const list: any[] = Array.isArray(json?.data) ? json.data : [];
        if (cancelled || list.length === 0) return;

        // Normalize Strapi response (attributes vs direct)
        const norm = list.map((x) => x?.attributes ? { ...x.attributes, id: x.id, documentId: x.documentId } : x);

        // Pick the most recent recognition_month year if available, else invoice_date year, else currentYear
        const first = norm[0] || {};
        const rec = first.recognition_month ? new Date(first.recognition_month) : null;
        const inv = first.invoice_date ? new Date(first.invoice_date) : null;
        const targetYear =
          (rec && !isNaN(rec.getTime()) ? String(rec.getFullYear()) : null) ||
          (inv && !isNaN(inv.getTime()) ? String(inv.getFullYear()) : null) ||
          currentYear;

        // Filter to that year and map month → latest entry for that month
        const entriesForYear = norm
          .filter((e) => {
            const d = e.recognition_month ? new Date(e.recognition_month) : null;
            if (!d || isNaN(d.getTime())) return false;
            return String(d.getFullYear()) === targetYear;
          })
          .sort((a, b) => {
            const da = a.invoice_date ? new Date(a.invoice_date).getTime() : 0;
            const db = b.invoice_date ? new Date(b.invoice_date).getTime() : 0;
            return db - da;
          });

        const monthToEntry: Record<string, any> = {};
        for (const e of entriesForYear) {
          const d = e.recognition_month ? new Date(e.recognition_month) : null;
          if (!d || isNaN(d.getTime())) continue;
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const key = `${targetYear}-${month}`;
          if (!monthToEntry[key]) monthToEntry[key] = e; // keep first (sorted desc)
        }

        const selectedMonths = Object.keys(monthToEntry)
          .map((k) => k.split('-')[1])
          .sort();

        const nextCustomAmounts: Record<string, string> = {};
        const nextCustomCosts: Record<string, string> = {};
        const nextMonthStatuses: Record<string, MonthlyBillingEntry['status']> = {};
        const nextExistingIds: Record<string, { id?: string | number; documentId?: string }> = {};

        for (const month of selectedMonths) {
          const key = `${targetYear}-${month}`;
          const e = monthToEntry[key];
          nextCustomAmounts[key] = e?.amount != null ? String(e.amount) : '';
          nextCustomCosts[key] = e?.construction_cost != null ? String(e.construction_cost) : '';
          const status = (e?.status || 'draft') as MonthlyBillingEntry['status'];
          nextMonthStatuses[key] = status;
          // Store existing entry IDs for updates
          if (e?.documentId || e?.id) {
            nextExistingIds[key] = {
              id: e.id,
              documentId: e.documentId,
            };
          }
        }

        // Populate core fields from the latest entry
        const strippedInvoice =
          typeof first.invoice_number === 'string'
            ? first.invoice_number.replace(/-\d{2}$/, '')
            : '';

        const sumAmount = selectedMonths.reduce((sum, m) => sum + (parseFloat(nextCustomAmounts[`${targetYear}-${m}`] || '0') || 0), 0);
        const sumCost = selectedMonths.reduce((sum, m) => sum + (parseFloat(nextCustomCosts[`${targetYear}-${m}`] || '0') || 0), 0);

        if (cancelled) return;
        setFormData((prev) => ({
          ...prev,
          currency: first.currency || prev.currency,
          invoiceNumber: strippedInvoice || prev.invoiceNumber,
          paymentReference: first.payment_reference || prev.paymentReference,
          selectedYear: targetYear,
          selectedMonths,
          distributionMethod: 'custom',
          totalAmount: sumAmount > 0 ? String(sumAmount) : prev.totalAmount,
          totalCost: sumCost > 0 ? String(sumCost) : prev.totalCost,
          defaultStatus: (first.status || prev.defaultStatus) as MonthlyBillingEntry['status'],
        }));
        setCustomAmounts(nextCustomAmounts);
        setCustomCosts(nextCustomCosts);
        setMonthStatuses(nextMonthStatuses);
        setExistingEntryIds(nextExistingIds);
      } catch (e: any) {
        if (!cancelled) {
          console.error('Failed to auto-populate previous entries:', e);
          // Keep non-blocking: show error but don't prevent manual entry
          setError(e?.message || 'Failed to load previous entries for this client');
        }
      } finally {
        if (!cancelled) setLoadingPrevious(false);
      }
    }

    loadPrevious();
    return () => {
      cancelled = true;
    };
  }, [open, formData.customer, branchType, currentYear]);

  // Calculate monthly breakdown based on distribution method
  useEffect(() => {
    if (monthsInRange.length === 0) {
      setMonthlyEntries([]);
      return;
    }

    const numMonths = monthsInRange.length;
    const totalAmount = parseFloat(formData.totalAmount || '0');
    const totalCost = parseFloat(formData.totalCost || '0');
    const needsTotals = formData.distributionMethod !== 'custom';
    if (needsTotals && totalAmount <= 0) {
      setMonthlyEntries([]);
      return;
    }

    const entries: MonthlyBillingEntry[] = [];
    let remainingAmount = totalAmount;
    let remainingCost = totalCost;

    monthsInRange.forEach((monthKey, index) => {
      const [year, month] = monthKey.split('-');
      const recognitionMonth = `${year}-${month}-01`;
      const isLastMonth = index === numMonths - 1;

      let amount = 0;
      let cost = 0;

      if (formData.distributionMethod === 'even') {
        // Even distribution
        if (isLastMonth) {
          amount = remainingAmount; // Use remaining to avoid rounding errors
          cost = remainingCost;
        } else {
          amount = totalAmount / numMonths;
          cost = totalCost / numMonths;
          remainingAmount -= amount;
          remainingCost -= cost;
        }
      } else if (formData.distributionMethod === 'custom') {
        // Custom amounts and costs per month (no totals required)
        amount = parseFloat(customAmounts[monthKey] || '0') || 0;
        cost = parseFloat(customCosts[monthKey] || '0') || 0;
      } else if (formData.distributionMethod === 'percentage') {
        // Percentage-based
        const percentage = parseFloat(percentages[monthKey] || '0') / 100;
        amount = totalAmount * percentage;
        cost = totalCost * percentage;
      }

      const profit = amount - cost;

      // Generate unique billing_id
      const billingId = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${index}`;
      
      // Generate invoice number
      const invoiceNumber = formData.invoiceNumber 
        ? `${formData.invoiceNumber}-${String(index + 1).padStart(2, '0')}`
        : `INV-${Date.now()}-${String(index + 1).padStart(2, '0')}`;

      // Check if this entry already exists in Strapi
      const existingId = existingEntryIds[monthKey];
      
      entries.push({
        billing_id: billingId,
        customer: formData.customer,
        invoice_number: invoiceNumber,
        invoice_date: formData.invoiceDate,
        amount: Math.round((amount || 0) * 100) / 100, // Round to 2 decimals
        currency: formData.currency,
        recognition_month: recognitionMonth,
        status: monthStatuses[monthKey] || formData.defaultStatus,
        collected_date: formData.applyCollectedDate ? formData.collectedDate : undefined,
        payment_reference: formData.paymentReference || undefined,
        // Match existing single-entry behavior: omit empty/invalid values for Strapi compatibility
        construction_cost: cost > 0 ? Math.round(cost * 100) / 100 : undefined,
        project_profit: profit > 0 ? Math.round(profit * 100) / 100 : undefined,
        // Include existing IDs for updates
        id: existingId?.id,
        documentId: existingId?.documentId,
      });
    });

    setMonthlyEntries(entries);
  }, [
    formData,
    monthsInRange,
    customAmounts,
    customCosts,
    percentages,
    monthStatuses,
    existingEntryIds,
  ]);

  const resetState = () => {
    setFormData({
      customer: '',
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().slice(0, 10),
      currency: 'USD',
      selectedYear: currentYear,
      selectedMonths: [],
      totalAmount: '',
      totalCost: '',
      distributionMethod: 'even',
      defaultStatus: 'draft',
      applyCollectedDate: false,
      collectedDate: '',
      paymentReference: '',
    });
    setCustomAmounts({});
    setCustomCosts({});
    setPercentages({});
    setMonthStatuses({});
    setExistingEntryIds({});
    setFormErrors({});
    setError(null);
    setProgress(0);
  };

  // User-triggered close (prevent backdrop close mid-submit)
  const handleClose = () => {
    if (submitting) return;
    resetState();
    onClose();
  };

  // Internal close after successful submit (must bypass async state timing)
  const closeAfterSuccess = () => {
    resetState();
    onClose();
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.customer || formData.customer.trim() === '') {
      errors.customer = 'Client selection is required';
    }

    if (!formData.invoiceDate) {
      errors.invoiceDate = 'Invoice date is required';
    }

    if (formData.selectedMonths.length === 0) {
      errors.selectedMonths = 'Please select at least one month.';
    }

    if (formData.distributionMethod === 'custom') {
      // In custom mode, the per-month values are the source of truth.
      monthsInRange.forEach((monthKey) => {
        const amount = parseFloat(customAmounts[monthKey] || '0') || 0;
        if (amount <= 0) {
          errors.customAmounts = 'Each selected month must have an amount greater than 0';
        }
      });

      // Optional: if user fills Total Amount, ensure it matches the sum of custom amounts.
      const totalAmountProvided = parseFloat(formData.totalAmount || '0') || 0;
      if (totalAmountProvided > 0) {
        const totalCustom = monthsInRange.reduce(
          (sum, month) => sum + (parseFloat(customAmounts[month] || '0') || 0),
          0
        );
        if (Math.abs(totalCustom - totalAmountProvided) > 0.01) {
          errors.customAmounts =
            `Custom amounts total (${totalCustom.toFixed(2)}) must equal total amount (${totalAmountProvided.toFixed(2)})`;
        }
      }
    } else {
      // Even / Percentage mode needs totals
      const totalAmount = parseFloat(formData.totalAmount || '0') || 0;
      if (totalAmount <= 0) {
        errors.totalAmount = 'Total amount must be greater than 0';
      }
    }

    if (formData.distributionMethod === 'percentage') {
      const totalPercentage = monthsInRange.reduce((sum, month) => 
        sum + parseFloat(percentages[month] || '0'), 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        errors.percentages = `Percentages must total 100% (currently ${totalPercentage.toFixed(2)}%)`;
      }
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
      setProgress(0);
      // Create all entries in one batch so the parent can call loadData() once.
      await onSubmit(monthlyEntries);
      setProgress(100);
      closeAfterSuccess();
    } catch (err: any) {
      console.error('Error creating billing entries:', err);
      setError(err?.message || 'Failed to create billing entries');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const totalPreview = monthlyEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalCostPreview = monthlyEntries.reduce((sum, entry) => sum + (entry.construction_cost || 0), 0);
  const totalProfitPreview = monthlyEntries.reduce((sum, entry) => sum + (entry.project_profit || 0), 0);
  
  // Count how many entries are updates vs creates
  const updateCount = monthlyEntries.filter(e => e.documentId || e.id).length;
  const createCount = monthlyEntries.length - updateCount;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: '90%', md: '800px' }, maxWidth: '800px' },
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 400 }}>
            Multi-Month Billing Entry
          </Typography>
          <IconButton onClick={handleClose} disabled={submitting}>
            <CloseIcon />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {submitting && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {updateCount > 0 ? 'Updating entries...' : 'Creating entries...'} {Math.round(progress)}%
            </Typography>
          </Box>
        )}

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {/* Basic Information */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 400 }}>
            Basic Information
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
            <TextField
              select
              label="Client *"
              value={formData.customer}
              onChange={(e) => {
                setFormData({ ...formData, customer: e.target.value });
                if (formErrors.customer) setFormErrors({ ...formErrors, customer: '' });
              }}
              error={!!formErrors.customer}
              helperText={formErrors.customer || (loadingPrevious ? 'Loading previous entries…' : 'Auto-loads previous entries for this client')}
              required
              disabled={submitting}
            >
              {clients.map((client) => (
                <MenuItem key={client} value={client}>
                  {client}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Invoice Number"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              placeholder="Auto-generated if empty"
              disabled={submitting}
              helperText="Will be suffixed with -01, -02, etc. for each month"
            />

            <TextField
              label="Invoice Date *"
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => {
                setFormData({ ...formData, invoiceDate: e.target.value });
                if (formErrors.invoiceDate) setFormErrors({ ...formErrors, invoiceDate: '' });
              }}
              error={!!formErrors.invoiceDate}
              helperText={formErrors.invoiceDate}
              required
              disabled={submitting}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              select
              label="Currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              disabled={submitting}
            >
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="THB">THB</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
            </TextField>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Year and Month Selection */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 400 }}>
            Select Year and Months
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
            <TextField
              select
              label="Year *"
              value={formData.selectedYear}
              onChange={(e) => {
                setFormData({ ...formData, selectedYear: e.target.value, selectedMonths: [] });
                setCustomAmounts({});
                setCustomCosts({});
                setPercentages({});
                setMonthStatuses({});
                setExistingEntryIds({});
                if (formErrors.selectedMonths) setFormErrors({ ...formErrors, selectedMonths: '' });
              }}
              disabled={submitting}
              required
            >
              {Array.from({ length: 11 }, (_, i) => {
                const year = new Date().getFullYear() - 5 + i;
                return (
                  <MenuItem key={year} value={String(year)}>
                    {year}
                  </MenuItem>
                );
              })}
            </TextField>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Select Months * (can select multiple)
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1 }}>
              {Array.from({ length: 12 }, (_, i) => {
                const month = String(i + 1).padStart(2, '0');
                const date = new Date(2000, i, 1);
                const monthName = date.toLocaleDateString('en-US', { month: 'long' });
                const isSelected = formData.selectedMonths.includes(month);
                
                return (
                  <FormControlLabel
                    key={month}
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => {
                          const newMonths = e.target.checked
                            ? [...formData.selectedMonths, month]
                            : formData.selectedMonths.filter((m) => m !== month);
                          setFormData({ ...formData, selectedMonths: newMonths });
                          // Clear custom values for removed months
                          if (!e.target.checked) {
                            const newCustomAmounts = { ...customAmounts };
                            const newCustomCosts = { ...customCosts };
                            const newPercentages = { ...percentages };
                            const newMonthStatuses = { ...monthStatuses };
                            const newExistingIds = { ...existingEntryIds };
                            const key = `${formData.selectedYear}-${month}`;
                            delete newCustomAmounts[key];
                            delete newCustomCosts[key];
                            delete newPercentages[key];
                            delete newMonthStatuses[key];
                            delete newExistingIds[key];
                            setCustomAmounts(newCustomAmounts);
                            setCustomCosts(newCustomCosts);
                            setPercentages(newPercentages);
                            setMonthStatuses(newMonthStatuses);
                            setExistingEntryIds(newExistingIds);
                          }
                          if (formErrors.selectedMonths) setFormErrors({ ...formErrors, selectedMonths: '' });
                        }}
                        disabled={submitting}
                      />
                    }
                    label={monthName}
                  />
                );
              })}
            </Box>
            {formErrors.selectedMonths && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {formErrors.selectedMonths}
              </Alert>
            )}
          </Box>

          {monthsInRange.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Chip
                label={`${monthsInRange.length} month${monthsInRange.length > 1 ? 's' : ''} selected: ${monthsInRange.map(m => formatMonthLabel(m)).join(', ')}`}
                color="primary"
                variant="outlined"
                sx={{ flexWrap: 'wrap' }}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Amount & Distribution */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 400 }}>
            Amount & Distribution
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
            <TextField
              label="Total Amount *"
              type="number"
              value={formData.totalAmount}
              onChange={(e) => {
                setFormData({ ...formData, totalAmount: e.target.value });
                if (formErrors.totalAmount) setFormErrors({ ...formErrors, totalAmount: '' });
              }}
              error={!!formErrors.totalAmount}
              helperText={formErrors.totalAmount}
              required
              disabled={submitting}
              InputProps={{
                startAdornment: <InputAdornment position="start">{formData.currency}</InputAdornment>,
              }}
            />

            <TextField
              label="Total Cost"
              type="number"
              value={formData.totalCost}
              onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
              disabled={submitting}
              InputProps={{
                startAdornment: <InputAdornment position="start">{formData.currency}</InputAdornment>,
              }}
              helperText="Will be distributed proportionally"
            />
          </Box>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend">Distribution Method</FormLabel>
            <RadioGroup
              value={formData.distributionMethod}
              onChange={(e) => setFormData({ ...formData, distributionMethod: e.target.value as DistributionMethod })}
            >
              <FormControlLabel value="even" control={<Radio />} label="Even Distribution" />
              <FormControlLabel value="custom" control={<Radio />} label="Custom Amounts" />
              <FormControlLabel value="percentage" control={<Radio />} label="Percentage-Based" />
            </RadioGroup>
          </FormControl>

          {/* Custom Amounts and Costs Input */}
          {formData.distributionMethod === 'custom' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Enter amount and construction cost for each month (project profit will be calculated automatically):
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell align="right">Amount *</TableCell>
                      <TableCell align="right">Construction Cost</TableCell>
                      <TableCell align="right">Project Profit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monthsInRange.map((monthKey) => {
                      const amount = parseFloat(customAmounts[monthKey] || '0');
                      const cost = parseFloat(customCosts[monthKey] || '0');
                      const profit = amount - cost;
                      return (
                        <TableRow key={monthKey}>
                          <TableCell>{formatMonthLabel(monthKey)}</TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={customAmounts[monthKey] || ''}
                              onChange={(e) => {
                                setCustomAmounts({ ...customAmounts, [monthKey]: e.target.value });
                                if (formErrors.customAmounts) setFormErrors({ ...formErrors, customAmounts: '' });
                              }}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">{formData.currency}</InputAdornment>,
                              }}
                              sx={{ width: 150 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={customCosts[monthKey] || ''}
                              onChange={(e) => {
                                setCustomCosts({ ...customCosts, [monthKey]: e.target.value });
                                if (formErrors.customAmounts) setFormErrors({ ...formErrors, customAmounts: '' });
                              }}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">{formData.currency}</InputAdornment>,
                              }}
                              sx={{ width: 150 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color: profit > 0 ? 'success.main' : profit < 0 ? 'error.main' : 'text.secondary',
                                minWidth: 100,
                                textAlign: 'right',
                              }}
                            >
                              {profit !== 0 ? formatCurrency(profit) : '—'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow sx={{ bgcolor: 'grey.100', fontWeight: 'bold' }}>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell align="right">
                        <strong>
                          {formatCurrency(
                            monthsInRange.reduce((sum, m) => sum + parseFloat(customAmounts[m] || '0'), 0)
                          )}
                        </strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          {formatCurrency(
                            monthsInRange.reduce((sum, m) => sum + parseFloat(customCosts[m] || '0'), 0)
                          )}
                        </strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          {formatCurrency(
                            monthsInRange.reduce((sum, m) => {
                              const amt = parseFloat(customAmounts[m] || '0');
                              const cost = parseFloat(customCosts[m] || '0');
                              return sum + (amt - cost);
                            }, 0)
                          )}
                        </strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              {formErrors.customAmounts && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {formErrors.customAmounts}
                </Alert>
              )}
            </Box>
          )}

          {/* Percentage Input */}
          {formData.distributionMethod === 'percentage' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Enter percentage for each month (must total 100%):
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monthsInRange.map((monthKey) => (
                      <TableRow key={monthKey}>
                        <TableCell>{formatMonthLabel(monthKey)}</TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={percentages[monthKey] || ''}
                            onChange={(e) => {
                              setPercentages({ ...percentages, [monthKey]: e.target.value });
                              if (formErrors.percentages) setFormErrors({ ...formErrors, percentages: '' });
                            }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            }}
                            sx={{ width: 150 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {formErrors.percentages && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {formErrors.percentages}
                </Alert>
              )}
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Preview Table */}
          {monthlyEntries.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 400 }}>
                Preview ({monthlyEntries.length} entries)
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Cost</TableCell>
                      <TableCell align="right">Profit</TableCell>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monthlyEntries.map((entry, index) => {
                      const [year, month] = entry.recognition_month.split('-');
                      const monthKey = `${year}-${month}`;
                      const monthLabel = formatMonthLabel(monthKey);
                      return (
                        <TableRow key={index} hover>
                          <TableCell>{monthLabel}</TableCell>
                          <TableCell align="right">{formatCurrency(entry.amount)}</TableCell>
                          <TableCell align="right">
                            {entry.construction_cost ? formatCurrency(entry.construction_cost) : '—'}
                          </TableCell>
                          <TableCell align="right">
                            {entry.project_profit ? formatCurrency(entry.project_profit) : '—'}
                          </TableCell>
                          <TableCell>{entry.invoice_number}</TableCell>
                          <TableCell>
                            <TextField
                              select
                              size="small"
                              value={monthStatuses[monthKey] || formData.defaultStatus}
                              onChange={(e) => {
                                const next = e.target.value as MonthlyBillingEntry['status'];
                                setMonthStatuses((prev) => ({ ...prev, [monthKey]: next }));
                              }}
                              disabled={submitting}
                              sx={{ minWidth: 140 }}
                            >
                              <MenuItem value="draft">Draft</MenuItem>
                              <MenuItem value="sent">Sent</MenuItem>
                              <MenuItem value="paid">Paid</MenuItem>
                              <MenuItem value="overdue">Overdue</MenuItem>
                              <MenuItem value="cancelled">Cancelled</MenuItem>
                            </TextField>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow sx={{ bgcolor: 'grey.100', fontWeight: 'bold' }}>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(totalPreview)}</strong></TableCell>
                      <TableCell align="right">
                        <strong>{totalCostPreview > 0 ? formatCurrency(totalCostPreview) : '—'}</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{totalProfitPreview > 0 ? formatCurrency(totalProfitPreview) : '—'}</strong>
                      </TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Additional Options */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 400 }}>
            Additional Options
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <TextField
              select
              label="Default Status"
              value={formData.defaultStatus}
              onChange={(e) =>
                setFormData({ ...formData, defaultStatus: e.target.value as MonthlyBillingEntry['status'] })
              }
              disabled={submitting}
              helperText="Used for all months unless overridden in the Preview table"
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="sent">Sent</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.applyCollectedDate}
                  onChange={(e) => setFormData({ ...formData, applyCollectedDate: e.target.checked })}
                />
              }
              label="Apply same collected date to all entries"
            />

            {formData.applyCollectedDate && (
              <TextField
                label="Collected Date"
                type="date"
                value={formData.collectedDate}
                onChange={(e) => setFormData({ ...formData, collectedDate: e.target.value })}
                disabled={submitting}
                InputLabelProps={{ shrink: true }}
                sx={{ ml: 4 }}
              />
            )}

            <TextField
              label="Payment Reference"
              value={formData.paymentReference}
              onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
              disabled={submitting}
              placeholder="Optional reference for all entries"
            />
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleClose} disabled={submitting} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || monthlyEntries.length === 0}
            startIcon={<SaveIcon />}
            sx={{ textTransform: 'none' }}
          >
            {submitting
              ? `${updateCount > 0 ? 'Updating' : 'Creating'}... ${Math.round(progress)}%`
              : updateCount > 0
              ? `Update ${updateCount} ${updateCount === 1 ? 'Entry' : 'Entries'}${createCount > 0 ? ` & Create ${createCount} ${createCount === 1 ? 'Entry' : 'Entries'}` : ''}`
              : `Create ${monthlyEntries.length} ${monthlyEntries.length === 1 ? 'Entry' : 'Entries'}`}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

