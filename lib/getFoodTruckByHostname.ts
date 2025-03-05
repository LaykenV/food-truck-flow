import { createClient } from '@/utils/supabase/server';

export async function getFoodTruckByHostname(hostname: string, isAdmin = false) {
  // Extract subdomain from hostname (e.g., "mikes-pizza" from "mikes-pizza.foodtruckflow.com")
  let subdomain = hostname;
  
  // If it's a full domain with foodtruckflow.com, extract just the subdomain part
  if (hostname.includes('.')) {
    subdomain = hostname.split('.')[0];

    // If the first part is "localhost" or "www", then there's no subdomain
    if (subdomain === 'localhost' || subdomain === 'www') {
      return null;
    }
  }
  
  const supabase = await createClient();
  
  // Query the FoodTrucks table for the matching subdomain
  let query = supabase
    .from('FoodTrucks')
    .select('id, configuration, subscription_plan, subdomain, custom_domain, published')
    .or(`subdomain.eq."${subdomain}",custom_domain.eq."${hostname}"`)
    
  // If not in admin context, only return published food trucks
  if (!isAdmin) {
    query = query.eq('published', true);
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    console.error('Error fetching food truck:', error);
    return null;
  }
  
  return data;
} 