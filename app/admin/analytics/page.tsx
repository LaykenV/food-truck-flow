export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Total Orders</h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-gray-500">All time</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Revenue</h3>
          <p className="text-3xl font-bold">$0.00</p>
          <p className="text-sm text-gray-500">All time</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Website Visits</h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-gray-500">All time</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Sales Over Time</h2>
        <div className="border border-gray-300 rounded-md p-4 h-64 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Chart will appear here</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Popular Menu Items</h2>
        <div className="border border-gray-300 rounded-md p-4 h-64 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Chart will appear here</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Traffic Sources</h2>
        <div className="border border-gray-300 rounded-md p-4 h-64 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Chart will appear here</p>
        </div>
      </div>
    </div>
  )
} 