import { createClient } from "@/utils/supabase/server";
import { AnalyticsClient, AnalyticsData } from "./client";
import { format, subDays } from "date-fns";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <div>Please sign in to view analytics</div>;
  }
  
  // Get the user's food truck
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('id, subscription_plan')
    .eq('user_id', user.id)
    .single();
  
  if (!foodTruck) {
    return <div>No food truck found</div>;
  }
  
  // Get analytics data
  const { data: analyticsData } = await supabase
    .from('Analytics')
    .select('*')
    .eq('food_truck_id', foodTruck.id)
    .order('date', { ascending: false });
    console.log(analyticsData);
  
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
  
  // Prepare sales over time data
  const salesOverTime = last30Days.map(date => {
    const dayData = analyticsData?.find(d => d.date === date);
    
    return {
      date: format(new Date(date), 'MMM dd'),
      orders: dayData?.orders_placed || 0,
      revenue: dayData?.revenue || 0
    };
  });
  
  // Get menu items for popularity analysis
  const { data: menuItems } = await supabase
    .from('Menus')
    .select('id, name')
    .eq('food_truck_id', foodTruck.id);
  
  // For now, create mock popular items since we don't have item-level analytics
  // In a real implementation, you would track item-level analytics
  const popularItems = menuItems 
    ? menuItems.slice(0, 5).map((item, index) => ({
        name: item.name,
        count: Math.floor(Math.random() * 20) + 5 // Random count between 5-25
      }))
    : [];
  
  // Mock traffic sources data (would come from a real analytics service in production)
  const trafficSources = [
    { source: 'Direct', count: Math.floor(totalPageViews * 0.4) },
    { source: 'Social Media', count: Math.floor(totalPageViews * 0.3) },
    { source: 'Search', count: Math.floor(totalPageViews * 0.2) },
    { source: 'Referral', count: Math.floor(totalPageViews * 0.1) }
  ].filter(source => source.count > 0);
  
  // Prepare the data for the client component
  const data: AnalyticsData = {
    totalOrders,
    totalRevenue,
    totalPageViews,
    salesOverTime,
    popularItems,
    trafficSources,
    subscriptionPlan: foodTruck.subscription_plan
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <AnalyticsClient data={data} />
    </div>
  );
} 