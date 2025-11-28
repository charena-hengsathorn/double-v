import Link from 'next/link';

export default function DashboardHome() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to Double V Executive Dashboard Suite</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/pipeline-integrity"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-2">Pipeline Integrity</h2>
          <p className="text-sm text-gray-500">Monitor conversion health and risk exposure</p>
        </Link>

        <Link
          href="/dashboard/financials"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-2">Financials</h2>
          <p className="text-sm text-gray-500">Evaluate cash flow and revenue outlook</p>
        </Link>

        <Link
          href="/dashboard/executive-summary"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-2">Executive Summary</h2>
          <p className="text-sm text-gray-500">Rapid insight via concise summary</p>
        </Link>
      </div>
    </div>
  );
}

