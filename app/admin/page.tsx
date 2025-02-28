'use client';

import { useAuth } from '../../lib/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Admin Dashboard
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Welcome to your FoodTruckFlow admin dashboard.
        </p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {user?.email}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {user?.id}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Last Sign In</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
            </dd>
          </div>
        </dl>
      </div>
      
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mt-6">
          Getting Started
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="text-indigo-800 font-medium">Configure Your Food Truck</h4>
            <p className="text-indigo-600 mt-1 text-sm">
              Set up your food truck&apos;s information, colors, and branding.
            </p>
            <a href="/admin/config" className="mt-3 inline-flex items-center text-sm font-medium text-indigo-700">
              Go to Configuration
              <svg className="ml-1 h-5 w-5 text-indigo-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-green-800 font-medium">Manage Your Menu</h4>
            <p className="text-green-600 mt-1 text-sm">
              Add, edit, and organize your food truck&apos;s menu items.
            </p>
            <a href="/admin/menus" className="mt-3 inline-flex items-center text-sm font-medium text-green-700">
              Go to Menu Management
              <svg className="ml-1 h-5 w-5 text-green-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 