export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Getting Started Checklist */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Getting Started Checklist</h2>
        <ul className="space-y-2">
          <li className="flex items-center">
            <input type="checkbox" id="setup-profile" className="mr-2" />
            <label htmlFor="setup-profile">Set up your profile</label>
          </li>
          <li className="flex items-center">
            <input type="checkbox" id="customize-website" className="mr-2" />
            <label htmlFor="customize-website">Customize your website</label>
          </li>
          <li className="flex items-center">
            <input type="checkbox" id="add-menu" className="mr-2" />
            <label htmlFor="add-menu">Add menu items</label>
          </li>
          <li className="flex items-center">
            <input type="checkbox" id="setup-stripe" className="mr-2" />
            <label htmlFor="setup-stripe">Set up Stripe for payments</label>
          </li>
          <li className="flex items-center">
            <input type="checkbox" id="preview-site" className="mr-2" />
            <label htmlFor="preview-site">Preview your website</label>
          </li>
        </ul>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Total Orders</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Revenue</h3>
          <p className="text-3xl font-bold">$0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Website Visits</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-500">No recent activity to display.</p>
      </div>
    </div>
  )
}
