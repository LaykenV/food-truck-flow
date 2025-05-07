'use server';

import { getFoodTruckData, getFoodTruckDataByUserId } from '@/lib/fetch-food-truck';
import { notFound } from 'next/navigation';
import { OrderConfirmationClient } from './OrderConfirmationClient';
import { createClient } from '@/utils/supabase/server';

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>,
  searchParams: Promise<{ id?: string }>
}) {
  // Get the subdomain from the params
  const { subdomain } = await params;
  const { id } = await searchParams;
  const orderId = id || null;
  
  // Fetch the food truck data using the cached function
  const foodTruck = await getFoodTruckData(subdomain);
  
  // If no food truck is found after fallback, return 404
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