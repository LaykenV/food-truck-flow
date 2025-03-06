import { getFoodTruckData } from '@/lib/fetch-food-truck';
import { notFound } from 'next/navigation';
import FoodTruckWebsite from '@/components/food-truck-website';

export default async function FoodTruckMenuPage({
  params
}: {
  params: { subdomain: string }
}) {
  // Get the subdomain from the params
  const { subdomain } = params;
  
  // Fetch the food truck data using the cached function
  const foodTruck = await getFoodTruckData(subdomain);
  
  // If no food truck is found, return 404
  if (!foodTruck) {
    notFound();
  }
  
  // Extract configuration data
  const config = foodTruck.configuration;
  
  // For now, we're just showing the same component
  // In the future, we'll implement proper menu page functionality
  return (
    <FoodTruckWebsite 
      config={config} 
      displayMode="liveSite" 
      subdomain={subdomain} 
    />
  );
} 