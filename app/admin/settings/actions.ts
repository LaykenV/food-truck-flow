'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

// Publish website with optional Stripe API key setting
export async function publishWebsite() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  // Prepare update data
  const updateData: { published: boolean } = {
    published: true
  };
  
  // Update the food truck
  const { data, error } = await supabase
    .from('FoodTrucks')
    .update(updateData)
    .eq('user_id', user.id)
    .select('subdomain')
    .single();
    
  if (error) {
    throw new Error(`Failed to publish website: ${error.message}`);
  }
  
  // Invalidate the cache
  if (data?.subdomain) {
    revalidateTag(`foodTruck:${data.subdomain}`);
  }
  
  return data;
}

// Update domain settings
export async function updateDomainSettings(
  subdomain: string, 
  customDomain?: string
) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  // Prepare update data
  const updateData: { subdomain: string; custom_domain?: string } = {
    subdomain,
  };
  
  // Update the food truck
  const { data, error } = await supabase
    .from('FoodTrucks')
    .update(updateData)
    .eq('user_id', user.id)
    .select('subdomain')
    .single();
    
  if (error) {
    throw new Error(`Failed to update domain settings: ${error.message}`);
  }
  
  // Invalidate the cache
  if (data?.subdomain) {
    revalidateTag(`foodTruck:${data.subdomain}`);
  }
  
  return data;
}

// Update Stripe API key
export async function updateStripeApiKey(apiKey: string) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  // Update the food truck
  const { data, error } = await supabase
    .from('FoodTrucks')
    .update({ stripe_api_key: apiKey })
    .eq('user_id', user.id)
    .select('subdomain')
    .single();
    
  if (error) {
    throw new Error(`Failed to update Stripe API key: ${error.message}`);
  }
  
  // Invalidate the cache
  if (data?.subdomain) {
    revalidateTag(`foodTruck:${data.subdomain}`);
  }
  
  return data;
} 