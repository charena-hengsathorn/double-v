'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { predictiveApi } from '@/lib/api';
import KPICard from '@/components/KPICard';

export default function ExecutiveSummary() {
  const [forecast, setForecast] = useState<any>(null);
  const [riskHeatmap, setRiskHeatmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [forecastData, heatmapData] = await Promise.all([
        predictiveApi.getBaseForecast().catch(() => null),
        predictiveApi.getRiskHeatmap().catch(() => null),
      ]);

      setForecast(forecastData);
      setRiskHeatmap(heatmapData);
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

  const exportToCSV = () => {
    if (!riskHeatmap?.top_risks) return;

    const headers = ['Deal ID', 'Risk Score', 'Risk Factors'];
    const rows = riskHeatmap.top_risks.map((risk: any) => [
      risk.deal_id,
      (risk.risk_score * 100).toFixed(1) + '%',
      risk.risk_factors?.join('; ') || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `at-risk-deals-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading executive summary...</p>
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

  const summary = forecast?.forecast?.summary || {};
  const riskSummary = riskHeatmap?.summary || {};
  const topRisks = riskHeatmap?.top_risks || [];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-light text-gray-900 mb-2">Executive Summary</h1>
          <p className="text-gray-600">Rapid insight via concise summary</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-light text-gray-900 mb-4">Base Forecast</h2>
          <p className="text-4xl font-light text-gray-900 mb-2">
            {formatCurrency(summary.total_forecast || 0)}
          </p>
          <p className="text-sm text-gray-500">
            with {formatCurrency(riskSummary.total_at_risk || 0)} at risk
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Outlook</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Confirmed Revenue</span>
                <span className="text-sm font-medium">{formatCurrency(summary.total_confirmed || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tentative Pipeline</span>
                <span className="text-sm font-medium">{formatCurrency(summary.total_tentative || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="text-sm font-medium">
                  {((summary.conversion_rate || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Risks</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total At Risk</span>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(riskSummary.total_at_risk || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">High Risk Deals</span>
                <span className="text-sm font-medium">{riskSummary.high_risk_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Medium Risk Deals</span>
                <span className="text-sm font-medium">{riskSummary.medium_risk_count || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Actions</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Review {riskSummary.high_risk_count || 0} high-risk deals</li>
              <li>• Focus on deals in negotiation stage</li>
              <li>• Address low-activity deals</li>
              <li>• Monitor conversion rate trends</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Top At-Risk Deals</h2>
            <button
              onClick={exportToCSV}
              className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 border border-gray-200 rounded hover:bg-gray-50"
            >
              Export CSV
            </button>
          </div>
          {topRisks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Deal ID</th>
                    <th className="text-left p-2">Risk Score</th>
                    <th className="text-left p-2">Risk Factors</th>
                  </tr>
                </thead>
                <tbody>
                  {topRisks.slice(0, 10).map((risk: any, idx: number) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{risk.deal_id}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          risk.risk_score > 0.7 ? 'bg-red-100 text-red-800' :
                          risk.risk_score > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {(risk.risk_score * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {risk.risk_factors?.map((factor: string, fIdx: number) => (
                            <span key={fIdx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {factor}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No at-risk deals identified
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
