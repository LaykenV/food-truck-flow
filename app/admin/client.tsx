'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { LucideShoppingCart, LucideDollarSign, LucideUsers, LucideActivity, LucideArrowUpRight, LucideCalendar, LucideX, LucideRefreshCw, LucideMapPin, LucideClock } from "lucide-react"
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
import { getFoodTruck, getAnalyticsData, getRecentOrders, getMenuItems, getSubscriptionData } from './clientQueries'
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
  
  // Fetch menu items to check if any exist
  const {
    data: menuItems = [],
    isLoading: isMenuItemsLoading,
  } = useQuery({
    queryKey: ['menuItems'],
    queryFn: getMenuItems,
    enabled: !!foodTruck?.id
  })

  // Fetch subscription data with React Query
  const {
    data: subscriptionData,
    isLoading: isSubscriptionLoading,
    error: subscriptionError
  } = useQuery({
    queryKey: ['subscriptionData'],
    queryFn: getSubscriptionData,
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
    lastThirtyDaysOrders,
    lastThirtyDaysRevenue,
    lastThirtyDaysPageViews,
    ordersPercentChange,
    revenuePercentChange,
    visitsPercentChange,
    recentOrders
  } = useMemo(() => {
    const analyticsItems = analyticsData?.analyticsData || []
    
    // Get only the last 30 days of data for totals
    const last30Days = analyticsItems.slice(0, 30)
    
    // Calculate last 30 days orders and revenue
    const lastThirtyDaysOrders = last30Days.reduce((sum, day) => sum + (day.orders_placed || 0), 0) || 0
    const lastThirtyDaysRevenue = last30Days.reduce((sum, day) => sum + (day.revenue || 0), 0) || 0
    
    // Calculate last 30 days page views
    const lastThirtyDaysPageViews = last30Days.reduce((sum, day) => sum + (day.page_views || 0), 0) || 0
    
    // Calculate percentage change for metrics (last 30 days vs previous 30 days)
    const calculatePercentChange = (data: any[] | null, metric: string) => {
      if (!data || data.length === 0) return 0
      
      // Determine how many days of data we have to work with
      const daysAvailable = data.length
      
      // If we have at least 60 days, compare last 30 vs previous 30
      if (daysAvailable >= 60) {
        const current30Days = data.slice(0, 30).reduce((sum, day) => sum + (day[metric] || 0), 0)
        const previous30Days = data.slice(30, 60).reduce((sum, day) => sum + (day[metric] || 0), 0)
        console.log(`${metric} - current30Days:`, current30Days)
        console.log(`${metric} - previous30Days:`, previous30Days)
        
        if (previous30Days === 0) return current30Days > 0 ? 100 : 0
        return Math.round(((current30Days - previous30Days) / previous30Days) * 100)
      } 
      // If we have between 30 and 59 days, compare half and half
      else if (daysAvailable >= 30) {
        const halfPoint = Math.floor(daysAvailable / 2)
        const current = data.slice(0, halfPoint).reduce((sum, day) => sum + (day[metric] || 0), 0)
        const previous = data.slice(halfPoint).reduce((sum, day) => sum + (day[metric] || 0), 0)
        console.log(`${metric} - current (${halfPoint} days):`, current)
        console.log(`${metric} - previous (${daysAvailable - halfPoint} days):`, previous)
        
        if (previous === 0) return current > 0 ? 100 : 0
        return Math.round(((current - previous) / previous) * 100)
      }
      // If we have less than 30 days, just return 0 (not enough data)
      else {
        console.log(`Not enough data for ${metric} percent change (only ${daysAvailable} days)`)
        return 0
      }
    }
    
    const ordersPercentChange = calculatePercentChange(analyticsItems, 'orders_placed')
    const revenuePercentChange = calculatePercentChange(analyticsItems, 'revenue')
    const visitsPercentChange = calculatePercentChange(analyticsItems, 'page_views')
    
    return {
      lastThirtyDaysOrders,
      lastThirtyDaysRevenue,
      lastThirtyDaysPageViews,
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
    
    // Check if there are any menu items using the fetched data
    const hasMenuItems = menuItems.length > 0
    
    const hasCustomDomain = foodTruck?.custom_domain || !foodTruck.subdomain.startsWith('foodtruck-')
    
    const isSubscribed = subscriptionData?.status === 'active'
    
    // Calculate if all checklist items are completed
    const allChecklistItemsCompleted = !!hasProfileSetup && 
                                    !!hasCustomColors && 
                                    !!hasMenuItems && 
                                    !!hasCustomDomain && 
                                    !!isSubscribed
    
    const checklistItems = {
      profileSetup: !!hasProfileSetup,
      customColors: !!hasCustomColors,
      menuItems: !!hasMenuItems,
      customDomain: !!hasCustomDomain,
      subscribed: !!isSubscribed
    }
    
    // Determine if we should show the checklist
    const showChecklist = !checklistCompletedState && !allChecklistItemsCompleted
    
    return { showChecklist, checklistItems }
  }, [foodTruck, checklistCompletedState, menuItems])
  
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
  const isLoading = isFoodTruckLoading || isAnalyticsLoading || isOrdersLoading || isMenuItemsLoading
  
  if (isLoading) {
    return <DashboardSkeleton />
  }
  
  if (foodTruckError) {
    return (
      <div className="bg-admin-destructive/10 border border-admin-destructive/30 text-admin-destructive px-4 py-3 rounded-lg shadow-sm">
        <p className="font-medium">Error loading food truck data</p>
        <p className="text-sm mt-1">{foodTruckError instanceof Error ? foodTruckError.message : 'An unknown error occurred'}</p>
      </div>
    )
  }

  // Only show checklist if not completed
  if (showChecklist) {
    return (
      <div className="space-y-6">
        <ChecklistClient 
          initialChecklist={checklistItems}
          markChecklistAsCompleted={markChecklistAsCompleted}
        />
      </div>
    )
  }

  // If checklist is complete, show the full dashboard
  return (
    <div className="space-y-6">
      {/* Quick Stats - Responsive for both mobile and desktop */}
      <div className="grid grid-cols-1 gap-4">
        {/* Mobile Compact Stats Card */}
        <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200 md:hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-admin-primary/10 flex items-center justify-center">
                <LucideActivity className="h-3.5 w-3.5 text-admin-primary" />
              </div>
              <CardTitle className="text-sm font-medium text-admin-card-foreground">30-Day Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-3 divide-x divide-admin-border">
              {/* Orders */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-admin-muted-foreground">Orders</span>
                  <div className="h-5 w-5 rounded-full bg-admin-primary/10 flex items-center justify-center">
                    <LucideShoppingCart className="h-3 w-3 text-admin-primary" />
                  </div>
                </div>
                <div className="text-lg font-bold text-admin-foreground">{lastThirtyDaysOrders}</div>
                <div className="flex items-center mt-1">
                  <Badge 
                    variant={ordersPercentChange >= 0 ? "admin" : "outline"} 
                    className={`text-xs font-normal px-1 ${ordersPercentChange >= 0 ? "" : "text-admin-destructive"}`}
                  >
                    {ordersPercentChange >= 0 ? '+' : ''}{ordersPercentChange}%
                  </Badge>
                </div>
              </div>

              {/* Revenue */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-admin-muted-foreground">Revenue</span>
                  <div className="h-5 w-5 rounded-full bg-admin-primary/10 flex items-center justify-center">
                    <LucideDollarSign className="h-3 w-3 text-admin-primary" />
                  </div>
                </div>
                <div className="text-lg font-bold text-admin-foreground">{formatCurrency(lastThirtyDaysRevenue)}</div>
                <div className="flex items-center mt-1">
                  <Badge 
                    variant={revenuePercentChange >= 0 ? "admin" : "outline"} 
                    className={`text-xs font-normal px-1 ${revenuePercentChange >= 0 ? "" : "text-admin-destructive"}`}
                  >
                    {revenuePercentChange >= 0 ? '+' : ''}{revenuePercentChange}%
                  </Badge>
                </div>
              </div>

              {/* Visits */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-admin-muted-foreground">Visits</span>
                  <div className="h-5 w-5 rounded-full bg-admin-primary/10 flex items-center justify-center">
                    <LucideUsers className="h-3 w-3 text-admin-primary" />
                  </div>
                </div>
                <div className="text-lg font-bold text-admin-foreground">{lastThirtyDaysPageViews}</div>
                <div className="flex items-center mt-1">
                  <Badge 
                    variant={visitsPercentChange >= 0 ? "admin" : "outline"} 
                    className={`text-xs font-normal px-1 ${visitsPercentChange >= 0 ? "" : "text-admin-destructive"}`}
                  >
                    {visitsPercentChange >= 0 ? '+' : ''}{visitsPercentChange}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desktop Expanded Stats Cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-4">
          {/* Orders */}
          <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-admin-card-foreground">Last 30 Days Orders</CardTitle>
              <div className="h-8 w-8 rounded-full bg-admin-primary/10 flex items-center justify-center">
                <LucideShoppingCart className="h-4 w-4 text-admin-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-admin-foreground">{lastThirtyDaysOrders}</div>
              <div className="flex items-center mt-1">
                <Badge 
                  variant={ordersPercentChange >= 0 ? "admin" : "outline"} 
                  className={`text-xs font-normal ${ordersPercentChange >= 0 ? "" : "text-admin-destructive"}`}
                >
                  {ordersPercentChange >= 0 ? '+' : ''}{ordersPercentChange}%
                </Badge>
                <span className="text-xs text-admin-muted-foreground ml-2">vs previous 30 days</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Revenue */}
          <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-admin-card-foreground">Last 30 Days Revenue</CardTitle>
              <div className="h-8 w-8 rounded-full bg-admin-primary/10 flex items-center justify-center">
                <LucideDollarSign className="h-4 w-4 text-admin-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-admin-foreground">{formatCurrency(lastThirtyDaysRevenue)}</div>
              <div className="flex items-center mt-1">
                <Badge 
                  variant={revenuePercentChange >= 0 ? "admin" : "outline"} 
                  className={`text-xs font-normal ${revenuePercentChange >= 0 ? "" : "text-admin-destructive"}`}
                >
                  {revenuePercentChange >= 0 ? '+' : ''}{revenuePercentChange}%
                </Badge>
                <span className="text-xs text-admin-muted-foreground ml-2">vs previous 30 days</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Visits */}
          <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-admin-card-foreground">Last 30 Days Visits</CardTitle>
              <div className="h-8 w-8 rounded-full bg-admin-primary/10 flex items-center justify-center">
                <LucideUsers className="h-4 w-4 text-admin-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-admin-foreground">{lastThirtyDaysPageViews}</div>
              <div className="flex items-center mt-1">
                <Badge 
                  variant={visitsPercentChange >= 0 ? "admin" : "outline"} 
                  className={`text-xs font-normal ${visitsPercentChange >= 0 ? "" : "text-admin-destructive"}`}
                >
                  {visitsPercentChange >= 0 ? '+' : ''}{visitsPercentChange}%
                </Badge>
                <span className="text-xs text-admin-muted-foreground ml-2">vs previous 30 days</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Daily Schedule */}
      <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg font-semibold text-admin-card-foreground">Today's Schedule</CardTitle>
            <CardDescription className="text-admin-muted-foreground">Your location and hours for {new Date().toLocaleDateString('en-US', { weekday: 'long' })}</CardDescription>
          </div>
          <div className="h-8 w-8 rounded-full bg-admin-primary/10 flex items-center justify-center">
            <LucideCalendar className="h-4 w-4 text-admin-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {todaySchedule ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <LucideMapPin className="h-4 w-4 text-admin-primary" />
                    <h3 className="font-medium text-admin-foreground">{todaySchedule.location || 'No location set'}</h3>
                  </div>
                  {todaySchedule.address && (
                    <p className="text-sm text-admin-muted-foreground ml-6">{todaySchedule.address}</p>
                  )}
                  {todaySchedule.openTime && todaySchedule.closeTime && (
                    <div className="flex items-center gap-2 ml-0">
                      <LucideClock className="h-4 w-4 text-admin-primary" />
                      <p className="text-sm font-medium text-admin-foreground">
                        <FormattedTimeDisplay 
                          openTime={todaySchedule.openTime} 
                          closeTime={todaySchedule.closeTime}
                        />
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start md:items-end gap-1">
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
              
              <Separator className="bg-admin-border/50" />
              
              {/* Add Close/Reopen Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                {todaySchedule.isClosed ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-admin-primary to-[hsl(var(--admin-gradient-end))] text-admin-primary-foreground hover:opacity-90" 
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
                
                <Button className="w-full sm:w-auto" variant={todaySchedule.isClosed || isCurrentlyOpen ? "admin-outline" : "admin"} asChild>
                  <Link href="/admin/schedule" className="inline-flex items-center">
                    Manage Schedule
                    <LucideArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 px-4 py-3 rounded-md">
                <div className="w-2 h-2 rounded-full mr-2 bg-amber-500"></div>
                <p className="text-sm">You don't have a schedule set for today ({new Date().toLocaleDateString('en-US', { weekday: 'long' })})</p>
              </div>
              <div className="text-sm text-admin-muted-foreground">
                Set up your schedule to let customers know where to find you.
              </div>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-admin-primary to-[hsl(var(--admin-gradient-end))] text-admin-primary-foreground hover:opacity-90" asChild>
                <Link href="/admin/schedule" className="inline-flex items-center">
                  Manage Schedule
                  <LucideArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg font-semibold text-admin-card-foreground">Recent Activity</CardTitle>
            <CardDescription className="text-admin-muted-foreground">Your latest orders and updates</CardDescription>
          </div>
          <div className="h-8 w-8 rounded-full bg-admin-primary/10 flex items-center justify-center">
            <LucideActivity className="h-4 w-4 text-admin-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[350px] md:h-[400px] pr-4">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-start justify-between border-b border-admin-border pb-4 group hover:bg-admin-accent/5 p-2 -mx-2 rounded-md transition-colors duration-200">
                    <div>
                      <p className="font-medium text-admin-foreground">{order.customer_name}</p>
                      <p className="text-xs text-admin-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-admin-foreground">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                        <div className="w-1 h-1 rounded-full bg-admin-muted-foreground/50"></div>
                        <p className="text-sm font-medium text-admin-foreground">{formatCurrency(order.total_amount)}</p>
                      </div>
                    </div>
                    <Badge variant={
                      order.status === 'completed' ? 'default' :
                      order.status === 'ready' ? 'secondary' :
                      order.status === 'preparing' ? 'outline' :
                      'secondary'
                    } className="group-hover:bg-opacity-100 transition-colors duration-200">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="h-12 w-12 rounded-full bg-admin-secondary flex items-center justify-center mb-3">
                  <LucideShoppingCart className="h-6 w-6 text-admin-muted-foreground" />
                </div>
                <p className="text-admin-muted-foreground">No recent orders to display</p>
                <p className="text-xs text-admin-muted-foreground mt-1">Orders will appear here when customers place them</p>
              </div>
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
      <div className="grid grid-cols-1 gap-4">
        {/* Mobile Compact Stats Card */}
        <Card className="border border-admin-border/30 bg-admin-card/50 shadow-sm overflow-hidden md:hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full bg-admin-accent/10" />
              <Skeleton className="h-5 w-32 bg-admin-accent/10" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-3 divide-x divide-admin-border/30">
              {/* Orders */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <Skeleton className="h-3 w-12 bg-admin-accent/10" />
                  <Skeleton className="h-5 w-5 rounded-full bg-admin-accent/10" />
                </div>
                <Skeleton className="h-6 w-12 mb-2 bg-admin-accent/10" />
                <Skeleton className="h-4 w-10 bg-admin-accent/10" />
              </div>
              
              {/* Revenue Stats Skeleton */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <Skeleton className="h-3 w-12 bg-admin-accent/10" />
                  <Skeleton className="h-5 w-5 rounded-full bg-admin-accent/10" />
                </div>
                <Skeleton className="h-6 w-14 mb-2 bg-admin-accent/10" />
                <Skeleton className="h-4 w-10 bg-admin-accent/10" />
              </div>
              
              {/* Visits Stats Skeleton */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <Skeleton className="h-3 w-12 bg-admin-accent/10" />
                  <Skeleton className="h-5 w-5 rounded-full bg-admin-accent/10" />
                </div>
                <Skeleton className="h-6 w-12 mb-2 bg-admin-accent/10" />
                <Skeleton className="h-4 w-10 bg-admin-accent/10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desktop Expanded Stats Cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-admin-border/30 bg-admin-card/50 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-32 bg-admin-accent/10" />
                <Skeleton className="h-8 w-8 rounded-full bg-admin-accent/10" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2 bg-admin-accent/10" />
                <Skeleton className="h-5 w-40 bg-admin-accent/10" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Daily Schedule Skeleton */}
      <Card className="border border-admin-border/30 bg-admin-card/50 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <Skeleton className="h-6 w-40 mb-2 bg-admin-accent/10" />
            <Skeleton className="h-4 w-60 bg-admin-accent/10" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full bg-admin-accent/10" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-5 w-40 mb-2 bg-admin-accent/10" />
                <Skeleton className="h-4 w-60 mb-2 bg-admin-accent/10" />
                <Skeleton className="h-4 w-32 bg-admin-accent/10" />
              </div>
              <div className="flex flex-col items-end">
                <Skeleton className="h-6 w-24 mb-2 bg-admin-accent/10" />
                <Skeleton className="h-4 w-32 bg-admin-accent/10" />
              </div>
            </div>
            
            <Skeleton className="h-px w-full bg-admin-accent/10" />
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Skeleton className="h-10 w-full sm:w-40 bg-admin-accent/10" />
              <Skeleton className="h-10 w-full sm:w-40 bg-admin-accent/10" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity Skeleton */}
      <Card className="border border-admin-border/30 bg-admin-card/50 shadow-sm overflow-hidden">
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2 bg-admin-accent/10" />
          <Skeleton className="h-4 w-60 bg-admin-accent/10" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start justify-between border-b border-admin-border/30 pb-4">
                <div>
                  <Skeleton className="h-5 w-32 mb-2 bg-admin-accent/10" />
                  <Skeleton className="h-4 w-40 mb-2 bg-admin-accent/10" />
                  <Skeleton className="h-4 w-24 bg-admin-accent/10" />
                </div>
                <Skeleton className="h-6 w-20 bg-admin-accent/10" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 