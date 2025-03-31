'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

// Publish website with optional Stripe API key setting
export async function publishWebsite(stripeApiKey?: string) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  // Prepare update data
  const updateData: { published: boolean; stripe_api_key?: string } = {
    published: true
  };
  
  // If a Stripe API key was provided, include it in the update
  if (stripeApiKey) {
    updateData.stripe_api_key = stripeApiKey;
  }
  
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
  customDomain?: string,
  subscriptionPlan?: string
) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  // Prepare update data
  const updateData: { subdomain: string; custom_domain?: string } = {
    subdomain
  };
  
  // Only include custom_domain if on pro plan
  if (subscriptionPlan === 'pro' && customDomain) {
    updateData.custom_domain = customDomain;
  }
  
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
export async function updateStripeApiKey(stripeApiKey: string) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  // Update the food truck
  const { data, error } = await supabase
    .from('FoodTrucks')
    .update({ stripe_api_key: stripeApiKey })
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