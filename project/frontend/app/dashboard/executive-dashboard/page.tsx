'use client';

import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Button, TextField, MenuItem } from '@mui/material';
import { Info as InfoIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { predictiveApi, strapiApi } from '@/lib/api';
import KPICard from '@/components/KPICard';
import StackedAreaChart from '@/components/StackedAreaChart';
import RiskHeatmap from '@/components/RiskHeatmap';
import ScenarioToggle from '@/components/ScenarioToggle';
import PieChart from '@/components/PieChart';
import BarChart from '@/components/BarChart';
import LineChart from '@/components/LineChart';
import ExecutiveTabs from '../components/ExecutiveTabs';
import { motion } from 'framer-motion';

export default function ExecutiveDashboard() {
  const [forecast, setForecast] = useState<any>(null);
  const [riskHeatmap, setRiskHeatmap] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [constructionSales, setConstructionSales] = useState<any[]>([]);
  const [looseFurnitureSales, setLooseFurnitureSales] = useState<any[]>([]);
  const [interiorDesignSales, setInteriorDesignSales] = useState<any[]>([]);
  const [constructionBillings, setConstructionBillings] = useState<any[]>([]);
  const [looseFurnitureBillings, setLooseFurnitureBillings] = useState<any[]>([]);
  const [interiorDesignBillings, setInteriorDesignBillings] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scenario, setScenario] = useState('base');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [scenario, selectedMonth, selectedYear, selectedClient]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Don't filter by client on server-side - do it client-side instead
      // Only filter by month/year if needed (but we'll do client-side filtering for consistency)
      // This ensures we have all data available for client-side filtering

      const [forecastData, heatmapData, projectsData, clientsData, constructionSalesData, looseFurnitureSalesData, interiorDesignSalesData, constructionBillingsData, looseFurnitureBillingsData, interiorDesignBillingsData] = await Promise.all([
        predictiveApi.getScenarioForecast(scenario).catch((err) => {
          console.error('Error fetching forecast:', err);
          return null;
        }),
        predictiveApi.getRiskHeatmap().catch((err) => {
          console.error('Error fetching risk heatmap:', err);
          return null;
        }),
        strapiApi.getProjects().catch(() => ({ data: [] })),
        strapiApi.getClients().catch(() => ({ data: [] })),
        strapiApi.getConstructionSales().catch(() => ({ data: [] })),
        strapiApi.getLooseFurnitureSales().catch(() => ({ data: [] })),
        strapiApi.getInteriorDesignSales().catch(() => ({ data: [] })),
        strapiApi.getConstructionBillings().catch(() => ({ data: [] })),
        strapiApi.getLooseFurnitureBillings().catch(() => ({ data: [] })),
        strapiApi.getInteriorDesignBillings().catch(() => ({ data: [] })),
      ]);

      setForecast(forecastData);
      setRiskHeatmap(heatmapData);
      setProjects(projectsData?.data || []);
      setClients(clientsData?.data || []);
      setConstructionSales(constructionSalesData?.data || []);
      setLooseFurnitureSales(looseFurnitureSalesData?.data || []);
      setInteriorDesignSales(interiorDesignSalesData?.data || []);
      setConstructionBillings(constructionBillingsData?.data || []);
      setLooseFurnitureBillings(looseFurnitureBillingsData?.data || []);
      setInteriorDesignBillings(interiorDesignBillingsData?.data || []);
      
      // Debug logging for client filter
      if (selectedClient !== 'all') {
        console.log('Client filter active:', selectedClient);
        console.log('Construction Sales count:', constructionSalesData?.data?.length || 0);
        console.log('Construction Billings count:', constructionBillingsData?.data?.length || 0);
        console.log('Sample construction sale client:', constructionSalesData?.data?.[0]?.attributes?.client || constructionSalesData?.data?.[0]?.client);
        console.log('Sample construction billing customer:', constructionBillingsData?.data?.[0]?.attributes?.customer || constructionBillingsData?.data?.[0]?.customer);
      }

      // Debug logging
      if (forecastData) {
        console.log('Forecast data received:', forecastData);
        console.log('Forecast summary:', forecastData?.forecast?.summary);
      } else {
        console.warn('No forecast data received - check predictive service connection');
      }
      if (heatmapData) {
        console.log('Risk heatmap data received:', heatmapData);
        console.log('Risk heatmap summary:', heatmapData?.summary);
      } else {
        console.warn('No risk heatmap data received - check predictive service connection');
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError(err.message || 'Failed to load data');
        console.error('Error loading data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter sales data by month and year
  const filterSalesByDateAndClient = (sales: any[]) => {
    if (!sales || sales.length === 0) return [];
    
    return sales.filter((sale: any) => {
      const attrs = sale.attributes || sale;
      
      // Filter by client (check both client and customer fields, case-insensitive)
      if (selectedClient !== 'all') {
        const saleClient = (attrs.client || attrs.customer || '').toString().trim();
        const selectedClientTrimmed = selectedClient.toString().trim();
        
        // Skip if client field is empty and we're filtering
        if (!saleClient) {
          return false;
        }
        
        if (saleClient.toLowerCase() !== selectedClientTrimmed.toLowerCase()) {
          return false;
        }
      }

      // Filter by month and year if provided
      if (selectedMonth || selectedYear) {
        const saleDate = attrs.sale_date || attrs.date || attrs.createdAt;
        if (saleDate) {
          const date = new Date(saleDate);
          if (selectedMonth && date.getMonth() + 1 !== parseInt(selectedMonth)) {
            return false;
          }
          if (selectedYear && date.getFullYear() !== parseInt(selectedYear)) {
            return false;
          }
        } else {
          // If no date field and date filters are set, exclude
          if (selectedMonth || selectedYear) {
            return false;
          }
        }
      }

      return true;
    });
  };

  const filteredConstructionSales = useMemo(() => filterSalesByDateAndClient(constructionSales), [constructionSales, selectedClient, selectedMonth, selectedYear]);
  const filteredLooseFurnitureSales = useMemo(() => filterSalesByDateAndClient(looseFurnitureSales), [looseFurnitureSales, selectedClient, selectedMonth, selectedYear]);
  const filteredInteriorDesignSales = useMemo(() => filterSalesByDateAndClient(interiorDesignSales), [interiorDesignSales, selectedClient, selectedMonth, selectedYear]);

  // Filter billings data by month, year, and client
  const filterBillingsByDateAndClient = (billings: any[]) => {
    if (!billings || billings.length === 0) return [];
    
    return billings.filter((billing: any) => {
      const attrs = billing.attributes || billing;
      
      // Filter by client (check both customer and client fields, case-insensitive)
      if (selectedClient !== 'all') {
        const billingClient = (attrs.customer || attrs.client || '').toString().trim();
        const selectedClientTrimmed = selectedClient.toString().trim();
        
        // Skip if client field is empty and we're filtering
        if (!billingClient) {
          return false;
        }
        
        if (billingClient.toLowerCase() !== selectedClientTrimmed.toLowerCase()) {
          return false;
        }
      }

      // Filter by month and year if provided
      if (selectedMonth || selectedYear) {
        const billingDate = attrs.invoice_date || attrs.collected_date || attrs.date || attrs.createdAt;
        if (billingDate) {
          const date = new Date(billingDate);
          if (selectedMonth && date.getMonth() + 1 !== parseInt(selectedMonth)) {
            return false;
          }
          if (selectedYear && date.getFullYear() !== parseInt(selectedYear)) {
            return false;
          }
        } else {
          // If no date field and date filters are set, exclude
          if (selectedMonth || selectedYear) {
            return false;
          }
        }
      }

      return true;
    });
  };

  const filteredConstructionBillings = useMemo(() => filterBillingsByDateAndClient(constructionBillings), [constructionBillings, selectedClient, selectedMonth, selectedYear]);
  const filteredLooseFurnitureBillings = useMemo(() => filterBillingsByDateAndClient(looseFurnitureBillings), [looseFurnitureBillings, selectedClient, selectedMonth, selectedYear]);
  const filteredInteriorDesignBillings = useMemo(() => filterBillingsByDateAndClient(interiorDesignBillings), [interiorDesignBillings, selectedClient, selectedMonth, selectedYear]);

  const filteredSales = useMemo(() => {
    return [
      ...filteredConstructionSales,
      ...filteredLooseFurnitureSales,
      ...filteredInteriorDesignSales,
    ];
  }, [filteredConstructionSales, filteredLooseFurnitureSales, filteredInteriorDesignSales]);

  // Extract unique clients from actual sales and billings data
  const uniqueClients = useMemo(() => {
    const clientSet = new Set<string>();
    
    // Extract from sales
    constructionSales.forEach((sale: any) => {
      const attrs = sale.attributes || sale;
      const client = attrs.client || attrs.customer;
      if (client && typeof client === 'string') {
        clientSet.add(client);
      }
    });
    looseFurnitureSales.forEach((sale: any) => {
      const attrs = sale.attributes || sale;
      const client = attrs.client || attrs.customer;
      if (client && typeof client === 'string') {
        clientSet.add(client);
      }
    });
    interiorDesignSales.forEach((sale: any) => {
      const attrs = sale.attributes || sale;
      const client = attrs.client || attrs.customer;
      if (client && typeof client === 'string') {
        clientSet.add(client);
      }
    });
    
    // Extract from billings
    constructionBillings.forEach((billing: any) => {
      const attrs = billing.attributes || billing;
      const client = attrs.customer || attrs.client;
      if (client && typeof client === 'string') {
        clientSet.add(client);
      }
    });
    looseFurnitureBillings.forEach((billing: any) => {
      const attrs = billing.attributes || billing;
      const client = attrs.customer || attrs.client;
      if (client && typeof client === 'string') {
        clientSet.add(client);
      }
    });
    interiorDesignBillings.forEach((billing: any) => {
      const attrs = billing.attributes || billing;
      const client = attrs.customer || attrs.client;
      if (client && typeof client === 'string') {
        clientSet.add(client);
      }
    });
    
    // Also add clients from the clients API
    clients.forEach((client: any) => {
      const attrs = client.attributes || client;
      const clientName = attrs.name || attrs.client_id;
      if (clientName && typeof clientName === 'string') {
        clientSet.add(clientName);
      }
    });
    
    return Array.from(clientSet).sort();
  }, [constructionSales, looseFurnitureSales, interiorDesignSales, constructionBillings, looseFurnitureBillings, interiorDesignBillings, clients]);

  // Process data for pie chart 1: Amount per project (Top 10)
  // When filtered by client: shows billing cycles (months) for that client
  const projectAmounts = useMemo(() => {
    // If filtered by client, show billing cycles (months)
    if (selectedClient !== 'all') {
      const allFilteredBillings = [
        ...filteredConstructionBillings,
        ...filteredLooseFurnitureBillings,
        ...filteredInteriorDesignBillings,
      ];

      // Group billings by month (billing cycles)
      const monthlyBillingMap = new Map<string, number>();

      allFilteredBillings.forEach((billing: any) => {
        const attrs = billing.attributes || billing;
        const billingDate = attrs.invoice_date || attrs.collected_date || attrs.date || attrs.createdAt;
        if (billingDate) {
          const date = new Date(billingDate);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          const amount = parseFloat(attrs.amount || 0);
          
          if (amount > 0) {
            monthlyBillingMap.set(monthLabel, (monthlyBillingMap.get(monthLabel) || 0) + amount);
          }
        }
      });

      // Convert to array and sort by month (chronologically)
      return Array.from(monthlyBillingMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => {
          // Sort by date
          const dateA = new Date(a.name);
          const dateB = new Date(b.name);
          return dateA.getTime() - dateB.getTime();
        });
    }

    // Default: Group by client (which represents projects) from sales
    const projectMap = new Map<string, number>();

    filteredSales.forEach((sale: any) => {
      const attrs = sale.attributes || sale;
      const client = attrs.client || 'Unknown';
      const amount = parseFloat(attrs.sale_amount || 0);
      
      if (amount > 0) {
        projectMap.set(client, (projectMap.get(client) || 0) + amount);
      }
    });

    // Convert to array and sort by amount (descending)
    return Array.from(projectMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 projects
  }, [filteredSales, selectedClient, filteredConstructionBillings, filteredLooseFurnitureBillings, filteredInteriorDesignBillings]);

  // Process data for bar chart: All projects comparison
  const allProjectsBarData = useMemo(() => {
    // If a client is selected, show billing months instead of projects
    if (selectedClient !== 'all') {
      const allFilteredBillings = [
        ...filteredConstructionBillings,
        ...filteredLooseFurnitureBillings,
        ...filteredInteriorDesignBillings,
      ];
      
      // Group billings by month (only billings, not sales)
      const monthlyRevenue = new Map<string, number>();
      
      allFilteredBillings.forEach((billing: any) => {
        const attrs = billing.attributes || billing;
        // Use invoice_date or collected_date for billing month grouping
        const billingDate = attrs.invoice_date || attrs.collected_date || attrs.date || attrs.createdAt;
        if (billingDate) {
          const date = new Date(billingDate);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const amount = parseFloat(attrs.amount || 0);
          
          if (amount > 0) {
            monthlyRevenue.set(monthKey, (monthlyRevenue.get(monthKey) || 0) + amount);
          }
        }
      });
      
      // Convert to array and sort by month (chronologically)
      const result = Array.from(monthlyRevenue.entries())
        .map(([monthKey, value]) => {
          const [year, month] = monthKey.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1, 1);
          return {
            name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            'Revenue': value,
            sortKey: monthKey,
          };
        })
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .map(({ sortKey, ...rest }) => rest);
      
      // Always return the result, even if empty (so the chart can show empty state)
      return result;
    }
    
    // Default: Group by client (which represents projects)
    const projectMap = new Map<string, number>();

    filteredSales.forEach((sale: any) => {
      const attrs = sale.attributes || sale;
      const client = attrs.client || 'Unknown';
      const amount = parseFloat(attrs.sale_amount || 0);
      
      if (amount > 0) {
        projectMap.set(client, (projectMap.get(client) || 0) + amount);
      }
    });

    // Convert to array and sort by amount (descending)
    return Array.from(projectMap.entries())
      .map(([name, value]) => ({ 
        name: name.length > 20 ? name.substring(0, 20) + '...' : name, // Truncate long names
        'Revenue': value 
      }))
      .sort((a, b) => b.Revenue - a.Revenue);
  }, [filteredSales, selectedClient, filteredConstructionBillings, filteredLooseFurnitureBillings, filteredInteriorDesignBillings]);

  // Process data for pie chart 2: Amount per business branch
  // When no client filter: shows sales totals (original behavior)
  // When filtered by client: shows revenue (total billings - total sales) by client
  const branchAmounts = useMemo(() => {
    // If filtered by client, show revenue (billings - sales) by client
    if (selectedClient !== 'all') {
      // Use unfiltered data to get all clients and calculate revenue for each
      const clientRevenue = new Map<string, { sales: number; billings: number }>();

      // Calculate total sales per client (from all unfiltered sales)
      [
        ...constructionSales,
        ...looseFurnitureSales,
        ...interiorDesignSales,
      ].forEach((sale: any) => {
        const attrs = sale.attributes || sale;
        const client = (attrs.client || attrs.customer || 'Unknown').toString().trim();
        const amount = parseFloat(attrs.sale_amount || 0);
        
        if (client && amount > 0) {
          const existing = clientRevenue.get(client) || { sales: 0, billings: 0 };
          clientRevenue.set(client, { ...existing, sales: existing.sales + amount });
        }
      });

      // Calculate total billings per client (from all unfiltered billings)
      [
        ...constructionBillings,
        ...looseFurnitureBillings,
        ...interiorDesignBillings,
      ].forEach((billing: any) => {
        const attrs = billing.attributes || billing;
        const client = (attrs.customer || attrs.client || 'Unknown').toString().trim();
        const amount = parseFloat(attrs.amount || 0);
        
        if (client && amount > 0) {
          const existing = clientRevenue.get(client) || { sales: 0, billings: 0 };
          clientRevenue.set(client, { ...existing, billings: existing.billings + amount });
        }
      });

      // Calculate revenue (billings - sales) for each client
      return Array.from(clientRevenue.entries())
        .map(([clientName, totals]) => {
          const revenue = totals.billings - totals.sales; // Revenue = Billings - Sales
          return {
            name: revenue < 0 ? `${clientName} (Loss)` : clientName,
            value: Math.abs(revenue), // Use absolute value for slice size
            actualValue: revenue // Store actual value (can be negative) for display
          };
        })
        .filter(item => item.value > 0) // Only show clients with non-zero revenue
        .sort((a, b) => b.value - a.value); // Sort by revenue (descending)
    }

    // Default: Calculate total sales by branch (original behavior)
    const constructionSalesTotal = filteredConstructionSales.reduce((sum: number, sale: any) => {
      const attrs = sale.attributes || sale;
      return sum + parseFloat(attrs.sale_amount || 0);
    }, 0);

    const looseFurnitureSalesTotal = filteredLooseFurnitureSales.reduce((sum: number, sale: any) => {
      const attrs = sale.attributes || sale;
      return sum + parseFloat(attrs.sale_amount || 0);
    }, 0);

    const interiorDesignSalesTotal = filteredInteriorDesignSales.reduce((sum: number, sale: any) => {
      const attrs = sale.attributes || sale;
      return sum + parseFloat(attrs.sale_amount || 0);
    }, 0);

    return [
      { name: 'Construction', value: constructionSalesTotal },
      { name: 'Loose Furniture', value: looseFurnitureSalesTotal },
      { name: 'Interior Design', value: interiorDesignSalesTotal },
    ].filter(item => item.value > 0);
  }, [filteredConstructionSales, filteredLooseFurnitureSales, filteredInteriorDesignSales, filteredConstructionBillings, filteredLooseFurnitureBillings, filteredInteriorDesignBillings, selectedClient, constructionSales, looseFurnitureSales, interiorDesignSales, constructionBillings, looseFurnitureBillings, interiorDesignBillings]);

  // Filter projects based on selected filters
  const filteredProjects = useMemo(() => {
    return projects.filter((project: any) => {
      const attrs = project.attributes || project;
      
      // Filter by client if selected
      if (selectedClient !== 'all') {
        const projectClient = attrs.client?.attributes?.name || attrs.client || attrs.name;
        if (projectClient !== selectedClient) {
          return false;
        }
      }
      
      // Filter by month and year if provided
      if (selectedMonth || selectedYear) {
        const projectDate = attrs.createdAt || attrs.start_date || attrs.date;
        if (projectDate) {
          const date = new Date(projectDate);
          if (selectedMonth && date.getMonth() + 1 !== parseInt(selectedMonth)) {
            return false;
          }
          if (selectedYear && date.getFullYear() !== parseInt(selectedYear)) {
            return false;
          }
        } else {
          // If no date field and filters are set, exclude project
          if (selectedMonth || selectedYear) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [projects, selectedClient, selectedMonth, selectedYear]);

  // Process data for bar chart: Projects over time
  const projectsOverTime = useMemo(() => {
    // If filtered by client, show billing cycles by month
    if (selectedClient !== 'all') {
      const monthlyBillings = new Map<string, { count: number; totalValue: number }>();
      
      const allFilteredBillings = [
        ...filteredConstructionBillings,
        ...filteredLooseFurnitureBillings,
        ...filteredInteriorDesignBillings,
      ];

      allFilteredBillings.forEach((billing: any) => {
        const attrs = billing.attributes || billing;
        const billingDate = attrs.invoice_date || attrs.collected_date || attrs.date || attrs.createdAt;
        
        if (billingDate) {
          const date = new Date(billingDate);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const amount = parseFloat(attrs.amount || 0);
          
          if (amount > 0) {
            const existing = monthlyBillings.get(monthKey) || { count: 0, totalValue: 0 };
            monthlyBillings.set(monthKey, {
              count: existing.count + 1,
              totalValue: existing.totalValue + amount,
            });
          }
        }
      });

      // Convert to array and sort by month
      return Array.from(monthlyBillings.entries())
        .map(([monthKey, data]) => {
          const [year, month] = monthKey.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1, 1);
          return {
            name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            'Billing Count': data.count,
            'Total Value': data.totalValue,
            sortKey: monthKey,
          };
        })
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .map(({ sortKey, ...rest }) => rest);
    }

    // If month/year filter is selected, show daily breakdown instead of monthly
    if (selectedMonth && selectedYear) {
      const dailyProjects = new Map<number, { count: number; totalValue: number }>();
      
      filteredProjects.forEach((project: any) => {
        const attrs = project.attributes || project;
        const projectDate = attrs.createdAt || attrs.start_date || attrs.date;
        
        if (projectDate) {
          const date = new Date(projectDate);
          const day = date.getDate();
          
          // Get project value from associated sales
          let projectValue = 0;
          const projectName = attrs.name || attrs.project_id || 'Unknown';
          
          // Find sales for this project/client
          filteredSales.forEach((sale: any) => {
            const saleAttrs = sale.attributes || sale;
            // Match by client name or project name
            if (saleAttrs.client === projectName || saleAttrs.client === attrs.client?.attributes?.name) {
              projectValue += parseFloat(saleAttrs.sale_amount || 0);
            }
          });

          const existing = dailyProjects.get(day) || { count: 0, totalValue: 0 };
          dailyProjects.set(day, {
            count: existing.count + 1,
            totalValue: existing.totalValue + projectValue,
          });
        }
      });

      // Convert to array and sort by day
      return Array.from(dailyProjects.entries())
        .map(([day, data]) => ({
          name: `Day ${day}`,
          'Project Count': data.count,
          'Total Value': data.totalValue,
          sortKey: day,
        }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(({ sortKey, ...rest }) => rest);
    }
    
    // Default: Group projects by month based on creation date
    const monthlyProjects = new Map<string, { count: number; totalValue: number }>();
    
    filteredProjects.forEach((project: any) => {
      const attrs = project.attributes || project;
      const createdAt = attrs.createdAt || project.createdAt;
      
      if (createdAt) {
        const date = new Date(createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Get project value from associated sales
        let projectValue = 0;
        const projectName = attrs.name || attrs.project_id || 'Unknown';
        
        // Find sales for this project/client
        filteredSales.forEach((sale: any) => {
          const saleAttrs = sale.attributes || sale;
          // Match by client name or project name
          if (saleAttrs.client === projectName || saleAttrs.client === attrs.client?.attributes?.name) {
            projectValue += parseFloat(saleAttrs.sale_amount || 0);
          }
        });

        const existing = monthlyProjects.get(monthKey) || { count: 0, totalValue: 0 };
        monthlyProjects.set(monthKey, {
          count: existing.count + 1,
          totalValue: existing.totalValue + projectValue,
        });
      }
    });

    // Convert to array and sort by month
    return Array.from(monthlyProjects.entries())
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return {
          name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          'Project Count': data.count,
          'Total Value': data.totalValue,
          sortKey: monthKey, // For sorting
        };
      })
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ sortKey, ...rest }) => rest); // Remove sortKey from final data
  }, [filteredProjects, filteredSales, selectedMonth, selectedYear, selectedClient, filteredConstructionBillings, filteredLooseFurnitureBillings, filteredInteriorDesignBillings]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate operational metrics from actual data
  const operationalMetrics = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    // Combine all sales data (already filtered by client if selected)
    const allSales = [
      ...filteredConstructionSales,
      ...filteredLooseFurnitureSales,
      ...filteredInteriorDesignSales,
    ];

    // Combine all filtered billings data (already filtered by client if selected)
    const allBillings = [
      ...filteredConstructionBillings,
      ...filteredLooseFurnitureBillings,
      ...filteredInteriorDesignBillings,
    ];

    // When filtering by client, show all-time data for that client
    // Otherwise, show YTD data for all clients
    const isClientFiltered = selectedClient !== 'all';

    // Calculate sales metrics
    const totalSalesYTD = allSales.reduce((sum, sale) => {
      const attrs = sale.attributes || sale;
      const saleDate = attrs.sale_date ? new Date(attrs.sale_date) : null;
      // If client is filtered, include all sales; otherwise only YTD
      if (isClientFiltered || (saleDate && saleDate.getFullYear() === currentYear)) {
        return sum + parseFloat(attrs.sale_amount || 0);
      }
      return sum;
    }, 0);

    const totalProfitYTD = allSales.reduce((sum, sale) => {
      const attrs = sale.attributes || sale;
      const saleDate = attrs.sale_date ? new Date(attrs.sale_date) : null;
      // If client is filtered, include all sales; otherwise only YTD
      if (isClientFiltered || (saleDate && saleDate.getFullYear() === currentYear)) {
        return sum + parseFloat(attrs.project_profit || (attrs.sale_amount || 0) - (attrs.construction_cost || 0));
      }
      return sum;
    }, 0);

    // Calculate billings metrics
    const billedYTD = allBillings.reduce((sum, billing) => {
      const attrs = billing.attributes || billing;
      const invoiceDate = attrs.invoice_date ? new Date(attrs.invoice_date) : null;
      // If client is filtered, include all billings; otherwise only YTD
      if (isClientFiltered || (invoiceDate && invoiceDate.getFullYear() === currentYear)) {
        return sum + parseFloat(attrs.amount || 0);
      }
      return sum;
    }, 0);

    const collectedYTD = allBillings.reduce((sum, billing) => {
      const attrs = billing.attributes || billing;
      const collectedDate = attrs.collected_date ? new Date(attrs.collected_date) : null;
      // If client is filtered, include all billings; otherwise only YTD
      if (isClientFiltered || (collectedDate && collectedDate.getFullYear() === currentYear)) {
        return sum + parseFloat(attrs.amount || 0);
      }
      return sum;
    }, 0);

    const outstandingAR = allBillings.reduce((sum, billing) => {
      const attrs = billing.attributes || billing;
      if (attrs.status === 'sent' || attrs.status === 'overdue') {
        return sum + parseFloat(attrs.amount || 0);
      }
      return sum;
    }, 0);

    // Calculate project metrics (use filtered projects)
    const activeProjects = filteredProjects.filter((project: any) => {
      const attrs = project.attributes || project;
      return attrs.status === 'active';
    }).length;

    const completedProjectsYTD = filteredProjects.filter((project: any) => {
      const attrs = project.attributes || project;
      if (attrs.status === 'completed' && attrs.end_date) {
        const endDate = new Date(attrs.end_date);
        return endDate.getFullYear() === currentYear;
      }
      return false;
    }).length;

    return {
      totalSalesYTD,
      totalProfitYTD,
      billedYTD,
      collectedYTD,
      outstandingAR,
      activeProjects,
      completedProjectsYTD,
    };
  }, [filteredConstructionSales, filteredLooseFurnitureSales, filteredInteriorDesignSales, filteredConstructionBillings, filteredLooseFurnitureBillings, filteredInteriorDesignBillings, filteredProjects, selectedClient]);

  // Extract forecast summary - handle different response structures
  const summary = forecast?.forecast?.summary || forecast?.summary || {};
  const forecastMonthlyTotals = forecast?.forecast?.monthly_totals || forecast?.monthly_totals || [];
  const heatmapData = riskHeatmap?.heatmap?.matrix || riskHeatmap?.matrix || [];
  const heatmapStages = riskHeatmap?.heatmap?.stages || riskHeatmap?.stages || [];
  const heatmapBuckets = riskHeatmap?.heatmap?.probability_buckets || riskHeatmap?.probability_buckets || [];
  
  // Revenue by cost trend when filtered by client
  // Shows revenue (amount) and cost (construction_cost) as separate trend lines
  // Uses recognition_month from billing data for proper month grouping
  const revenueByCostTrend = useMemo(() => {
    if (selectedClient === 'all') return [];
    
    const monthlyData = new Map<string, { revenue: number; cost: number }>();
    
    // Use unfiltered billings data and filter by client manually to ensure we get all data
    const allBillings = [
      ...constructionBillings,
      ...looseFurnitureBillings,
      ...interiorDesignBillings,
    ];
    
    // Filter by client and group revenue and cost by month from billing data
    allBillings.forEach((billing: any) => {
      const attrs = billing.attributes || billing;
      
      // Filter by client
      const billingClient = (attrs.customer || attrs.client || '').toString().trim();
      const selectedClientTrimmed = selectedClient.toString().trim();
      
      if (!billingClient || billingClient.toLowerCase() !== selectedClientTrimmed.toLowerCase()) {
        return; // Skip if client doesn't match
      }
      
      // Use recognition_month if available (preferred for billing cycles)
      // Otherwise fallback to invoice_date, collected_date, or createdAt
      let monthLabel: string | null = null;
      
      if (attrs.recognition_month) {
        // recognition_month format might be "YYYY-MM" or a date string
        try {
          const recMonth = attrs.recognition_month;
          let date: Date;
          
          if (typeof recMonth === 'string' && recMonth.match(/^\d{4}-\d{2}/)) {
            // Format: "YYYY-MM"
            const [year, month] = recMonth.split('-');
            date = new Date(parseInt(year), parseInt(month) - 1, 1);
          } else {
            // Try parsing as date string
            date = new Date(recMonth);
          }
          
          if (!isNaN(date.getTime())) {
            monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          }
        } catch (e) {
          console.warn('Error parsing recognition_month:', attrs.recognition_month, e);
        }
      }
      
      // Fallback to other date fields if recognition_month not available or invalid
      if (!monthLabel) {
        const billingDate = attrs.invoice_date || attrs.collected_date || attrs.date || attrs.createdAt;
        if (billingDate) {
          try {
            const date = new Date(billingDate);
            if (!isNaN(date.getTime())) {
              monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }
          } catch (e) {
            console.warn('Error parsing billing date:', billingDate, e);
          }
        }
      }
      
      if (monthLabel) {
        // Get revenue (amount) and cost (construction_cost) from billing data
        const revenue = parseFloat(attrs.amount || '0') || 0;
        const cost = parseFloat(attrs.construction_cost || '0') || 0;
        
        // Only add if we have valid data
        if (revenue > 0 || cost > 0) {
          const existing = monthlyData.get(monthLabel) || { revenue: 0, cost: 0 };
          monthlyData.set(monthLabel, {
            revenue: existing.revenue + revenue,
            cost: existing.cost + cost,
          });
        }
      }
    });

    // Convert to array format for LineChart
    // Add difference field for area fill (stacked on top of Cost)
    return Array.from(monthlyData.entries())
      .map(([monthLabel, data]) => ({
        name: monthLabel,
        'Revenue': data.revenue,
        'Cost': data.cost,
        'Revenue_diff': data.revenue - data.cost, // Difference for area fill (stacked on Cost)
        'Difference': data.revenue - data.cost, // For tooltip display
      }))
      .sort((a, b) => {
        // Sort by date
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA.getTime() - dateB.getTime();
      });
  }, [selectedClient, constructionBillings, looseFurnitureBillings, interiorDesignBillings]);

  // Combine operational revenue data with forecast data for Revenue Outlook chart
  const revenueOutlookData = useMemo(() => {
    // If a month is selected, show breakdown by project and billing date
    if (selectedMonth && selectedYear) {
      const allFilteredBillings = [
        ...filteredConstructionBillings,
        ...filteredLooseFurnitureBillings,
        ...filteredInteriorDesignBillings,
      ];
      
      // Group by project (client)
      const revenueByProject = new Map<string, number>();
      // Group by billing date (day)
      const revenueByBillingDate = new Map<number, number>();
      let totalRevenue = 0;
      
      const selectedMonthNum = parseInt(selectedMonth);
      const selectedYearNum = parseInt(selectedYear);
      
      // Process billings data
      allFilteredBillings.forEach((billing: any) => {
        const attrs = billing.attributes || billing;
        const billingDate = attrs.collected_date || attrs.invoice_date || attrs.date || attrs.createdAt;
        if (billingDate) {
          const date = new Date(billingDate);
          // Verify the date matches the selected month and year
          if (date.getMonth() + 1 === selectedMonthNum && date.getFullYear() === selectedYearNum) {
            const day = date.getDate();
            const amount = parseFloat(attrs.amount || 0);
            
            if (amount > 0) {
              totalRevenue += amount;
              
            // Group by project/client
            const client = (attrs.customer || attrs.client || 'Unknown').toString().trim();
            revenueByProject.set(client, (revenueByProject.get(client) || 0) + amount);
              
              // Group by billing date (day)
              revenueByBillingDate.set(day, (revenueByBillingDate.get(day) || 0) + amount);
            }
          }
        }
      });
      
      // Process sales data for the selected month
      filteredSales.forEach((sale: any) => {
        const attrs = sale.attributes || sale;
        const saleDate = attrs.sale_date || attrs.date || attrs.createdAt;
        if (saleDate) {
          const date = new Date(saleDate);
          // Verify the date matches the selected month and year
          if (date.getMonth() + 1 === selectedMonthNum && date.getFullYear() === selectedYearNum) {
            const amount = parseFloat(attrs.sale_amount || 0);
            
            if (amount > 0) {
              totalRevenue += amount;
              
            // Group by project/client (normalize to handle case differences)
            const client = (attrs.client || attrs.customer || 'Unknown').toString().trim();
            revenueByProject.set(client, (revenueByProject.get(client) || 0) + amount);
            }
          }
        }
      });
      
      // Create data structure for chart showing: Total, By Project, By Billing Date
      const chartData: Array<{ 
        name: string; 
        'Total Revenue': number;
        'By Project': number;
        'By Billing Date': number;
      }> = [];
      
      // Get top projects
      const projectsArray = Array.from(revenueByProject.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      
      // Get billing dates sorted by day
      const datesArray = Array.from(revenueByBillingDate.entries())
        .map(([day, value]) => ({ day, value }))
        .sort((a, b) => a.day - b.day);
      
      // Always include Total Revenue entry, even if 0
      chartData.push({
        name: 'Total Revenue',
        'Total Revenue': totalRevenue,
        'By Project': 0,
        'By Billing Date': 0,
      });
      
      // Add revenue by project (all projects, but limit display to top 15)
      const topProjects = projectsArray.slice(0, 15);
      topProjects.forEach((project) => {
        if (project.value > 0) {
          chartData.push({
            name: project.name.length > 25 ? project.name.substring(0, 25) + '...' : project.name,
            'Total Revenue': 0,
            'By Project': project.value,
            'By Billing Date': 0,
          });
        }
      });
      
      // Add revenue by billing date (all days with revenue)
      datesArray.forEach((dateItem) => {
        if (dateItem.value > 0) {
          chartData.push({
            name: `Day ${dateItem.day}`,
            'Total Revenue': 0,
            'By Project': 0,
            'By Billing Date': dateItem.value,
          });
        }
      });
      
      // Always return at least the Total Revenue entry
      return chartData.map((item) => ({
        month: item.name,
        actual: item['Total Revenue'] || item['By Project'] || item['By Billing Date'],
        confirmed: 0,
        tentative: 0,
        total: item['Total Revenue'] || item['By Project'] || item['By Billing Date'],
        byProject: item['By Project'],
        byBillingDate: item['By Billing Date'],
      }));
    }
    
    // Default behavior: Calculate actual revenue by month from sales and billings
    const actualRevenueByMonth = new Map<string, { actual: number }>();
    
    // Process sales data
    filteredSales.forEach((sale: any) => {
      const attrs = sale.attributes || sale;
      const saleDate = attrs.sale_date || attrs.date || attrs.createdAt;
      if (saleDate) {
        const date = new Date(saleDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const amount = parseFloat(attrs.sale_amount || 0);
        
        const existing = actualRevenueByMonth.get(monthKey) || { actual: 0 };
        actualRevenueByMonth.set(monthKey, {
          actual: existing.actual + amount,
        });
      }
    });
    
    // Process billings data (collected revenue)
    const allFilteredBillings = [
      ...filteredConstructionBillings,
      ...filteredLooseFurnitureBillings,
      ...filteredInteriorDesignBillings,
    ];
    
    allFilteredBillings.forEach((billing: any) => {
      const attrs = billing.attributes || billing;
      const collectedDate = attrs.collected_date || attrs.invoice_date || attrs.date || attrs.createdAt;
      if (collectedDate) {
        const date = new Date(collectedDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const amount = parseFloat(attrs.amount || 0);
        
        const existing = actualRevenueByMonth.get(monthKey) || { actual: 0 };
        actualRevenueByMonth.set(monthKey, {
          actual: existing.actual + amount,
        });
      }
    });
    
    // Combine with forecast data
    const combinedData = new Map<string, { month: string; actual: number; confirmed: number; tentative: number; total: number }>();
    
    // Add forecast data
    forecastMonthlyTotals.forEach((forecastItem: any) => {
      const monthStr = forecastItem.month || '';
      const monthKey = monthStr.substring(0, 7); // Extract YYYY-MM from ISO date
      
      combinedData.set(monthKey, {
        month: monthStr,
        actual: 0,
        confirmed: forecastItem.confirmed || 0,
        tentative: forecastItem.tentative || 0,
        total: forecastItem.total || 0,
      });
    });
    
    // Add actual revenue data
    actualRevenueByMonth.forEach((value, monthKey) => {
      const existing = combinedData.get(monthKey);
      if (existing) {
        existing.actual = value.actual;
      } else {
        // Create entry for months with actual data but no forecast
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        combinedData.set(monthKey, {
          month: date.toISOString(),
          actual: value.actual,
          confirmed: 0,
          tentative: 0,
          total: 0,
        });
      }
    });
    
    // Convert to array and sort by month
    return Array.from(combinedData.values())
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .map((item) => ({
        month: item.month,
        actual: item.actual,
        confirmed: item.confirmed,
        tentative: item.tentative,
        total: item.total + item.actual, // Total includes both forecast and actual
      }));
  }, [selectedMonth, selectedYear, forecastMonthlyTotals, filteredSales, filteredConstructionBillings, filteredLooseFurnitureBillings, filteredInteriorDesignBillings]);
  
  // Debug: Log the extracted values
  if (forecast) {
    console.log('Extracted summary:', summary);
    console.log('Total confirmed:', summary.total_confirmed);
    console.log('Total tentative:', summary.total_tentative);
    console.log('Total forecast:', summary.total_forecast);
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading executive dashboard...
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
              Executive Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive executive view with charts and analytics
            </Typography>
          </Box>
          <ScenarioToggle selectedScenario={scenario} onScenarioChange={setScenario} />
        </Box>
      </motion.div>

      {/* Sub Navigation Tabs */}
      <ExecutiveTabs />

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
                sx={{ minWidth: 150 }}
                size="small"
                variant="outlined"
              >
                <MenuItem value="">
                  <em>All Months</em>
                </MenuItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <MenuItem key={month} value={month.toString()}>
                    {new Date(2000, month - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                sx={{ minWidth: 120 }}
                size="small"
                variant="outlined"
              >
                <MenuItem value="">
                  <em>All Years</em>
                </MenuItem>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
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
                {uniqueClients.map((clientName: string) => (
                  <MenuItem key={clientName} value={clientName}>
                    {clientName}
                  </MenuItem>
                ))}
              </TextField>

              {(selectedMonth || selectedYear || selectedClient !== 'all') && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedMonth('');
                    setSelectedYear('');
                    setSelectedClient('all');
                  }}
                  sx={{ textTransform: 'none', ml: 'auto' }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPI Cards - Operational Metrics */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 400, mb: 2, color: 'text.primary' }}>
          Operational Metrics
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Actual performance data from sales and billings
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <KPICard
          title={selectedClient !== 'all' ? `Total Sales${selectedMonth && selectedYear ? ` (${new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})` : ''}` : "Total Sales YTD"}
          value={formatCurrency(operationalMetrics.totalSalesYTD)}
          subtitle={selectedClient !== 'all' ? `Sales revenue${selectedMonth && selectedYear ? ' for selected period' : ' (all-time)'}` : "Year-to-date sales revenue"}
          delay={0.1}
        />
        <KPICard
          title={selectedClient !== 'all' ? `Collected${selectedMonth && selectedYear ? ` (${new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})` : ''}` : "Collected YTD"}
          value={formatCurrency(operationalMetrics.collectedYTD)}
          subtitle={selectedClient !== 'all' ? `Cash collected${selectedMonth && selectedYear ? ' for selected period' : ' (all-time)'}` : "Year-to-date cash collected"}
          delay={0.2}
        />
        <KPICard
          title={selectedClient !== 'all' ? `Total Profit${selectedMonth && selectedYear ? ` (${new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})` : ''}` : "Total Profit YTD"}
          value={formatCurrency(operationalMetrics.totalProfitYTD)}
          subtitle={selectedClient !== 'all' ? `Profit${selectedMonth && selectedYear ? ' for selected period' : ' (all-time)'}` : "Year-to-date profit"}
          delay={0.3}
        />
        <KPICard
          title="Outstanding AR"
          value={formatCurrency(operationalMetrics.outstandingAR)}
          subtitle={selectedClient !== 'all' ? `Accounts receivable for ${selectedClient}` : "Accounts receivable"}
          delay={0.4}
        />
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        {selectedClient !== 'all' ? (
          // When filtered by client, show revenue by cost trend line graph
          revenueByCostTrend.length > 0 ? (
            <LineChart
              data={revenueByCostTrend}
              title={`Revenue by Cost Trend - ${selectedClient}${selectedMonth && selectedYear ? ` (${new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})` : ''}`}
              dataKeys={[
                { key: 'Revenue', name: 'Amount', color: '#10b981' },
                { key: 'Cost', name: 'Construction Cost', color: '#ef4444' },
              ]}
              showDifferenceFill={true}
            />
          ) : (
            <Card sx={{ borderRadius: 3, p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 400 }}>
                Revenue by Cost Trend - {selectedClient}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No revenue or cost data available for the selected client.
              </Typography>
            </Card>
          )
        ) : selectedMonth && selectedYear ? (
          revenueOutlookData.length > 0 ? (
            <BarChart
              data={revenueOutlookData.map((item: any) => {
                // Determine which value to show based on the item type
                const isTotal = item.month === 'Total Revenue';
                const isProject = item.byProject && item.byProject > 0;
                const isBillingDate = item.byBillingDate && item.byBillingDate > 0;
                
                return {
                  name: item.month,
                  'Total Revenue': isTotal ? (item.actual || item.total || 0) : 0,
                  'By Project': isProject ? (item.byProject || 0) : 0,
                  'By Billing Date': isBillingDate ? (item.byBillingDate || 0) : 0,
                };
              })}
              title={`Revenue Outlook - ${new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
              dataKeys={[
                { key: 'Total Revenue', name: 'Total Revenue', color: '#3b82f6' },
                { key: 'By Project', name: 'By Project', color: '#10b981' },
                { key: 'By Billing Date', name: 'By Billing Date', color: '#f59e0b' },
              ]}
            />
          ) : (
            <Card sx={{ borderRadius: 3, p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 400 }}>
                Revenue Outlook - {new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No revenue data available for the selected month.
              </Typography>
            </Card>
          )
        ) : (
          <StackedAreaChart
            data={revenueOutlookData}
            title="Revenue Outlook"
          />
        )}
        {selectedClient !== 'all' ? (
          allProjectsBarData.length > 0 ? (
            <BarChart
              data={allProjectsBarData}
              title={`Billing Months Revenue - ${selectedClient}${selectedMonth || selectedYear ? ` (Filtered)` : ''}`}
              dataKeys={[
                { key: 'Revenue', name: 'Revenue', color: '#3b82f6' },
              ]}
            />
          ) : (
            <Card sx={{ borderRadius: 3, p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 400 }}>
                Billing Months Revenue - {selectedClient}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No billing data available for the selected client.
              </Typography>
            </Card>
          )
        ) : allProjectsBarData.length > 0 ? (
          <BarChart
            data={allProjectsBarData}
            title={`All Projects Revenue Comparison${selectedMonth || selectedYear ? ` (Filtered)` : ''}`}
            dataKeys={[
              { key: 'Revenue', name: 'Revenue', color: '#3b82f6' },
            ]}
          />
        ) : null}
      </Box>

      {/* Project Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        {projectAmounts.length > 0 && (
          <PieChart
            data={projectAmounts}
            title={selectedClient !== 'all' 
              ? `Revenue by Project Billing Cycles - ${selectedClient}${selectedMonth && selectedYear ? ` (${new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})` : ''}` 
              : `Revenue by Project (Top 10)${selectedMonth || selectedYear ? ` (Filtered)` : ''}`}
          />
        )}
        {branchAmounts.length > 0 && (
          <PieChart
            data={branchAmounts}
            title={selectedClient !== 'all' 
              ? `Revenue by Client (Billings - Sales)${selectedMonth && selectedYear ? ` (${new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})` : ''}` 
              : `Revenue by Business Branch${selectedMonth || selectedYear ? ` (Filtered)` : ''}`}
            colors={['#3b82f6', '#10b981', '#f59e0b']}
          />
        )}
      </Box>

      {/* Projects Over Time Bar Chart */}
      {projectsOverTime.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <BarChart
            data={projectsOverTime}
            title={selectedClient !== 'all' 
              ? `Billing Cycles by Month - ${selectedClient}${selectedMonth && selectedYear ? ` (${new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})` : ''}` 
              : `Projects Over Time${selectedMonth || selectedYear ? ` (Filtered)` : ''}${selectedMonth && selectedYear ? ` - ${new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : ''}`}
            dataKeys={selectedClient !== 'all' 
              ? [
                  { key: 'Billing Count', name: 'Billing Count', color: '#3b82f6' },
                  { key: 'Total Value', name: 'Total Value ($)', color: '#10b981' },
                ]
              : [
                  { key: 'Project Count', name: 'Project Count', color: '#3b82f6' },
                  { key: 'Total Value', name: 'Total Value ($)', color: '#10b981' },
                ]}
          />
        </Box>
      )}

      {/* Data Calculation Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Card sx={{ borderRadius: 3, bgcolor: 'grey.50', mt: 4 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <InfoIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5, flexShrink: 0 }} />
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                  Data Sources & Calculation Methodology
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  <strong>Operational Metrics:</strong> Calculated from actual sales and billings data stored in Strapi CMS. 
                  Data is aggregated from Construction, Loose Furniture, and Interior Design branches. 
                  Year-to-date (YTD) calculations use the current calendar year. Outstanding AR includes all billings with status "sent" or "overdue".
                  All operational data is fetched from Strapi CMS based on the configured environment.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

