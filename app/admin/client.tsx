'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { LucideShoppingCart, LucideDollarSign, LucideUsers, LucideActivity, LucideArrowUpRight, LucideCalendar, LucideX, LucideRefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { format, subDays } from "date-fns"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChecklistClient } from "./checklist-client"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { isScheduledOpen } from "@/lib/schedule-utils"
import { FormattedTimeDisplay } from "./formatted-time-display"
import { TimeAvailabilityDisplay } from "./time-availability-display"
import { StatusIndicator } from "./status-indicator"
import { createClient } from "@/utils/supabase/client"
import { useSubscription } from '@supabase-cache-helpers/postgrest-react-query'
import { reopenToday } from './actions'
import { CloseForTodayDialog } from "./close-for-today-dialog"
import { getFoodTruck, getAnalyticsData, getRecentOrders } from './clientQueries'
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from 'sonner'

// Add type definition for schedule day
interface ScheduleDay {
  day: string;
  location?: string;
  address?: string;
  hours?: string;
  openTime?: string;
  closeTime?: string;
  isClosed?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  closureTimestamp?: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email?: string;
  items: any[];
  total_amount: number;
  status: 'preparing' | 'ready' | 'completed';
  created_at: string;
  updated_at?: string;
  food_truck_id: string;
}

