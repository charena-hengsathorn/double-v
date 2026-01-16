'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
  Breadcrumbs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  AttachMoney as SalesIcon,
  Receipt as BillingsIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { strapiApi } from '@/lib/api';
import { motion } from 'framer-motion';
import BranchCashflowTabs from '../../cashflow/components/BranchCashflowTabs';

export default function LooseFurnitureOverviewPage() {
  const pathname = usePathname();
  const [sales, setSales] = useState<any>(null);
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

      const [salesData, billingsData] = await Promise.all([
        strapiApi.getLooseFurnitureSales().catch(() => ({ data: [] })),
        strapiApi.getLooseFurnitureBillings().catch(() => ({ data: [] })),
      ]);

      setSales(salesData || { data: [] });
      setBillings(billingsData || { data: [] });
    } catch (err: any) {
      setError(err.message || 'Failed to load cashflow data');
      console.error('Error loading cashflow data:', err);
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

  // Calculate summary statistics
  const salesData = sales?.data || [];
  const billingsData = billings?.data || [];

  const totalSales = salesData.reduce((sum: number, sale: any) => {
    const attrs = sale.attributes || sale;
    return sum + parseFloat(attrs.sale_amount || 0);
  }, 0);

  const totalCosts = salesData.reduce((sum: number, sale: any) => {
    const attrs = sale.attributes || sale;
    return sum + parseFloat(attrs.construction_cost || 0);
  }, 0);

  const totalProfit = salesData.reduce((sum: number, sale: any) => {
    const attrs = sale.attributes || sale;
    return sum + parseFloat(attrs.project_profit || 0);
  }, 0);

  const totalBillings = billingsData.reduce((sum: number, billing: any) => {
    const attrs = billing.attributes || billing;
    return sum + parseFloat(attrs.amount || 0);
  }, 0);

  const paidBillings = billingsData
    .filter((billing: any) => {
      const attrs = billing.attributes || billing;
      return attrs.status === 'paid';
    })
    .reduce((sum: number, billing: any) => {
      const attrs = billing.attributes || billing;
      return sum + parseFloat(attrs.amount || 0);
    }, 0);

  const pendingBillings = billingsData
    .filter((billing: any) => {
      const attrs = billing.attributes || billing;
      return attrs.status === 'sent' || attrs.status === 'draft';
    })
    .reduce((sum: number, billing: any) => {
      const attrs = billing.attributes || billing;
      return sum + parseFloat(attrs.amount || 0);
    }, 0);

  const salesCount = salesData.length;
  const billingsCount = billingsData.length;

  const englishMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Process data for the detailed table
  const processClientData = () => {
    const clientMap = new Map<string, any>();

    // Process sales data - ensure we're getting data from sales table
    salesData.forEach((sale: any) => {
      const attrs = sale.attributes || sale;
      const client = (attrs.client || sale.client || 'Unnamed Client').trim();
      const status = attrs.status || sale.status || 'Pending';

      if (!client || client === '') return;

      if (!clientMap.has(client)) {
        clientMap.set(client, {
          client,
          status,
          saleAmount: 0,
          costAmount: 0,
          profitAmount: 0,
          salesCostAmount: 0, // Cost from sales table only
          salesProfitAmount: 0, // Profit from sales table only
          projectCount: 0,
          monthlySales: new Array(12).fill(0),
          monthlyCosts: new Array(12).fill(0),
          monthlyProfits: new Array(12).fill(0),
        });
      }

      const clientData = clientMap.get(client)!;
      
      const saleAmount = parseFloat(attrs.sale_amount || sale.sale_amount || 0);
      const costAmount = parseFloat(attrs.construction_cost || sale.construction_cost || 0);
      
      let profitAmount = parseFloat(attrs.project_profit || sale.project_profit || 0);
      if (profitAmount === 0 && saleAmount > 0) {
        profitAmount = saleAmount - costAmount;
      }

      clientData.saleAmount += saleAmount;
      clientData.costAmount += costAmount;
      clientData.profitAmount += profitAmount;
      // Track sales-only costs and profits for display in Sale column
      clientData.salesCostAmount += costAmount;
      clientData.salesProfitAmount += profitAmount;
      clientData.projectCount += 1;

      // Sales entries should NOT be added to monthly columns - only show in Sale column
    });

    // Process billings data - billings should only appear in month columns based on recognition_month
    billingsData.forEach((billing: any) => {
      const attrs = billing.attributes || billing;
      const customer = attrs.customer;
      const amount = parseFloat(attrs.amount || 0);
      const constructionCost = parseFloat(attrs.construction_cost || 0);
      const projectProfit = parseFloat(attrs.project_profit || 0);

      if (customer && clientMap.has(customer)) {
        const clientData = clientMap.get(customer)!;
        
        // Add construction cost and project profit from billings to client totals
        // Note: These are NOT added to salesCostAmount or salesProfitAmount
        // because those should only show data from sales table
        clientData.costAmount += constructionCost;
        clientData.profitAmount += projectProfit;
        
        // Billings should only appear in month columns based on recognition_month
        if (attrs.recognition_month) {
          const recDate = new Date(attrs.recognition_month);
          const month = recDate.getMonth();
          const year = recDate.getFullYear();
          if (year === 2025 || year === new Date().getFullYear()) {
            // Only add to monthly columns if status is paid
            if (attrs.status === 'paid') {
              clientData.monthlySales[month] += amount;
              clientData.monthlyCosts[month] += constructionCost;
              clientData.monthlyProfits[month] += projectProfit;
            }
          }
        } else if (attrs.collected_date) {
          const colDate = new Date(attrs.collected_date);
          const month = colDate.getMonth();
          const year = colDate.getFullYear();
          if (year === 2025 || year === new Date().getFullYear()) {
            // Only add to monthly columns if status is paid
            if (attrs.status === 'paid') {
              clientData.monthlySales[month] += amount;
              clientData.monthlyCosts[month] += constructionCost;
              clientData.monthlyProfits[month] += projectProfit;
            }
          }
        }
      }
    });

    return Array.from(clientMap.values());
  };

  const clientDataArray = processClientData();

  // Calculate grand totals
  const grandTotals = {
    saleAmount: clientDataArray.reduce((sum, c) => sum + c.saleAmount, 0),
    costAmount: clientDataArray.reduce((sum, c) => sum + c.costAmount, 0),
    profitAmount: clientDataArray.reduce((sum, c) => sum + c.profitAmount, 0),
    salesCostAmount: clientDataArray.reduce((sum, c) => sum + c.salesCostAmount, 0),
    salesProfitAmount: clientDataArray.reduce((sum, c) => sum + c.salesProfitAmount, 0),
    projectCount: clientDataArray.reduce((sum, c) => sum + c.projectCount, 0),
    monthlySales: new Array(12).fill(0),
    monthlyCosts: new Array(12).fill(0),
    monthlyProfits: new Array(12).fill(0),
  };

  clientDataArray.forEach((client) => {
    for (let i = 0; i < 12; i++) {
      grandTotals.monthlySales[i] += client.monthlySales[i];
      grandTotals.monthlyCosts[i] += client.monthlyCosts[i];
      grandTotals.monthlyProfits[i] += client.monthlyProfits[i];
    }
  });

  const formatNumber = (value: number) => {
    if (value === 0) return '';
    return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const summaryCards = [
    {
      title: 'Total Sales',
      value: formatCurrency(totalSales),
      icon: SalesIcon,
      color: 'primary',
      href: '/loose-furniture/sales',
    },
    {
      title: 'Total Profit',
      value: formatCurrency(totalProfit),
      icon: TrendingUpIcon,
      color: 'success',
      href: '/loose-furniture/sales',
    },
    {
      title: 'Total Billings',
      value: formatCurrency(totalBillings),
      icon: BillingsIcon,
      color: 'info',
      href: '/loose-furniture/billings',
    },
    {
      title: 'Paid Billings',
      value: formatCurrency(paidBillings),
      icon: AssessmentIcon,
      color: 'success',
      href: '/loose-furniture/billings',
    },
  ];

  const quickStats = [
    { label: 'Sales Entries', value: salesCount, href: '/loose-furniture/sales' },
    { label: 'Billing Entries', value: billingsCount, href: '/loose-furniture/billings' },
    { label: 'Total Costs', value: formatCurrency(totalCosts) },
    { label: 'Pending Billings', value: formatCurrency(pendingBillings) },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading loose-furniture data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Breadcrumbs sx={{ mb: 2 }}>
          <Typography color="text.primary">Loose Furniture</Typography>
          <Typography color="text.secondary">Overview</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ mb: 3, fontWeight: 300 }}>
          Loose Furniture - Overview
        </Typography>
      </motion.div>

      {/* Sub Navigation Tabs */}
      <BranchCashflowTabs branchPath="/loose-furniture" branchName="Loose Furniture" />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Box key={card.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link href={card.href} style={{ textDecoration: 'none' }}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {card.title}
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 400 }}>
                            {card.value}
                          </Typography>
                        </Box>
                        <Icon
                          sx={{
                            color: `${card.color}.main`,
                            fontSize: 40,
                            opacity: 0.8,
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </Box>
          );
        })}
      </Box>

      {/* Detailed Cashflow Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <Card sx={{ mt: 4 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 400 }}>
                Loose Furniture Revenue Breakdown
              </Typography>
            </Box>
            <TableContainer component={Paper} elevation={0}>
              <Table size="small" sx={{ minWidth: 1200 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Client</TableCell>
                    <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Client Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Projects</TableCell>
                    <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Sale</TableCell>
                    {englishMonths.map((month, idx) => (
                      <TableCell key={idx} align="right" sx={{ fontWeight: 600, minWidth: 80 }}>
                        {month}
                      </TableCell>
                    ))}
                    <TableCell align="right" sx={{ fontWeight: 600, minWidth: 120 }}>Total 2025</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, minWidth: 140 }}>Actual Income 2025</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientDataArray.map((client, clientIdx) => (
                    <>
                      {/* Sale Amount Row */}
                      <TableRow key={`${client.client}-sale`} sx={{ bgcolor: clientIdx % 2 === 0 ? 'grey.50' : 'white' }}>
                        <TableCell sx={{ fontWeight: 500 }}>{client.client}</TableCell>
                        <TableCell>
                          {(() => {
                            const status = client.status || 'Pending';
                            let chipColor: 'success' | 'warning' | 'default' | 'error' = 'default';
                            let chipLabel = status.toLowerCase();
                            
                            if (status === 'Confirmed') {
                              chipColor = 'success';
                              chipLabel = 'confirm';
                            } else if (status === 'Pending') {
                              chipColor = 'warning';
                              chipLabel = 'pending';
                            } else if (status === 'Closed') {
                              chipColor = 'default';
                              chipLabel = 'closed';
                            }
                            
                            return (
                              <Chip 
                                label={chipLabel} 
                                size="small" 
                                color={chipColor} 
                                sx={{ height: 20, fontSize: '0.7rem' }} 
                              />
                            );
                          })()}
                        </TableCell>
                        <TableCell>{client.projectCount}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>{formatNumber(client.saleAmount)}</TableCell>
                        {client.monthlySales.map((amount: number, idx: number) => (
                          <TableCell key={idx} align="right">{formatNumber(amount)}</TableCell>
                        ))}
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                          {formatNumber(client.monthlySales.reduce((sum: number, val: number) => sum + val, 0))}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                          {formatNumber(client.monthlySales.reduce((sum: number, val: number) => sum + val, 0))}
                        </TableCell>
                      </TableRow>
                      
                      {/* Loose Furniture Cost Row */}
                      <TableRow key={`${client.client}-cost`} sx={{ bgcolor: clientIdx % 2 === 0 ? 'grey.50' : 'white' }}>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>Loose Furniture Cost</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>{formatNumber(client.salesCostAmount)}</TableCell>
                        {client.monthlyCosts.map((amount: number, idx: number) => (
                          <TableCell key={idx} align="right">{formatNumber(amount)}</TableCell>
                        ))}
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                          {formatNumber(client.monthlyCosts.reduce((sum: number, val: number) => sum + val, 0))}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                          {formatNumber(client.monthlyCosts.reduce((sum: number, val: number) => sum + val, 0))}
                        </TableCell>
                      </TableRow>
                      
                      {/* Project Profit Row */}
                      <TableRow key={`${client.client}-profit`} sx={{ bgcolor: clientIdx % 2 === 0 ? 'grey.50' : 'white' }}>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Project Profit</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{formatNumber(client.salesProfitAmount)}</TableCell>
                        {client.monthlyProfits.map((amount: number, idx: number) => (
                          <TableCell key={idx} align="right" sx={{ fontWeight: 700 }}>{formatNumber(amount)}</TableCell>
                        ))}
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {formatNumber(client.monthlyProfits.reduce((sum: number, val: number) => sum + val, 0))}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {formatNumber(client.monthlyProfits.reduce((sum: number, val: number) => sum + val, 0))}
                        </TableCell>
                      </TableRow>
                    </>
                  ))}
                  
                  {/* Grand Total Row */}
                  <TableRow sx={{ bgcolor: 'grey.200', '& .MuiTableCell-root': { fontWeight: 600, borderTop: 2, borderColor: 'grey.400' } }}>
                    <TableCell>Total</TableCell>
                    <TableCell></TableCell>
                    <TableCell>{grandTotals.projectCount}</TableCell>
                    <TableCell align="right">{formatNumber(grandTotals.saleAmount)}</TableCell>
                    {grandTotals.monthlySales.map((amount: number, idx: number) => (
                      <TableCell key={idx} align="right">{formatNumber(amount)}</TableCell>
                    ))}
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatNumber(grandTotals.monthlySales.reduce((sum: number, val: number) => sum + val, 0))}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatNumber(grandTotals.monthlySales.reduce((sum: number, val: number) => sum + val, 0))}
                    </TableCell>
                  </TableRow>
                  
                  {/* Grand Total Cost Row */}
                  <TableRow sx={{ bgcolor: 'grey.200', '& .MuiTableCell-root': { fontWeight: 600 } }}>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>Loose Furniture Cost</TableCell>
                    <TableCell align="right">{formatNumber(grandTotals.salesCostAmount)}</TableCell>
                    {grandTotals.monthlyCosts.map((amount: number, idx: number) => (
                      <TableCell key={idx} align="right">{formatNumber(amount)}</TableCell>
                    ))}
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatNumber(grandTotals.monthlyCosts.reduce((sum: number, val: number) => sum + val, 0))}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatNumber(grandTotals.monthlyCosts.reduce((sum: number, val: number) => sum + val, 0))}
                    </TableCell>
                  </TableRow>
                  
                  {/* Grand Total Profit Row */}
                  <TableRow sx={{ bgcolor: 'grey.300', '& .MuiTableCell-root': { fontWeight: 700, fontSize: '1rem' } }}>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>Project Profit</TableCell>
                    <TableCell align="right">{formatNumber(grandTotals.salesProfitAmount)}</TableCell>
                    {grandTotals.monthlyProfits.map((amount: number, idx: number) => (
                      <TableCell key={idx} align="right">{formatNumber(amount)}</TableCell>
                    ))}
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatNumber(grandTotals.monthlyProfits.reduce((sum: number, val: number) => sum + val, 0))}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatNumber(grandTotals.monthlyProfits.reduce((sum: number, val: number) => sum + val, 0))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

