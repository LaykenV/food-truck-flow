'use client'

import { useEffect, useState } from 'react'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  ChartData
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'
import { formatCurrency } from '@/lib/utils'

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
)

// Types for our analytics data
export type AnalyticsData = {
  totalOrders: number
  totalRevenue: number
  totalPageViews: number
  salesOverTime: {
    date: string
    orders: number
    revenue: number
  }[]
  popularItems: {
    name: string
    count: number
  }[]
  trafficSources: {
    source: string
    count: number
  }[]
  subscriptionPlan: string
}

// Chart options
const lineOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Sales Over Time',
    },
  },
}

const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Popular Menu Items',
    },
  },
}

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Traffic Sources',
    },
  },
}

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  // Prepare data for charts
  const salesData = {
    labels: data.salesOverTime.map(item => item.date),
    datasets: [
      {
        label: 'Orders',
        data: data.salesOverTime.map(item => item.orders),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Revenue ($)',
        data: data.salesOverTime.map(item => item.revenue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y1',
      },
    ],
  }

  const popularItemsData = {
    labels: data.popularItems.map(item => item.name),
    datasets: [
      {
        label: 'Orders',
        data: data.popularItems.map(item => item.count),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  }

  const trafficSourcesData = {
    labels: data.trafficSources.map(item => item.source),
    datasets: [
      {
        label: 'Visits',
        data: data.trafficSources.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  // Show advanced analytics message for Basic plan users
  const showUpgradeMessage = data.subscriptionPlan === 'basic'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Total Orders</h3>
          <p className="text-3xl font-bold">{data.totalOrders}</p>
          <p className="text-sm text-gray-500">All time</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Revenue</h3>
          <p className="text-3xl font-bold">{formatCurrency(data.totalRevenue)}</p>
          <p className="text-sm text-gray-500">All time</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Website Visits</h3>
          <p className="text-3xl font-bold">{data.totalPageViews}</p>
          <p className="text-sm text-gray-500">All time</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Sales Over Time</h2>
        <div className="h-64">
          {data.salesOverTime.length > 0 ? (
            <Line options={lineOptions} data={salesData} />
          ) : (
            <div className="border border-gray-300 rounded-md p-4 h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">No sales data available yet</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Popular Menu Items</h2>
        <div className="h-64">
          {data.popularItems.length > 0 ? (
            <Bar options={barOptions} data={popularItemsData} />
          ) : (
            <div className="border border-gray-300 rounded-md p-4 h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">No menu item data available yet</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Traffic Sources</h2>
        <div className="h-64">
          {data.trafficSources.length > 0 ? (
            <Pie options={pieOptions} data={trafficSourcesData} />
          ) : (
            <div className="border border-gray-300 rounded-md p-4 h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">No traffic source data available yet</p>
            </div>
          )}
        </div>
      </div>

      {showUpgradeMessage && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800">Upgrade to Pro for Advanced Analytics</h3>
          <p className="text-blue-600 mt-1">Get access to more detailed analytics, custom date ranges, and exportable reports.</p>
          <a href="/admin/settings" className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Upgrade Now
          </a>
        </div>
      )}
    </div>
  )
} 