export default function AdminDashboardClient() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  const [checklistCompletedState, setChecklistCompletedState] = useState<boolean>(false)
  
  // Use React Query to fetch the food truck data
  const { 
    data: foodTruck, 
    isLoading: isFoodTruckLoading,
    error: foodTruckError
  } = useQuery({
    queryKey: ['foodTruck'],
    queryFn: getFoodTruck
  })
  
  // Fetch analytics data with React Query
  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    error: analyticsError
  } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAnalyticsData,
    enabled: !!foodTruck?.id
  })
  
  // Fetch orders with React Query
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
  } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: getRecentOrders,
    enabled: !!foodTruck?.id
  })
  
  // Set up Supabase realtime subscription for orders
  const { status: subscriptionStatus } = useSubscription(
    supabase,
    `orders-realtime-${foodTruck?.id || 'none'}`,
    {
      event: '*',
      table: 'Orders',
      schema: 'public',
      filter: foodTruck?.id ? `food_truck_id=eq.${foodTruck.id}` : undefined,
    },
    ['id'], // Primary key for Orders table
    { 
      callback: (payload) => {
        if (payload.eventType === 'INSERT') {
          // New order notification - optimistically update the cache
          const newOrder = payload.new as unknown as Order
          
          // Show toast notification
          toast.success(`New order received from ${newOrder.customer_name}`)
          
          // Optimistically update the order list
          queryClient.setQueryData(['orders'], (oldData: Order[] | undefined) => {
            // If there's no old data, return an array with just the new order
            if (!oldData) return [newOrder]
            
            // Otherwise, add the new order to the beginning of the array
            return [newOrder, ...oldData.slice(0, 4)]
          })
          
          // Invalidate orders query to refresh the list
          queryClient.invalidateQueries({ queryKey: ['orders'] })
        } 
        else if (payload.eventType === 'UPDATE') {
          // Status change notification
          const updatedOrder = payload.new as unknown as Order
          const oldOrder = payload.old as unknown as Order
          
          if (oldOrder.status !== updatedOrder.status) {
            // Show toast notification
            toast.info(`Order #${updatedOrder.id.substring(0, 8)} updated to ${updatedOrder.status}`)
            
            // Optimistically update the order in the list
            queryClient.setQueryData(['orders'], (oldData: Order[] | undefined) => {
              // If there's no old data, return an array with just the updated order
              if (!oldData) return [updatedOrder]
              
              // Otherwise, update the order in the array
              return oldData.map(order => 
                order.id === updatedOrder.id ? updatedOrder : order
              )
            })
            
            // Invalidate orders query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['orders'] })
          }
        }
      }
    }
  )
  
  // Set up mutations for server actions
  const reopenTodayMutation = useMutation({
    mutationFn: reopenToday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodTruck'] })
      toast.success('Food truck reopened for today')
    }
  })
  
  // Calculate metrics from analytics data
  const {
    totalOrders,
    totalRevenue,
    totalPageViews,
    ordersPercentChange,
    revenuePercentChange,
    visitsPercentChange,
    recentOrders
  } = useMemo(() => {
    const analyticsItems = analyticsData?.analyticsData || []
    
    // Calculate total orders and revenue
    const totalOrders = analyticsItems.reduce((sum, day) => sum + (day.orders_placed || 0), 0) || 0
    const totalRevenue = analyticsItems.reduce((sum, day) => sum + (day.revenue || 0), 0) || 0
    
    // Calculate total page views
    const totalPageViews = analyticsItems.reduce((sum, day) => sum + (day.page_views || 0), 0) || 0
    
    // Calculate percentage change for metrics
    const calculatePercentChange = (data: any[] | null, metric: string) => {
      if (!data || data.length < 30) return 0
      
      const currentMonth = data.slice(0, 15).reduce((sum, day) => sum + (day[metric] || 0), 0)
      const previousMonth = data.slice(15, 30).reduce((sum, day) => sum + (day[metric] || 0), 0)
      
      if (previousMonth === 0) return currentMonth > 0 ? 100 : 0
      return Math.round(((currentMonth - previousMonth) / previousMonth) * 100)
    }
    
    const ordersPercentChange = calculatePercentChange(analyticsItems, 'orders_placed')
    const revenuePercentChange = calculatePercentChange(analyticsItems, 'revenue')
    const visitsPercentChange = calculatePercentChange(analyticsItems, 'page_views')
    
    return {
      totalOrders,
      totalRevenue,
      totalPageViews,
      ordersPercentChange,
      revenuePercentChange,
      visitsPercentChange,
      recentOrders: orders || []
    }
  }, [analyticsData, orders])
  
  // Get today's schedule and check if we're currently open
  const { todaySchedule, isCurrentlyOpen } = useMemo(() => {
    // Get schedule data from configuration
    const scheduleData = foodTruck?.configuration?.schedule?.days || []
    
    // Get today's day of the week
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    
    // Find today's schedule
    const todaySchedule = scheduleData.find((day: ScheduleDay) => day.day === today)
    
    // Check if currently within operating hours
    const isCurrentlyOpen = isScheduledOpen(todaySchedule)
    
    return { todaySchedule, isCurrentlyOpen }
  }, [foodTruck])
  
  // Check if the checklist should be shown
  const { 
    showChecklist,
    checklistItems 
  } = useMemo(() => {
    if (!foodTruck) {
      return { 
        showChecklist: false, 
        checklistItems: {
          profileSetup: false,
          customColors: false,
          menuItems: false,
          stripeApiKey: false,
          customDomain: false,
          subscribed: false
        } 
      }
    }
    
    // Check individual checklist items
    const hasCustomName = foodTruck?.configuration?.name && foodTruck.configuration.name !== 'Food Truck Name'
    const hasLogo = !!foodTruck?.configuration?.logo
    const hasContactInfo = foodTruck?.configuration?.contact?.email || 
                         foodTruck?.configuration?.contact?.phone
    const hasProfileSetup = hasCustomName && (hasLogo || hasContactInfo)
    
    const hasCustomColors = (foodTruck?.configuration?.primaryColor && foodTruck.configuration.primaryColor !== '#FF6B35') || 
                          (foodTruck?.configuration?.secondaryColor && foodTruck.configuration.secondaryColor !== '#4CB944')
    
    // Check if there are any menu items
    const hasMenuItems = !!foodTruck?.has_menu_items // Assuming this property exists, or create a separate query
    
    const hasStripeApiKey = !!foodTruck?.stripe_api_key
    
    const hasCustomDomain = foodTruck?.custom_domain && 
                          !foodTruck.subdomain.startsWith('foodtruck-')
    
    const isSubscribed = !!foodTruck?.stripe_subscription_id
    
    // Calculate if all checklist items are completed
    const allChecklistItemsCompleted = !!hasProfileSetup && 
                                    !!hasCustomColors && 
                                    !!hasMenuItems && 
                                    !!hasStripeApiKey && 
                                    !!hasCustomDomain && 
                                    !!isSubscribed
    
    const checklistItems = {
      profileSetup: !!hasProfileSetup,
      customColors: !!hasCustomColors,
      menuItems: !!hasMenuItems,
      stripeApiKey: !!hasStripeApiKey,
      customDomain: !!hasCustomDomain,
      subscribed: !!isSubscribed
    }
    
    // Determine if we should show the checklist
    const showChecklist = !checklistCompletedState && !allChecklistItemsCompleted
    
    return { showChecklist, checklistItems }
  }, [foodTruck, checklistCompletedState])
  
  // Mark checklist as completed
  const markChecklistAsCompleted = async () => {
    setChecklistCompletedState(true)
    
    // Store in a cookie (this will be a client-side implementation)
    document.cookie = 'checklist_completed=true; expires=' + new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString() + '; path=/'
  }
  
  // Check for cookie on mount
  useEffect(() => {
    const checklistCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('checklist_completed='))
    
    if (checklistCookie) {
      setChecklistCompletedState(checklistCookie.split('=')[1] === 'true')
    }
  }, [])

  // Loading states
  const isLoading = isFoodTruckLoading || isAnalyticsLoading || isOrdersLoading
  
  if (isLoading) {
    return <DashboardSkeleton />
  }
  
  if (foodTruckError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-semibold">Error loading food truck data</p>
        <p>{foodTruckError instanceof Error ? foodTruckError.message : 'An unknown error occurred'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Getting Started Checklist - Only show if not completed */}
      {showChecklist && (
        <ChecklistClient 
          initialChecklist={checklistItems}
          markChecklistAsCompleted={markChecklistAsCompleted}
        />
      )}
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <LucideShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {ordersPercentChange >= 0 ? '+' : ''}{ordersPercentChange}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <LucideDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {revenuePercentChange >= 0 ? '+' : ''}{revenuePercentChange}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Website Visits</CardTitle>
            <LucideUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPageViews}</div>
            <p className="text-xs text-muted-foreground">
              {visitsPercentChange >= 0 ? '+' : ''}{visitsPercentChange}% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Daily Schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your location and hours for {new Date().toLocaleDateString('en-US', { weekday: 'long' })}</CardDescription>
          </div>
          <LucideCalendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {todaySchedule ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{todaySchedule.location || 'No location set'}</h3>
                  {todaySchedule.address && (
                    <p className="text-sm text-muted-foreground">{todaySchedule.address}</p>
                  )}
                  {todaySchedule.openTime && todaySchedule.closeTime && (
                    <p className="text-sm font-medium mt-1">Hours: <FormattedTimeDisplay 
                      openTime={todaySchedule.openTime} 
                      closeTime={todaySchedule.closeTime}
                    /></p>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <StatusIndicator 
                    isCurrentlyOpen={isCurrentlyOpen} 
                    isClosed={todaySchedule.isClosed}
                    closureTimestamp={todaySchedule.closureTimestamp}
                  />
                  <TimeAvailabilityDisplay 
                    isCurrentlyOpen={isCurrentlyOpen}
                    todaySchedule={todaySchedule}
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Add Close/Reopen Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                {todaySchedule.isClosed ? (
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    onClick={() => reopenTodayMutation.mutate()}
                    disabled={reopenTodayMutation.isPending}
                  >
                    {reopenTodayMutation.isPending ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Reopening...
                      </span>
                    ) : (
                      <>
                        <LucideRefreshCw className="w-4 h-4 mr-2" />
                        Reopen for Today
                      </>
                    )}
                  </Button>
                ) : isCurrentlyOpen ? (
                  <CloseForTodayDialog />
                ) : null}
                
                <Link href="/admin/schedule">
                  <Button className="w-full sm:w-auto" variant={todaySchedule.isClosed || isCurrentlyOpen ? "outline" : "default"}>
                    Manage Schedule
                    <LucideArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center bg-amber-100 text-amber-800 px-4 py-3 rounded-md">
                <div className="w-2 h-2 rounded-full mr-2 bg-amber-500"></div>
                <p className="text-sm">You don't have a schedule set for today ({new Date().toLocaleDateString('en-US', { weekday: 'long' })})</p>
              </div>
              <div className="text-sm text-muted-foreground">
                Set up your schedule to let customers know where to find you.
              </div>
              <Link href="/admin/schedule">
                <Button className="w-full sm:w-auto">
                  Manage Schedule
                  <LucideArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest orders and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-start justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'} - {formatCurrency(order.total_amount)}
                      </p>
                    </div>
                    <Badge variant={
                      order.status === 'completed' ? 'default' :
                      order.status === 'ready' ? 'secondary' :
                      order.status === 'preparing' ? 'outline' :
                      'secondary'
                    }>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity to display.</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// Loading skeleton for the dashboard
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Quick Stats Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Daily Schedule Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </div>
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-60 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex flex-col items-end">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            
            <Skeleton className="h-px w-full" />
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Skeleton className="h-10 w-full sm:w-40" />
              <Skeleton className="h-10 w-full sm:w-40" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start justify-between border-b pb-4">
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 