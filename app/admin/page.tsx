import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LucideShoppingCart, LucideDollarSign, LucideUsers, LucideActivity, LucideArrowUpRight, LucideCalendar, LucideX, LucideRefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { format, subDays } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChecklistClient } from "./checklist-client";
import { Separator } from "@/components/ui/separator";
import { revalidatePath } from "next/cache";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { isScheduledOpenServer, getTodayScheduleServer } from "@/lib/schedule-utils-server";
import { FormattedTimeDisplay } from "./formatted-time-display";
import { TimeAvailabilityDisplay } from "./time-availability-display";
import { StatusIndicator } from "./status-indicator";
import { reopenToday, resetOutdatedClosures } from "./actions";
import { CloseForTodayDialog } from "./close-for-today-dialog";

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

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch food truck data
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('*')
    .eq('user_id', user?.id)
    .single();
  
  // Automatically reset any outdated closures
  if (foodTruck) {
    await resetOutdatedClosures(foodTruck);
  }
  
  // Fetch menu items to check if any exist
  const { data: menuItems } = await supabase
    .from('Menus')
    .select('id')
    .eq('food_truck_id', foodTruck?.id)
    .limit(1);
  
  const isSubscribed = !!foodTruck?.stripe_subscription_id;
  
  // Check if the checklist should be shown
  // Get the cookie that tracks if the checklist has been completed
  const cookieStore = await cookies();
  const checklistCompletedCookie = cookieStore.get('checklist_completed');
  const checklistCompleted = checklistCompletedCookie?.value === 'true';
  
  // Check if all items are completed
  const hasCustomName = foodTruck?.configuration?.name && foodTruck.configuration.name !== 'Food Truck Name';
  const hasLogo = !!foodTruck?.configuration?.logo;
  const hasContactInfo = foodTruck?.configuration?.contact?.email || 
                         foodTruck?.configuration?.contact?.phone;
  const hasProfileSetup = hasCustomName && (hasLogo || hasContactInfo);
  
  const hasCustomColors = (foodTruck?.configuration?.primaryColor && foodTruck.configuration.primaryColor !== '#FF6B35') || 
                          (foodTruck?.configuration?.secondaryColor && foodTruck.configuration.secondaryColor !== '#4CB944');
  
  const hasMenuItems = menuItems && menuItems.length > 0;
  
  const hasStripeApiKey = !!foodTruck?.stripe_api_key;
  
  const hasCustomDomain = foodTruck?.custom_domain && 
                          !foodTruck.subdomain.startsWith('foodtruck-');
  
  // Calculate if all checklist items are completed
  const allChecklistItemsCompleted = !!hasProfileSetup && 
                                    !!hasCustomColors && 
                                    !!hasMenuItems && 
                                    !!hasStripeApiKey && 
                                    !!hasCustomDomain && 
                                    !!isSubscribed;
  
  // If all items are completed but the cookie isn't set, set it now
  if (allChecklistItemsCompleted && !checklistCompleted) {
    cookieStore.set('checklist_completed', 'true', { 
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
      path: '/' 
    });
  }
  
  // Function to mark checklist as completed (will be called client-side)
  async function markChecklistAsCompleted() {
    'use server'
    const cookieStore = await cookies();
    cookieStore.set('checklist_completed', 'true', { 
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
      path: '/' 
    });
  }
  
  // Fetch analytics data for the dashboard
  // Get analytics data
  const { data: analyticsData } = await supabase
    .from('Analytics')
    .select('*')
    .eq('food_truck_id', foodTruck?.id)
    .order('date', { ascending: false });
  
  // Calculate total orders and revenue directly from analytics data
  const totalOrders = analyticsData?.reduce((sum, day) => sum + (day.orders_placed || 0), 0) || 0;
  const totalRevenue = analyticsData?.reduce((sum, day) => sum + (day.revenue || 0), 0) || 0;
  
  // Calculate total page views
  const totalPageViews = analyticsData?.reduce((sum, day) => sum + (day.page_views || 0), 0) || 0;
  
  // Generate dates for the last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  }).reverse();
  
  // Calculate percentage change for metrics
  const calculatePercentChange = (data: any[] | null, metric: string) => {
    if (!data || data.length < 30) return 0;
    
    const currentMonth = data.slice(0, 15).reduce((sum, day) => sum + (day[metric] || 0), 0);
    const previousMonth = data.slice(15, 30).reduce((sum, day) => sum + (day[metric] || 0), 0);
    
    if (previousMonth === 0) return currentMonth > 0 ? 100 : 0;
    return Math.round(((currentMonth - previousMonth) / previousMonth) * 100);
  };
  
  const ordersPercentChange = calculatePercentChange(analyticsData, 'orders_placed');
  const revenuePercentChange = calculatePercentChange(analyticsData, 'revenue');
  const visitsPercentChange = calculatePercentChange(analyticsData, 'page_views');
  
  // Fetch recent orders for the activity feed
  const { data: recentOrders } = await supabase
    .from('Orders')
    .select('*')
    .eq('food_truck_id', foodTruck?.id)
    .order('created_at', { ascending: false })
    .limit(5);
  
  // Get schedule data from configuration
  const scheduleData = foodTruck?.configuration?.schedule?.days || [];
  
  // Get today's day of the week
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  // Find today's schedule
  const todaySchedule = scheduleData.find((day: ScheduleDay) => day.day === today);
  
  // Check if currently within operating hours
  const isCurrentlyOpen = isScheduledOpenServer(todaySchedule);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <SidebarTrigger className="md:hidden" />
      </div>
      
      {/* Getting Started Checklist - Only show if not completed */}
      {!checklistCompleted && (
        <ChecklistClient 
          initialChecklist={{
            profileSetup: !!hasProfileSetup,
            customColors: !!hasCustomColors,
            menuItems: !!hasMenuItems,
            stripeApiKey: !!hasStripeApiKey,
            customDomain: !!hasCustomDomain,
            subscribed: !!isSubscribed
          }}
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
            <CardDescription>Your location and hours for {today}</CardDescription>
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
                  <form action={reopenToday}>
                    <Button className="w-full" variant="outline">
                      <LucideRefreshCw className="w-4 h-4 mr-2" />
                      Reopen for Today
                    </Button>
                  </form>
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
                <p className="text-sm">You don't have a schedule set for today ({today})</p>
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
          <CardDescription>Your latest website and order activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <ScrollArea className="h-[300px]">
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
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity to display.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
