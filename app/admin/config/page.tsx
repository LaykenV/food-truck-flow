export default function ConfigPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Website Configuration</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="truckName" className="block text-sm font-medium text-gray-700">Food Truck Name</label>
            <input
              id="truckName"
              name="truckName"
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          
          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">Tagline</label>
            <input
              id="tagline"
              name="tagline"
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">Primary Color</label>
            <input
              id="primaryColor"
              name="primaryColor"
              type="color"
              className="mt-1 block w-12 h-8"
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
        <div className="border border-gray-300 rounded-md p-4 h-64 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Preview will appear here</p>
        </div>
      </div>
    </div>
  )
} 