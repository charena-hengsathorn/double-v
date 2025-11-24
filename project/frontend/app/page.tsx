export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Double V Dashboard</h1>
        <p className="text-xl mb-8">Executive Dashboard Suite</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Pipeline Integrity</h2>
            <p className="text-gray-600">Monitor conversion health and risk exposure</p>
            <a href="/pipeline-integrity" className="text-blue-600 mt-2 inline-block">View →</a>
          </div>
          
          <div className="border p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Financials</h2>
            <p className="text-gray-600">Evaluate cash flow and revenue outlook</p>
            <a href="/financials" className="text-blue-600 mt-2 inline-block">View →</a>
          </div>
          
          <div className="border p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Executive Summary</h2>
            <p className="text-gray-600">Rapid insight via concise summary</p>
            <a href="/executive-summary" className="text-blue-600 mt-2 inline-block">View →</a>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Services Status</h3>
          <ul className="space-y-1">
            <li>✅ Predictive Service: <a href="http://localhost:8000/api/v1/health" className="text-blue-600" target="_blank">http://localhost:8000</a></li>
            <li>🔄 Strapi: <a href="http://localhost:1337" className="text-blue-600" target="_blank">http://localhost:1337</a></li>
          </ul>
        </div>
      </div>
    </main>
  );
}
