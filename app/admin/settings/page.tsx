export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Update Account
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Subscription</h2>
        <div className="p-4 bg-gray-100 rounded-md mb-4">
          <p className="font-medium">Current Plan: <span className="text-blue-600">Basic</span></p>
          <p className="text-sm text-gray-500">$29/month</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
          Upgrade to Pro
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Domain Settings</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">Subdomain</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="subdomain"
                id="subdomain"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300"
                placeholder="your-truck-name"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500">
                .foodtruckflow.com
              </span>
            </div>
          </div>
          
          <div>
            <label htmlFor="customDomain" className="block text-sm font-medium text-gray-700">Custom Domain (Pro Plan Only)</label>
            <input
              id="customDomain"
              name="customDomain"
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="www.yourdomain.com"
              disabled
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Domain Settings
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Stripe Integration</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="stripeKey" className="block text-sm font-medium text-gray-700">Stripe API Key</label>
            <input
              id="stripeKey"
              name="stripeKey"
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Stripe Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 