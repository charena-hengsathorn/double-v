'use client';

import { useMemo } from 'react';

interface HeatmapData {
  stage: string;
  probability_range: string;
  deal_count: number;
  total_value: number;
  at_risk_value: number;
}

interface RiskHeatmapProps {
  data: HeatmapData[];
  stages: string[];
  probabilityBuckets: string[];
}

export default function RiskHeatmap({ data, stages, probabilityBuckets }: RiskHeatmapProps) {
  // Create a matrix for the heatmap
  const matrix = useMemo(() => {
    const matrixMap = new Map<string, HeatmapData>();
    data.forEach(item => {
      const key = `${item.stage}:${item.probability_range}`;
      matrixMap.set(key, item);
    });

    return stages.map(stage => 
      probabilityBuckets.map(bucket => {
        const key = `${stage}:${bucket}`;
        return matrixMap.get(key) || {
          stage,
          probability_range: bucket,
          deal_count: 0,
          total_value: 0,
          at_risk_value: 0,
        };
      })
    );
  }, [data, stages, probabilityBuckets]);

  const maxValue = useMemo(() => {
    return Math.max(...data.map(d => d.at_risk_value), 1);
  }, [data]);

  const getColorIntensity = (value: number) => {
    const intensity = Math.min(value / maxValue, 1);
    const red = Math.round(255 * intensity);
    const green = Math.round(255 * (1 - intensity));
    return `rgb(${red}, ${green}, 0)`;
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Risk Heatmap</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left bg-gray-100">Stage / Probability</th>
              {probabilityBuckets.map(bucket => (
                <th key={bucket} className="border p-2 bg-gray-100 text-center">
                  {bucket}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stages.map((stage, stageIdx) => (
              <tr key={stage}>
                <td className="border p-2 font-medium bg-gray-50">{stage}</td>
                {matrix[stageIdx].map((cell, bucketIdx) => (
                  <td
                    key={`${stage}-${bucketIdx}`}
                    className="border p-2 text-center"
                    style={{ backgroundColor: getColorIntensity(cell.at_risk_value) }}
                  >
                    <div className="text-sm">
                      <div className="font-semibold">${(cell.at_risk_value / 1000).toFixed(0)}k</div>
                      <div className="text-xs text-gray-600">{cell.deal_count} deals</div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Color intensity represents at-risk value (red = higher risk)</p>
      </div>
    </div>
  );
}

