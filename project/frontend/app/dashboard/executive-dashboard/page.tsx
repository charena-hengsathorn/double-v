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

      // Build filters for sales data
      const salesFilters: Record<string, any> = {};
      if (selectedClient !== 'all') {
        salesFilters.client = selectedClient;
      }
      if (selectedMonth) {
        salesFilters.month = selectedMonth;
      }
      if (selectedYear) {
        salesFilters.year = selectedYear;
      }

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
        strapiApi.getConstructionSales(Object.keys(salesFilters).length > 0 ? salesFilters : undefined).catch(() => ({ data: [] })),
        strapiApi.getLooseFurnitureSales(Object.keys(salesFilters).length > 0 ? salesFilters : undefined).catch(() => ({ data: [] })),
        strapiApi.getInteriorDesignSales(Object.keys(salesFilters).length > 0 ? salesFilters : undefined).catch(() => ({ data: [] })),
        strapiApi.getConstructionBillings(Object.keys(salesFilters).length > 0 ? salesFilters : undefined).catch(() => ({ data: [] })),
        strapiApi.getLooseFurnitureBillings(Object.keys(salesFilters).length > 0 ? salesFilters : undefined).catch(() => ({ data: [] })),
        strapiApi.getInteriorDesignBillings(Object.keys(salesFilters).length > 0 ? salesFilters : undefined).catch(() => ({ data: [] })),
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
    return sales.filter((sale: any) => {
      const attrs = sale.attributes || sale;
      
      // Filter by client
      if (selectedClient !== 'all' && attrs.client !== selectedClient) {
        return false;
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
          // If no date field, skip filtering by date
          return true;
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
    return billings.filter((billing: any) => {
      const attrs = billing.attributes || billing;
      
      // Filter by client (check customer field in billings)
      if (selectedClient !== 'all' && attrs.customer !== selectedClient && attrs.client !== selectedClient) {
        return false;
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
          // If no date field, skip filtering by date
          return true;
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

  // Process data for pie chart 1: Amount per project (Top 10)
  const projectAmounts = useMemo(() => {
    const projectMap = new Map<string, number>();

    // Group by client (which represents projects)
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
  }, [filteredSales]);

  // Process data for bar chart: All projects comparison
  const allProjectsBarData = useMemo(() => {
    const projectMap = new Map<string, number>();

    // Group by client (which represents projects)
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
  }, [filteredSales]);

  // Process data for pie chart 2: Amount per business branch
  const branchAmounts = useMemo(() => {
    const constructionTotal = filteredConstructionSales.reduce((sum: number, sale: any) => {
      const attrs = sale.attributes || sale;
      return sum + parseFloat(attrs.sale_amount || 0);
    }, 0);

    const looseFurnitureTotal = filteredLooseFurnitureSales.reduce((sum: number, sale: any) => {
      const attrs = sale.attributes || sale;
      return sum + parseFloat(attrs.sale_amount || 0);
    }, 0);

    const interiorDesignTotal = filteredInteriorDesignSales.reduce((sum: number, sale: any) => {
      const attrs = sale.attributes || sale;
      return sum + parseFloat(attrs.sale_amount || 0);
    }, 0);

    return [
      { name: 'Construction', value: constructionTotal },
      { name: 'Loose Furniture', value: looseFurnitureTotal },
      { name: 'Interior Design', value: interiorDesignTotal },
    ].filter(item => item.value > 0);
  }, [filteredConstructionSales, filteredLooseFurnitureSales, filteredInteriorDesignSales]);

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
  }, [filteredProjects, filteredSales, selectedMonth, selectedYear]);

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

    // Combine all sales data
    const allSales = [
      ...filteredConstructionSales,
      ...filteredLooseFurnitureSales,
      ...filteredInteriorDesignSales,
    ];

    // Combine all filtered billings data
    const allBillings = [
      ...filteredConstructionBillings,
      ...filteredLooseFurnitureBillings,
      ...filteredInteriorDesignBillings,
    ];

    // Calculate sales metrics
    const totalSalesYTD = allSales.reduce((sum, sale) => {
      const attrs = sale.attributes || sale;
      const saleDate = attrs.sale_date ? new Date(attrs.sale_date) : null;
      if (saleDate && saleDate.getFullYear() === currentYear) {
        return sum + parseFloat(attrs.sale_amount || 0);
      }
      return sum;
    }, 0);

    const totalProfitYTD = allSales.reduce((sum, sale) => {
      const attrs = sale.attributes || sale;
      const saleDate = attrs.sale_date ? new Date(attrs.sale_date) : null;
      if (saleDate && saleDate.getFullYear() === currentYear) {
        return sum + parseFloat(attrs.project_profit || (attrs.sale_amount || 0) - (attrs.construction_cost || 0));
      }
      return sum;
    }, 0);

    // Calculate billings metrics
    const billedYTD = allBillings.reduce((sum, billing) => {
      const attrs = billing.attributes || billing;
      const invoiceDate = attrs.invoice_date ? new Date(attrs.invoice_date) : null;
      if (invoiceDate && invoiceDate.getFullYear() === currentYear) {
        return sum + parseFloat(attrs.amount || 0);
      }
      return sum;
    }, 0);

    const collectedYTD = allBillings.reduce((sum, billing) => {
      const attrs = billing.attributes || billing;
      const collectedDate = attrs.collected_date ? new Date(attrs.collected_date) : null;
      if (collectedDate && collectedDate.getFullYear() === currentYear) {
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
  }, [filteredConstructionSales, filteredLooseFurnitureSales, filteredInteriorDesignSales, filteredConstructionBillings, filteredLooseFurnitureBillings, filteredInteriorDesignBillings, filteredProjects]);

  // Extract forecast summary - handle different response structures
  const summary = forecast?.forecast?.summary || forecast?.summary || {};
  const forecastMonthlyTotals = forecast?.forecast?.monthly_totals || forecast?.monthly_totals || [];
  const heatmapData = riskHeatmap?.heatmap?.matrix || riskHeatmap?.matrix || [];
  const heatmapStages = riskHeatmap?.heatmap?.stages || riskHeatmap?.stages || [];
  const heatmapBuckets = riskHeatmap?.heatmap?.probability_buckets || riskHeatmap?.probability_buckets || [];
  
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
      
      // Process billings data
      allFilteredBillings.forEach((billing: any) => {
        const attrs = billing.attributes || billing;
        const billingDate = attrs.collected_date || attrs.invoice_date || attrs.date || attrs.createdAt;
        if (billingDate) {
          const date = new Date(billingDate);
          const day = date.getDate();
          const amount = parseFloat(attrs.amount || 0);
          
          if (amount > 0) {
            totalRevenue += amount;
            
            // Group by project/client
            const client = attrs.customer || attrs.client || 'Unknown';
            revenueByProject.set(client, (revenueByProject.get(client) || 0) + amount);
            
            // Group by billing date (day)
            revenueByBillingDate.set(day, (revenueByBillingDate.get(day) || 0) + amount);
          }
        }
      });
      
      // Process sales data for the selected month
      filteredSales.forEach((sale: any) => {
        const attrs = sale.attributes || sale;
        const saleDate = attrs.sale_date || attrs.date || attrs.createdAt;
        if (saleDate) {
          const date = new Date(saleDate);
          const amount = parseFloat(attrs.sale_amount || 0);
          
          if (amount > 0) {
            totalRevenue += amount;
            
            // Group by project/client
            const client = attrs.client || 'Unknown';
            revenueByProject.set(client, (revenueByProject.get(client) || 0) + amount);
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
      
      // Create entries: Total first, then projects, then billing dates
      chartData.push({
        name: 'Total Revenue',
        'Total Revenue': totalRevenue,
        'By Project': 0,
        'By Billing Date': 0,
      });
      
      // Add revenue by project (all projects, but limit display to top 15)
      const topProjects = projectsArray.slice(0, 15);
      topProjects.forEach((project) => {
        chartData.push({
          name: project.name.length > 25 ? project.name.substring(0, 25) + '...' : project.name,
          'Total Revenue': 0,
          'By Project': project.value,
          'By Billing Date': 0,
        });
      });
      
      // Add revenue by billing date (all days with revenue)
      datesArray.forEach((dateItem) => {
        chartData.push({
          name: `Day ${dateItem.day}`,
          'Total Revenue': 0,
          'By Project': 0,
          'By Billing Date': dateItem.value,
        });
      });
      
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
                {clients.map((client: any) => {
                  const attrs = client.attributes || client;
                  const clientName = attrs.name || attrs.client_id || 'Unknown';
                  return (
                    <MenuItem key={client.id || client.documentId || clientName} value={clientName}>
                      {clientName}
                    </MenuItem>
                  );
                })}
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
          title="Total Sales YTD"
          value={formatCurrency(operationalMetrics.totalSalesYTD)}
          subtitle="Year-to-date sales revenue"
          delay={0.1}
        />
        <KPICard
          title="Collected YTD"
          value={formatCurrency(operationalMetrics.collectedYTD)}
          subtitle="Year-to-date cash collected"
          delay={0.2}
        />
        <KPICard
          title="Total Profit YTD"
          value={formatCurrency(operationalMetrics.totalProfitYTD)}
          subtitle="Year-to-date profit"
          delay={0.3}
        />
        <KPICard
          title="Outstanding AR"
          value={formatCurrency(operationalMetrics.outstandingAR)}
          subtitle="Accounts receivable"
          delay={0.4}
        />
      </Box>

      {/* KPI Cards - Forecast Metrics */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 400, mb: 2, color: 'text.primary' }}>
          Forecast Metrics
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Predictive analytics and pipeline projections
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <KPICard
          title="Confirmed Revenue"
          value={formatCurrency(summary.total_confirmed || 0)}
          subtitle="High confidence pipeline"
          delay={0.5}
        />
        <KPICard
          title="Tentative Pipeline"
          value={formatCurrency(summary.total_tentative || 0)}
          subtitle="Lower confidence pipeline"
          delay={0.6}
        />
        <KPICard
          title="Total Forecast"
          value={formatCurrency(summary.total_forecast || 0)}
          subtitle={`${((summary.conversion_rate || 0) * 100).toFixed(1)}% conversion`}
          delay={0.7}
        />
        <KPICard
          title="Risk Exposure"
          value={formatCurrency(riskHeatmap?.summary?.total_at_risk || 0)}
          subtitle={`${riskHeatmap?.summary?.high_risk_count || 0} high-risk deals`}
          delay={0.8}
        />
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        {selectedMonth && selectedYear ? (
          <BarChart
            data={revenueOutlookData.map((item: any) => ({
              name: item.month,
              'Total Revenue': item.actual && item.month === 'Total Revenue' ? item.actual : 0,
              'By Project': item.byProject || 0,
              'By Billing Date': item.byBillingDate || 0,
            }))}
            title={`Revenue Outlook - ${new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
            dataKeys={[
              { key: 'Total Revenue', name: 'Total Revenue', color: '#3b82f6' },
              { key: 'By Project', name: 'By Project', color: '#10b981' },
              { key: 'By Billing Date', name: 'By Billing Date', color: '#f59e0b' },
            ]}
          />
        ) : (
          <StackedAreaChart
            data={revenueOutlookData}
            title="Revenue Outlook"
          />
        )}
        {allProjectsBarData.length > 0 && (
          <BarChart
            data={allProjectsBarData}
            title={`All Projects Revenue Comparison${selectedClient !== 'all' || selectedMonth || selectedYear ? ` (Filtered)` : ''}`}
            dataKeys={[
              { key: 'Revenue', name: 'Revenue', color: '#3b82f6' },
            ]}
          />
        )}
      </Box>

      {/* Project Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        {projectAmounts.length > 0 && (
          <PieChart
            data={projectAmounts}
            title={`Revenue by Project (Top 10)${selectedClient !== 'all' || selectedMonth || selectedYear ? ` (Filtered)` : ''}`}
          />
        )}
        {branchAmounts.length > 0 && (
          <PieChart
            data={branchAmounts}
            title={`Revenue by Business Branch${selectedClient !== 'all' || selectedMonth || selectedYear ? ` (Filtered)` : ''}`}
            colors={['#3b82f6', '#10b981', '#f59e0b']}
          />
        )}
      </Box>

      {/* Projects Over Time Bar Chart */}
      {projectsOverTime.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <BarChart
            data={projectsOverTime}
            title={`Projects Over Time${selectedClient !== 'all' || selectedMonth || selectedYear ? ` (Filtered)` : ''}${selectedMonth && selectedYear ? ` - ${new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : ''}`}
            dataKeys={[
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
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6, mb: 1.5 }}>
                  <strong>Operational Metrics (Top Row):</strong> Calculated from actual sales and billings data stored in Strapi CMS. 
                  Data is aggregated from Construction, Loose Furniture, and Interior Design branches. 
                  Year-to-date (YTD) calculations use the current calendar year. Outstanding AR includes all billings with status "sent" or "overdue".
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6, mb: 1.5 }}>
                  <strong>Forecast Metrics (Bottom Row):</strong> Generated by the Predictive Service API using a hybrid approach. 
                  When pipeline deals are available, they are used with probability-weighted revenue recognition. 
                  Otherwise, forecasts are derived from historical sales and billings data. Confirmed sales are projected at 100% probability over 12 months, 
                  while pending sales use 50% probability over 6 months. Historical trends are incorporated as tentative projections.
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  <strong>Environment Configuration:</strong> Development environment connects to local predictive service (localhost:8000), 
                  while production connects to the deployed Heroku predictive service. All operational data is fetched from Strapi CMS based on the configured environment.
                  These forecasts and metrics are estimates and should not be considered guarantees of future performance.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

