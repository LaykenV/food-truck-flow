'use server';

import { getFoodTruckData } from '@/lib/fetch-food-truck';
import { notFound } from 'next/navigation';
import { OrderConfirmationClient } from './OrderConfirmationClient';

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: { subdomain: string },
  searchParams: { id?: string }
}) {
  // Get the subdomain from the params
  const { subdomain } = params;
  const orderId = searchParams.id || null;
  
  // Fetch the food truck data using the cached function
  const foodTruck = await getFoodTruckData(subdomain);
  
  // If no food truck is found, return 404
  if (!foodTruck) {
    notFound();
  }
  
  // Extract configuration data
  const config = foodTruck.configuration || {};
  const primaryColor = config.primaryColor || '#FF6B35';
  const secondaryColor = config.secondaryColor || '#2EC4B6';
  
  return (
    <OrderConfirmationClient 
      orderId={orderId}
      subdomain={subdomain}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
    />
  );
} 