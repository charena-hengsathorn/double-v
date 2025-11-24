export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Double V</h1>
          <p className="text-gray-600">Executive Dashboard Suite</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a 
            href="/pipeline-integrity" 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-2">Pipeline Integrity</h2>
            <p className="text-sm text-gray-500">Monitor conversion health and risk exposure</p>
          </a>
          
          <a 
            href="/financials" 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-2">Financials</h2>
            <p className="text-sm text-gray-500">Evaluate cash flow and revenue outlook</p>
          </a>
          
          <a 
            href="/executive-summary" 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-2">Executive Summary</h2>
            <p className="text-sm text-gray-500">Rapid insight via concise summary</p>
          </a>
        </div>
      </div>
    </main>
  );
}
