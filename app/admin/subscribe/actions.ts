"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";

export async function updateSubscription(plan: string) {
  if (!plan || (plan !== 'basic' && plan !== 'pro')) {
    throw new Error("Invalid plan selected");
  }
  
  // In a real implementation, this would redirect to Stripe Checkout
  // For now, we'll simulate a successful subscription by updating the database
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Get current food truck
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('subdomain')
    .eq('user_id', user.id)
    .single();
  
  // Update the food truck with a simulated subscription
  const { error } = await supabase
    .from('FoodTrucks')
    .update({
      subscription_plan: plan,
      stripe_subscription_id: `sub_${Math.random().toString(36).substring(2, 15)}`, // Simulated subscription ID
    })
    .eq('user_id', user.id);
  
  if (error) {
    throw new Error(`Error updating subscription: ${error.message}`);
  }
  
  // Invalidate server cache
  if (foodTruck?.subdomain) {
    revalidateTag(`foodTruck:${foodTruck.subdomain}`);
  }
  
  return { success: true };
}

export async function cancelSubscription() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Get current food truck
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('subdomain')
    .eq('user_id', user.id)
    .single();
  
  // Update the food truck to remove subscription
  const { error } = await supabase
    .from('FoodTrucks')
    .update({
      subscription_plan: 'none',
      stripe_subscription_id: null,
      published: false,
    })
    .eq('user_id', user.id);
  
  if (error) {
    throw new Error(`Error canceling subscription: ${error.message}`);
  }
  
  // Invalidate server cache
  if (foodTruck?.subdomain) {
    revalidateTag(`foodTruck:${foodTruck.subdomain}`);
  }
  
  return { success: true };
} 