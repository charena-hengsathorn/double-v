'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { strapiApi } from '@/lib/api';
import { motion } from 'framer-motion';

interface Sale {
  id: number;
  client: string;
  sale_amount: number;
  construction_cost: number;
  project_profit: number;
  status: 'Confirmed' | 'Pending' | 'Closed';
  sale_date?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch sales from all branches
      const [
        constructionSales,
        interiorDesignSales,
        looseFurnitureSales
      ] = await Promise.all([
        strapiApi.getConstructionSales().catch(() => ({ data: [] })),
        strapiApi.getInteriorDesignSales().catch(() => ({ data: [] })),
        strapiApi.getLooseFurnitureSales().catch(() => ({ data: [] })),
      ]);

      // Combine all sales data and normalize format
      const allSales = [
        ...(constructionSales?.data || []),
        ...(interiorDesignSales?.data || []),
        ...(looseFurnitureSales?.data || [])
      ].map((sale: any) => {
        // Normalize Strapi v4 format (with attributes) to direct format
        const attrs = sale.attributes || sale;
        return {
          id: sale.id || sale.documentId,
          client: attrs.client || attrs.customer || '-',
          sale_amount: parseFloat(attrs.sale_amount || attrs.amount || 0),
          construction_cost: parseFloat(attrs.construction_cost || attrs.cost || 0),
          project_profit: parseFloat(attrs.project_profit || attrs.profit || 0),
          status: attrs.status || 'Pending',
          sale_date: attrs.sale_date,
          notes: attrs.notes || '',
          createdAt: sale.createdAt || attrs.createdAt,
          updatedAt: sale.updatedAt || attrs.updatedAt,
        };
      });
      
      setSales(allSales);
    } catch (err: any) {
      setError(err.message || 'Failed to load sales data');
      console.error('Error loading sales:', err);
      setSales([]);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  // Get unique clients for filter dropdown
  const uniqueClients = Array.from(new Set(sales.map((sale) => sale.client).filter(Boolean))).sort();

  // Filter sales by status, client, and date range
  const filteredSales = sales.filter((sale) => {
    // Filter by status
    if (selectedStatus !== 'all' && sale.status !== selectedStatus) {
      return false;
    }

    // Filter by client/company
    if (selectedClient && sale.client !== selectedClient) {
      return false;
    }

    // Filter by date range
    if (startDate || endDate) {
      // Get sale date (prefer sale_date, fallback to createdAt)
      const saleDateStr = (sale as any).sale_date || sale.createdAt;
      if (!saleDateStr) {
        return false; // Exclude entries without dates if date filter is active
      }

      const saleDate = new Date(saleDateStr);
      saleDate.setHours(0, 0, 0, 0); // Normalize to start of day

      // Filter by start date
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (saleDate < start) {
          return false;
        }
      }

      // Filter by end date
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        if (saleDate > end) {
          return false;
        }
      }
    }

    return true;
  });

  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.sale_amount || 0), 0);
  const totalCost = filteredSales.reduce((sum, sale) => sum + (sale.construction_cost || 0), 0);
  const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.project_profit || 0), 0);

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 300, mb: 1, letterSpacing: '-0.02em' }}>
              Sales
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track all sales entries and financial metrics
            </Typography>
          </Box>
          <Tooltip title="Refresh sales data">
            <IconButton onClick={loadSales} disabled={loading} sx={{ ml: 2 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </motion.div>

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
              
              {/* Status Filter */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Confirmed">Confirmed</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>

              {/* Company/Client Filter */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Company</InputLabel>
                <Select
                  value={selectedClient}
                  label="Company"
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  <MenuItem value="">All Companies</MenuItem>
                  {uniqueClients.map((client) => (
                    <MenuItem key={client} value={client}>
                      {client}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Date Range Filters */}
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, ml: 1 }}>
                Date Range:
              </Typography>
              
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                sx={{ minWidth: 180 }}
                size="small"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                sx={{ minWidth: 180 }}
                size="small"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: startDate || undefined, // End date can't be before start date
                }}
              />

              {/* Clear Filters Button */}
              {(startDate || endDate || selectedStatus !== 'all' || selectedClient) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setSelectedStatus('all');
                    setSelectedClient('');
                  }}
                  sx={{ textTransform: 'none', ml: 'auto' }}
                >
                  Clear All
                </Button>
              )}

              {/* Results Count */}
              <Typography variant="body2" sx={{ color: 'text.secondary', ml: 'auto' }}>
                Showing {filteredSales.length} of {sales.length} entries
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>
                Total Sales
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                {formatCurrency(totalSales)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                {filteredSales.length} {filteredSales.length === 1 ? 'entry' : 'entries'}
              </Typography>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>
                Total Cost
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                {formatCurrency(totalCost)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                Construction costs
              </Typography>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>
                Total Profit
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 500, color: 'success.main' }}>
                {formatCurrency(totalProfit)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                {totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0}% margin
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Sales Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : sales.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <Typography variant="body1" color="text.secondary">
                  No sales data found. Add sales entries to see them here.
                </Typography>
              </Box>
            ) : filteredSales.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <Typography variant="body1" color="text.secondary">
                  No sales entries match the selected date range.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Sale Amount</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Construction Cost</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Profit</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Margin</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Sale Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSales.map((sale) => {
                      const margin = sale.sale_amount > 0
                        ? ((sale.project_profit / sale.sale_amount) * 100).toFixed(1)
                        : '0.0';
                      
                      return (
                        <TableRow
                          key={sale.id}
                          hover
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: 'grey.50',
                            },
                          }}
                        >
                          <TableCell>{sale.client || '-'}</TableCell>
                          <TableCell align="right">{formatCurrency(sale.sale_amount || 0)}</TableCell>
                          <TableCell align="right">{formatCurrency(sale.construction_cost || 0)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500, color: 'success.main' }}>
                            {formatCurrency(sale.project_profit || 0)}
                          </TableCell>
                          <TableCell align="right">{margin}%</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={sale.status || 'Pending'}
                              color={getStatusColor(sale.status) as any}
                              size="small"
                            />
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
                              title={sale.notes || ''}
                            >
                              {sale.notes || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {formatDate((sale as any).sale_date || sale.createdAt)}
                          </TableCell>
                          <TableCell>{formatDate(sale.createdAt)}</TableCell>
                        </TableRow>
                      );
                    })}
                    {/* Total Row */}
                    {filteredSales.length > 0 && (
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
                          {formatCurrency(totalSales)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {formatCurrency(totalCost)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>
                          {formatCurrency(totalProfit)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0}%
                        </TableCell>
                        <TableCell align="center">-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

