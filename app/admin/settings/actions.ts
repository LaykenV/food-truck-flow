'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

// --- Subdomain Validation Helpers ---
const RESERVED_SUBDOMAINS: Set<string> = new Set([
  'www', 'admin', 'demo'
]);

function isValidSubdomainFormat(subdomain: string): boolean {
  if (!subdomain || subdomain.length < 3 || subdomain.length > 63) {
    return false;
  }
  if (!/^[a-z0-9-]+$/.test(subdomain)) { // Ensure lowercase check as it's normalized
    return false;
  }
  if (/^-|-$|--/.test(subdomain)) {
    return false;
  }
  return true;
}

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
  subdomainInput: string, 
  customDomain?: string
) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }

  // 1. Normalization
  const normalizedSubdomain = subdomainInput.toLowerCase();

  // 2. Re-validate Client-Side Rules (Server-Side)
  if (!isValidSubdomainFormat(normalizedSubdomain)) {
    throw new Error(
      "Invalid subdomain format. Subdomains must be 3-63 characters, contain only letters, numbers, or hyphens, and not start/end with or have consecutive hyphens."
    );
  }

  // 3. Reserved Names Check
  if (RESERVED_SUBDOMAINS.has(normalizedSubdomain)) {
    throw new Error(`Subdomain '${normalizedSubdomain}' is reserved. Please choose another.`);
  }

  // 4. Uniqueness Check (Database Query)
  try {
    const { data: existingSubdomainData, error: queryError } = await supabase
      .from('FoodTrucks')
      .select('id, user_id')
      .eq('subdomain', normalizedSubdomain)
      .maybeSingle();

    if (queryError) {
      console.error("Supabase query error during subdomain uniqueness check:", queryError);
      throw new Error("Failed to validate subdomain due to a server error.");
    }

    if (existingSubdomainData && existingSubdomainData.user_id !== user.id) {
      throw new Error(`Subdomain '${normalizedSubdomain}' is already taken. Please choose another.`);
    }
  } catch (e: any) {
    if (e instanceof Error && (e.message.startsWith("Subdomain '") || e.message.startsWith("Failed to validate subdomain"))) {
      throw e; // Re-throw specific errors
    }
    console.error("Error during subdomain uniqueness check:", e);
    throw new Error("An unexpected error occurred while checking subdomain availability.");
  }
  
  // Prepare update data
  const updateData: { subdomain: string; custom_domain?: string | null } = {
    subdomain: normalizedSubdomain, // Use normalized subdomain
  };

  // 5. Custom Domain Handling
  if (customDomain !== undefined) { // Check if customDomain was actually passed
    updateData.custom_domain = customDomain === '' ? null : customDomain;
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