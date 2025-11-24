export default function Financials() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
            ← Back to Dashboard
          </a>
          <h1 className="text-3xl font-light text-gray-900 mb-2">Financials</h1>
          <p className="text-gray-600">Evaluate cash flow and overall revenue outlook</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Billed YTD</p>
            <p className="text-2xl font-light text-gray-900">-</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Collected YTD</p>
            <p className="text-2xl font-light text-gray-900">-</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Outstanding AR</p>
            <p className="text-2xl font-light text-gray-900">-</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Gross Margin</p>
            <p className="text-2xl font-light text-gray-900">-</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Cash Flow</h2>
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
              Chart placeholder - Cash flow chart will go here
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Receivables Aging</h2>
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
              Table placeholder - Receivables table will go here
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

