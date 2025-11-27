'use client';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export default function KPICard({ title, value, subtitle, trend, trendValue }: KPICardProps) {
  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  }[trend || 'neutral'];

  const trendIcon = {
    up: '↑',
    down: '↓',
    neutral: '→',
  }[trend || 'neutral'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      {trend && trendValue && (
        <div className={`mt-2 text-sm font-medium ${trendColor}`}>
          {trendIcon} {trendValue}
        </div>
      )}
    </div>
  );
}

