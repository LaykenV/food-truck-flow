import { getFoodTruckData } from '@/lib/fetch-food-truck';
import { notFound } from 'next/navigation';

export default async function FoodTruckLayout({
  children,
  params
}: {
  children: React.ReactNode,
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
  
  return (
    <>
      {children}
    </>
  );
} 