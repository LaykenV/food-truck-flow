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
import { Line } from 'react-chartjs-2'
import { formatCurrency } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { getFoodTruck, getAnalyticsData } from '../clientQueries'
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
}

// Time range selector type
type TimeRange = 'daily' | 'monthly' | 'total';

export function AnalyticsClient() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  
  // Chart options with theme support and improved visibility for dark mode
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
          color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Sales Over Time',
        color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
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
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
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
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
          font: {
            size: 12
          }
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)'
        },
        beginAtZero: true,
        ticks: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Revenue ($)',
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
          font: {
            size: 12
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        beginAtZero: true,
        ticks: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
        }
      }
    }
  };

  // Query for the food truck data
  const { data: foodTruck, isLoading: isFoodTruckLoading } = useQuery({
    queryKey: ['foodTruck'],
    queryFn: getFoodTruck
  });

  // Query for analytics data, enabled only when foodTruck data is available
  const { data: analyticsResult, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAnalyticsData,
    enabled: !!foodTruck
  });

  // Process analytics data
  const analyticsData = analyticsResult?.analyticsData || [];
  
  // Calculate totals for all time
  const totalOrders = analyticsData?.reduce((sum, day) => sum + (day.orders_placed || 0), 0) || 0;
  const totalRevenue = analyticsData?.reduce((sum, day) => sum + (day.revenue || 0), 0) || 0;
  const totalPageViews = analyticsData?.reduce((sum, day) => sum + (day.page_views || 0), 0) || 0;
  
  // Calculate metrics based on selected time range
  const getTimeRangeData = () => {
    const now = new Date();
    let filteredData = [];
    let periodLabel = '';
    
    if (timeRange === 'daily') {
      // Get today's data
      const today = format(now, 'yyyy-MM-dd');
      filteredData = analyticsData.filter(d => d.date === today);
      periodLabel = 'Today';
    } else if (timeRange === 'monthly') {
      // Get current month's data
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      filteredData = analyticsData.filter(d => {
        const date = new Date(d.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
      periodLabel = format(now, 'MMMM yyyy');
    } else {
      // Total (all time)
      filteredData = analyticsData;
      periodLabel = 'All time';
    }
    
    // Calculate sums for the filtered data
    const orders = filteredData.reduce((sum, day) => sum + (day.orders_placed || 0), 0);
    const revenue = filteredData.reduce((sum, day) => sum + (day.revenue || 0), 0);
    const views = filteredData.reduce((sum, day) => sum + (day.page_views || 0), 0);
    
    return { orders, revenue, views, periodLabel };
  };
  
  const { orders, revenue, views, periodLabel } = getTimeRangeData();
  
  // Generate data for the sales chart based on time range
  const getSalesChartData = () => {
    let chartData = [];
    let dateFormat = 'MMM dd';
    
    if (timeRange === 'daily') {
      // Last 7 days
      chartData = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        const formattedDate = format(date, 'yyyy-MM-dd');
        const dayData = analyticsData?.find(d => d.date === formattedDate);
        
        return {
          date: format(date, dateFormat),
          orders: dayData?.orders_placed || 0,
          revenue: dayData?.revenue || 0
        };
      }).reverse();
    } else if (timeRange === 'monthly') {
      // Last month's data with daily granularity
      const lastMonth = subMonths(new Date(), 1);
      const startDate = startOfMonth(lastMonth);
      const endDate = endOfMonth(lastMonth);
      const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
      
      chartData = daysInMonth.map(date => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const dayData = analyticsData?.find(d => d.date === formattedDate);
        
        return {
          date: format(date, 'MMM dd'),
          orders: dayData?.orders_placed || 0,
          revenue: dayData?.revenue || 0
        };
      });
      
    } else {
      // Last 6 months (for total view)
      chartData = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(new Date(), i);
        const startDate = startOfMonth(date);
        const endDate = endOfMonth(date);
        
        // Filter data for this month
        const monthData = analyticsData?.filter(d => {
          const dataDate = new Date(d.date);
          return dataDate >= startDate && dataDate <= endDate;
        });
        
        // Sum up orders and revenue for the month
        const monthOrders = monthData?.reduce((sum, day) => sum + (day.orders_placed || 0), 0) || 0;
        const monthRevenue = monthData?.reduce((sum, day) => sum + (day.revenue || 0), 0) || 0;
        
        return {
          date: format(date, 'MMM yyyy'),
          orders: monthOrders,
          revenue: monthRevenue
        };
      }).reverse();
      
      dateFormat = 'MMM yyyy';
    }
    
    return chartData;
  };
  
  const salesOverTime = getSalesChartData();

  // Loading state
  const isLoading = isFoodTruckLoading || isAnalyticsLoading;
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary"></div>
      </div>
    );
  }

  // Prepare data for charts with improved visibility for dark mode
  const salesData = {
    labels: salesOverTime.map(item => item.date),
    datasets: [
      {
        label: 'Orders',
        data: salesOverTime.map(item => item.orders),
        borderColor: isDark ? 'hsl(43, 74%, 66%)' : 'rgb(53, 162, 235)', // Bright yellow in dark mode
        backgroundColor: isDark ? 'hsla(43, 74%, 66%, 0.5)' : 'rgba(53, 162, 235, 0.5)',
        borderWidth: isDark ? 3 : 2,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y',
      },
      {
        label: 'Revenue ($)',
        data: salesOverTime.map(item => item.revenue),
        borderColor: isDark ? 'hsl(173, 58%, 55%)' : 'rgb(75, 192, 192)', // Bright teal in dark mode
        backgroundColor: isDark ? 'hsla(173, 58%, 55%, 0.5)' : 'rgba(75, 192, 192, 0.5)',
        borderWidth: isDark ? 3 : 2,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1',
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTimeRange('daily')}
          className={cn(
            "rounded-full px-4 border-admin-border",
            timeRange === 'daily' ? 'bg-admin-primary text-admin-primary-foreground' : 'bg-admin-card text-admin-foreground'
          )}
        >
          Daily
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTimeRange('monthly')}
          className={cn(
            "rounded-full px-4 border-admin-border",
            timeRange === 'monthly' ? 'bg-admin-primary text-admin-primary-foreground' : 'bg-admin-card text-admin-foreground'
          )}
        >
          Monthly
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTimeRange('total')}
          className={cn(
            "rounded-full px-4 border-admin-border",
            timeRange === 'total' ? 'bg-admin-primary text-admin-primary-foreground' : 'bg-admin-card text-admin-foreground'
          )}
        >
          Total
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-admin-muted-foreground">Orders</h3>
            <p className="text-3xl font-bold text-admin-foreground">{orders}</p>
            <p className="text-sm text-admin-muted-foreground">{periodLabel}</p>
          </CardContent>
        </Card>
        <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-admin-muted-foreground">Revenue</h3>
            <p className="text-3xl font-bold text-admin-foreground">{formatCurrency(revenue)}</p>
            <p className="text-sm text-admin-muted-foreground">{periodLabel}</p>
          </CardContent>
        </Card>
        <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-admin-muted-foreground">Website Visits</h3>
            <p className="text-3xl font-bold text-admin-foreground">{views}</p>
            <p className="text-sm text-admin-muted-foreground">{periodLabel}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200 relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-lg font-medium text-admin-foreground">Sales Trends</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] sm:h-[400px]">
            {salesOverTime.length > 0 ? (
              <Line options={lineOptions} data={salesData} />
            ) : (
              <div className="border border-admin-border rounded-md p-4 h-full flex items-center justify-center bg-admin-muted">
                <p className="text-admin-muted-foreground">No sales data available yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 