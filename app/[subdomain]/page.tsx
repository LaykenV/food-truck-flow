export default function FoodTruckHomePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Food Truck Name
          </h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl mx-auto">
            Delicious food on wheels. We bring the flavor to you!
          </p>
          <div className="mt-10 flex justify-center">
            <button className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10">
              View Menu
            </button>
          </div>
        </div>
      </div>
      
      {/* Featured Menu Items */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          Featured Menu Items
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Menu Item 1</h3>
              <p className="mt-1 text-gray-500">Description of this delicious menu item.</p>
              <p className="mt-2 text-lg font-medium text-gray-900">$10.99</p>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Menu Item 2</h3>
              <p className="mt-1 text-gray-500">Description of this delicious menu item.</p>
              <p className="mt-2 text-lg font-medium text-gray-900">$12.99</p>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Menu Item 3</h3>
              <p className="mt-1 text-gray-500">Description of this delicious menu item.</p>
              <p className="mt-2 text-lg font-medium text-gray-900">$9.99</p>
            </div>
          </div>
        </div>
        <div className="mt-10 text-center">
          <a href="#" className="text-base font-medium text-indigo-600 hover:text-indigo-500">
            View Full Menu <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
      
      {/* About Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                About Our Food Truck
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="bg-gray-200 rounded-lg h-96"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Location Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          Find Us
        </h2>
        <div className="bg-gray-200 rounded-lg h-96"></div>
        <div className="mt-8 text-center">
          <h3 className="text-lg font-medium text-gray-900">Current Location</h3>
          <p className="mt-2 text-gray-500">123 Main Street, City, State 12345</p>
          <p className="mt-1 text-gray-500">Monday - Friday: 11am - 8pm</p>
          <p className="mt-1 text-gray-500">Saturday - Sunday: 12pm - 9pm</p>
        </div>
      </div>
    </div>
  )
} 