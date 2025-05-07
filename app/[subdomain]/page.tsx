import { getFoodTruckData, getFoodTruckDataByUserId } from '@/lib/fetch-food-truck';
import { notFound } from 'next/navigation';
import FoodTruckTemplate from '@/components/FoodTruckTemplate';
import { createClient } from '@/utils/supabase/server';
export default async function FoodTruckHomePage({
  params
}: {
  params: Promise<{ subdomain: string }>
}) {
  // Get the subdomain from the params
  const { subdomain } = await params;
  
  // Fetch the food truck data using the cached function
  let foodTruck = await getFoodTruckData(subdomain);
  
  if (!foodTruck) {
    notFound();
  }
  
  // Extract configuration data
  const config = foodTruck?.configuration;
  console.log('Config2:', config);
  return (
    <FoodTruckTemplate 
      config={config} 
      displayMode="live" 
      subdomain={subdomain} 
      isPublished={foodTruck?.published}
    />
  );
} 