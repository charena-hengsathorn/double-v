export default function ExecutiveSummary() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
            ← Back to Dashboard
          </a>
          <h1 className="text-3xl font-light text-gray-900 mb-2">Executive Summary</h1>
          <p className="text-gray-600">Rapid insight via concise summary</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-light text-gray-900 mb-4">Base Forecast</h2>
          <p className="text-4xl font-light text-gray-900 mb-2">-</p>
          <p className="text-sm text-gray-500">with - at risk</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Outlook</h3>
            <p className="text-sm text-gray-600">Revenue projection summary and key metrics</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Risks</h3>
            <p className="text-sm text-gray-600">Quantified exposure and top at-risk deals</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Actions</h3>
            <p className="text-sm text-gray-600">Priority actions to accelerate and mitigate</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Top At-Risk Deals</h2>
            <button className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 border border-gray-200 rounded">
              Export CSV
            </button>
          </div>
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
            Table placeholder - At-risk deals table will go here
          </div>
        </div>
      </div>
    </main>
  );
}

