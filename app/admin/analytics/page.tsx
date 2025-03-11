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
  
  // Get orders data
  const { data: orders, count: totalOrders } = await supabase
    .from('Orders')
    .select('*', { count: 'exact' })
    .eq('food_truck_id', foodTruck.id);
  
  // Calculate total revenue
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  
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
    const dayOrders = orders?.filter(o => {
      const orderDate = new Date(o.created_at).toISOString().split('T')[0];
      return orderDate === date;
    });
    
    return {
      date: format(new Date(date), 'MMM dd'),
      orders: dayOrders?.length || 0,
      revenue: dayOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
    };
  });
  
  // Get menu items for popularity analysis
  const { data: menuItems } = await supabase
    .from('Menus')
    .select('id, name')
    .eq('food_truck_id', foodTruck.id);
  
  // Count item occurrences in orders
  const itemCounts: Record<string, number> = {};
  
  orders?.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const itemId = item.id;
        itemCounts[itemId] = (itemCounts[itemId] || 0) + 1;
      });
    }
  });
  
  // Map item IDs to names and sort by popularity
  const popularItems = Object.entries(itemCounts)
    .map(([id, count]) => ({
      name: menuItems?.find(item => item.id === id)?.name || 'Unknown Item',
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 items
  
  // Mock traffic sources data (would come from a real analytics service in production)
  const trafficSources = [
    { source: 'Direct', count: Math.floor(totalPageViews * 0.4) },
    { source: 'Social Media', count: Math.floor(totalPageViews * 0.3) },
    { source: 'Search', count: Math.floor(totalPageViews * 0.2) },
    { source: 'Referral', count: Math.floor(totalPageViews * 0.1) }
  ].filter(source => source.count > 0);
  
  // Prepare the data for the client component
  const data: AnalyticsData = {
    totalOrders: totalOrders || 0,
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