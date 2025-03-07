import { getFoodTruckData } from '@/lib/fetch-food-truck';
import { notFound } from 'next/navigation';
import FoodTruckTemplate from '@/components/FoodTruckTemplate';

export default async function FoodTruckHomePage({
  params
}: {
  params: { subdomain: string }
}) {
  // Get the subdomain from the params
  const { subdomain } = await params;
  
  // Fetch the food truck data using the cached function
  const foodTruck = await getFoodTruckData(subdomain);
  
  // If no food truck is found, return 404
  if (!foodTruck) {
    notFound();
  }
  
  // Extract configuration data
  const config = foodTruck.configuration;
  
  return (
    <FoodTruckTemplate 
      config={config} 
      displayMode="live" 
      subdomain={subdomain} 
    />
  );
} 