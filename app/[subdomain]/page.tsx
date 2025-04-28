import { getFoodTruckData, getFoodTruckDataByUserId } from '@/lib/fetch-food-truck';
import { notFound } from 'next/navigation';
import FoodTruckTemplate from '@/components/FoodTruckTemplate';
import { createClient } from '@/utils/supabase/server';
export default async function FoodTruckHomePage({
  params
}: {
  params: { subdomain: string }
}) {
  // Get the subdomain from the params
  const { subdomain } = await params;
  
  // Fetch the food truck data using the cached function
  let foodTruck = await getFoodTruckData(subdomain);
  
  // If no food truck is found, return 404
  if (!foodTruck) {
    console.log('No food truck found, trying to get food truck by user id');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log('User:', user);
    if (user) {
      console.log('User found, getting food truck by user id');
      foodTruck = await getFoodTruckDataByUserId(user.id);
      console.log('Food truck:', foodTruck);
    }
    if (!foodTruck) {
      console.log('No food truck found, returning 404');
      notFound();
    }
  }
  
  // Extract configuration data
  const config = foodTruck?.configuration;
  console.log('Config2:', config);
  return (
    <FoodTruckTemplate 
      config={config} 
      displayMode="live" 
      subdomain={subdomain} 
    />
  );
} 