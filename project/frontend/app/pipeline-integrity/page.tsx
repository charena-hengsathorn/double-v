'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { predictiveApi } from '@/lib/api';
import StackedAreaChart from '@/components/StackedAreaChart';
import RiskHeatmap from '@/components/RiskHeatmap';
import KPICard from '@/components/KPICard';
import ScenarioToggle from '@/components/ScenarioToggle';

export default function PipelineIntegrity() {
  const [forecast, setForecast] = useState<any>(null);
  const [riskHeatmap, setRiskHeatmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scenario, setScenario] = useState('base');

  useEffect(() => {
    loadData();
  }, [scenario]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [forecastData, heatmapData] = await Promise.all([
        predictiveApi.getScenarioForecast(scenario).catch(() => null),
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

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading pipeline data...</p>
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
  const monthlyTotals = forecast?.forecast?.monthly_totals || [];
  const heatmapData = riskHeatmap?.heatmap?.matrix || [];
  const heatmapStages = riskHeatmap?.heatmap?.stages || [];
  const heatmapBuckets = riskHeatmap?.heatmap?.probability_buckets || [];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2">Pipeline Integrity</h1>
              <p className="text-gray-600">Monitor conversion health and risk exposure</p>
            </div>
            <ScenarioToggle selectedScenario={scenario} onScenarioChange={setScenario} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Confirmed Revenue"
            value={formatCurrency(summary.total_confirmed || 0)}
            subtitle="High confidence deals"
          />
          <KPICard
            title="Tentative Pipeline"
            value={formatCurrency(summary.total_tentative || 0)}
            subtitle="Lower confidence deals"
          />
          <KPICard
            title="Total Forecast"
            value={formatCurrency(summary.total_forecast || 0)}
            subtitle={`${((summary.conversion_rate || 0) * 100).toFixed(1)}% conversion`}
          />
          <KPICard
            title="Risk Exposure"
            value={formatCurrency(riskHeatmap?.summary?.total_at_risk || 0)}
            subtitle={`${riskHeatmap?.summary?.high_risk_count || 0} high-risk deals`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <StackedAreaChart
              data={monthlyTotals}
              title="Revenue Outlook"
            />
          </div>
          <div>
            <RiskHeatmap
              data={heatmapData}
              stages={heatmapStages}
              probabilityBuckets={heatmapBuckets}
            />
          </div>
        </div>

        {riskHeatmap?.top_risks && riskHeatmap.top_risks.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Top Risks</h2>
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
                  {riskHeatmap.top_risks.slice(0, 10).map((risk: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{risk.deal_id}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded ${
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
          </div>
        )}
      </div>
    </main>
  );
}
