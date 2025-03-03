import Link from 'next/link'
import { signOutAction } from '@/app/actions'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">FoodTruckFlow</h1>
          <p className="text-sm text-gray-400">Admin Dashboard</p>
        </div>
        <nav className="mt-6">
          <ul className="space-y-2 px-4">
            <li>
              <Link href="/admin" className="block py-2 px-4 rounded hover:bg-gray-700">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/config" className="block py-2 px-4 rounded hover:bg-gray-700">
                Configuration
              </Link>
            </li>
            <li>
              <Link href="/admin/menus" className="block py-2 px-4 rounded hover:bg-gray-700">
                Menus
              </Link>
            </li>
            <li>
              <Link href="/admin/orders" className="block py-2 px-4 rounded hover:bg-gray-700">
                Orders
              </Link>
            </li>
            <li>
              <Link href="/admin/analytics" className="block py-2 px-4 rounded hover:bg-gray-700">
                Analytics
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="block py-2 px-4 rounded hover:bg-gray-700">
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 bg-gray-100">
        <header className="bg-white shadow">
          <div className="flex justify-between items-center px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
            <div className="flex items-center">
              <span className="mr-4">Welcome, Admin</span>
              <form action={signOutAction}>
                <button type="submit" className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 