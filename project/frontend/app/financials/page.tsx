'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { strapiApi, predictiveApi } from '@/lib/api';
import StackedAreaChart from '@/components/StackedAreaChart';
import WaterfallChart from '@/components/WaterfallChart';
import KPICard from '@/components/KPICard';

export default function Financials() {
  const [forecast, setForecast] = useState<any>(null);
  const [billings, setBillings] = useState<any>(null);
  const [waterfall, setWaterfall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [forecastData, billingsData, waterfallData] = await Promise.all([
        predictiveApi.getBaseForecast().catch(() => null),
        strapiApi.getBillings().catch(() => ({ data: [] })),
        predictiveApi.getForecastWaterfall().catch(() => null),
      ]);

      setForecast(forecastData);
      setBillings(billingsData || { data: [] });
      setWaterfall(waterfallData);
    } catch (err: any) {
      // Only set error for non-404 errors
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

  // Calculate financial metrics from billings
  const calculateMetrics = () => {
    if (!billings?.data) return { billedYTD: 0, collectedYTD: 0, outstandingAR: 0 };

    const today = new Date();
    const currentYear = today.getFullYear();

    let billedYTD = 0;
    let collectedYTD = 0;
    let outstandingAR = 0;

    billings.data.forEach((billing: any) => {
      const attrs = billing.attributes || {};
      const invoiceDate = attrs.invoice_date ? new Date(attrs.invoice_date) : null;
      const collectedDate = attrs.collected_date ? new Date(attrs.collected_date) : null;
      const amount = parseFloat(attrs.amount || 0);

      if (invoiceDate && invoiceDate.getFullYear() === currentYear) {
        billedYTD += amount;
      }

      if (collectedDate && collectedDate.getFullYear() === currentYear) {
        collectedYTD += amount;
      }

      if (attrs.status === 'sent' || attrs.status === 'overdue') {
        outstandingAR += amount;
      }
    });

    return { billedYTD, collectedYTD, outstandingAR };
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading financial data...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
            <button
              onClick={loadData}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  const metrics = calculateMetrics();
  const summary = forecast?.forecast?.summary || {};
  const monthlyTotals = forecast?.forecast?.monthly_totals || [];
  const waterfallData = waterfall?.variance?.breakdown || [];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-light text-gray-900 mb-2">Financials</h1>
          <p className="text-gray-600">Evaluate cash flow and overall revenue outlook</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Billed YTD"
            value={formatCurrency(metrics.billedYTD)}
            subtitle="Year-to-date invoiced"
          />
          <KPICard
            title="Collected YTD"
            value={formatCurrency(metrics.collectedYTD)}
            subtitle="Year-to-date collected"
          />
          <KPICard
            title="Outstanding AR"
            value={formatCurrency(metrics.outstandingAR)}
            subtitle="Accounts receivable"
          />
          <KPICard
            title="Total Forecast"
            value={formatCurrency(summary.total_forecast || 0)}
            subtitle="12-month outlook"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <StackedAreaChart
              data={monthlyTotals}
              title="Revenue Forecast"
            />
          </div>
          <div>
            <WaterfallChart
              data={waterfallData.length > 0 ? waterfallData : [
                { name: 'Total', prior: 0, current: 0, change: 0 }
              ]}
              title="Forecast Waterfall"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
