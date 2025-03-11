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
  Filler,
  RadialLinearScale,
  ChartData
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
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
  ArcElement,
  Filler,
  RadialLinearScale
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
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        boxWidth: 10,
        font: {
          size: 12
        }
      }
    },
    title: {
      display: true,
      text: 'Sales Over Time',
      font: {
        size: 16,
        weight: 'bold' as const
      }
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const label = context.dataset.label || '';
          const value = context.raw;
          if (label === 'Revenue ($)') {
            return `${label}: $${value}`;
          }
          return `${label}: ${value}`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      title: {
        display: true,
        text: 'Orders',
        font: {
          size: 12
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      beginAtZero: true
    },
    y1: {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      title: {
        display: true,
        text: 'Revenue ($)',
        font: {
          size: 12
        }
      },
      grid: {
        drawOnChartArea: false,
      },
      beginAtZero: true
    }
  }
}

const barOptions = {
  responsive: true,
  indexAxis: 'y' as const,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'Popular Menu Items',
      font: {
        size: 16,
        weight: 'bold' as const
      }
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          return `Orders: ${context.raw}`;
        }
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        precision: 0
      }
    },
    y: {
      grid: {
        display: false
      }
    }
  }
}

const doughnutOptions = {
  responsive: true,
  cutout: '70%',
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        boxWidth: 10,
        font: {
          size: 11
        }
      }
    },
    title: {
      display: true,
      text: 'Traffic Sources',
      font: {
        size: 16,
        weight: 'bold' as const
      }
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const label = context.label || '';
          const value = context.raw;
          const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
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
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: 'y',
      },
      {
        label: 'Revenue ($)',
        data: data.salesOverTime.map(item => item.revenue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
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
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
        borderRadius: 4,
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
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
        hoverOffset: 15,
      },
    ],
  }

  // Check if user is on basic plan
  const isBasicPlan = data.subscriptionPlan === 'basic';

  // Premium feature overlay component
  const PremiumFeatureOverlay = () => (
    <div className="absolute inset-0 backdrop-blur-md bg-white/30 flex flex-col items-center justify-center z-10 rounded-lg">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
        <h3 className="text-xl font-bold text-blue-600 mb-2">Pro Feature</h3>
        <p className="text-gray-700 mb-4">Upgrade to our Pro plan to unlock detailed analytics and gain valuable insights for your food truck business.</p>
        <a 
          href="/admin/subscribe" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <span className="mr-2">Upgrade Now</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-medium text-gray-500">Total Orders</h3>
          <p className="text-3xl font-bold">{data.totalOrders}</p>
          <p className="text-sm text-gray-500">All time</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-medium text-gray-500">Revenue</h3>
          <p className="text-3xl font-bold">{formatCurrency(data.totalRevenue)}</p>
          <p className="text-sm text-gray-500">All time</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-medium text-gray-500">Website Visits</h3>
          <p className="text-3xl font-bold">{data.totalPageViews}</p>
          <p className="text-sm text-gray-500">All time</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow relative">
        <div className="h-80">
          {data.salesOverTime.length > 0 ? (
            <Line options={lineOptions} data={salesData} />
          ) : (
            <div className="border border-gray-300 rounded-md p-4 h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">No sales data available yet</p>
            </div>
          )}
        </div>
        {isBasicPlan && <PremiumFeatureOverlay />}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow relative">
          <div className="h-80">
            {data.popularItems.length > 0 ? (
              <Bar options={barOptions} data={popularItemsData} />
            ) : (
              <div className="border border-gray-300 rounded-md p-4 h-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">No menu item data available yet</p>
              </div>
            )}
          </div>
          {isBasicPlan && <PremiumFeatureOverlay />}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow relative">
          <div className="h-80">
            {data.trafficSources.length > 0 ? (
              <Doughnut options={doughnutOptions} data={trafficSourcesData} />
            ) : (
              <div className="border border-gray-300 rounded-md p-4 h-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">No traffic source data available yet</p>
              </div>
            )}
          </div>
          {isBasicPlan && <PremiumFeatureOverlay />}
        </div>
      </div>

      {isBasicPlan && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-blue-800 mb-2">Unlock Premium Analytics</h3>
              <p className="text-blue-600">Get access to detailed sales trends, customer insights, and performance metrics to grow your food truck business.</p>
            </div>
            <a href="/admin/subscribe" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm">
              Upgrade to Pro
            </a>
          </div>
        </div>
      )}
    </div>
  )
} 