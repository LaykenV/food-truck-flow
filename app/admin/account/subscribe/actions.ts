"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { stripe, getStripeCustomerIdFromUserId, syncStripeDataToSupabase } from "@/lib/stripe/server";
import { headers } from "next/headers";
import { toast } from "sonner";

// Define price IDs for different plans
const PRICE_IDS = {
  basic: process.env.STRIPE_BASIC_PRICE_ID_LIVE as string,
  pro: process.env.STRIPE_PRO_PRICE_ID as string,
};

export async function updateSubscription(plan: string) {
  // Validate plan selection
  if (!plan || !PRICE_IDS[plan as keyof typeof PRICE_IDS]) {
    throw new Error("Invalid plan selected");
  }
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Get current food truck
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('id, subdomain')
    .eq('user_id', user.id)
    .single();
  
  if (!foodTruck) {
    throw new Error("Food truck not found");
  }
  
  // Get or create Stripe customer ID
  const stripeCustomerId = await getStripeCustomerIdFromUserId(foodTruck.id, user.email || '', user.user_metadata.name || '');
  
  // Get the price ID for the selected plan
  const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS];
  
  // Create a checkout session
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/account/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/account/subscribe`,
    metadata: {
      foodTruckId: foodTruck.id,
    },
  });
  
  // Return session url for redirecting on the client
  return { sessionUrl: session.url };
}

export async function createBillingPortalSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Get current food truck
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('id')
    .eq('user_id', user.id)
    .single();
  
  if (!foodTruck) {
    throw new Error("Food truck not found");
  }
  
  // Get Stripe customer ID
  const stripeCustomerId = await getStripeCustomerIdFromUserId(foodTruck.id, user.email || '', user.user_metadata.name || '');
  
  // Create a billing portal session
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/account`,
  });
  
  return { url: portalSession.url };
}

export async function getSubscriptionDataWithPlan() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Get the food truck with stripe_customer_id
  const { data: foodTruck, error: foodTruckError } = await supabase
    .from('FoodTrucks')
    .select('id, stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (foodTruckError || !foodTruck) {
    throw new Error('Food truck not found');
  }

  // If no stripe_customer_id, return default "none" status
  if (!foodTruck.stripe_customer_id) {
    return { status: "none", planName: "none" };
  }

  // Fetch subscription data
  const { data: subscription, error: subscriptionError } = await supabase
    .from('Subscriptions')
    .select('*')
    .eq('stripe_customer_id', foodTruck.stripe_customer_id)
    .single();

  if (subscriptionError || !subscription) {
    return { status: "none", planName: "none" };
  }

  // Determine plan name based on server environment variables
  let planName = 'none';
  const basicPriceId = process.env.STRIPE_BASIC_PRICE_ID_LIVE;
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;

  if (subscription.price_id === basicPriceId) {
    planName = 'basic';
  } else if (subscription.price_id === proPriceId) {
    planName = 'pro';
  }

  // Return formatted subscription data with planName
  return {
    subscriptionId: subscription.stripe_subscription_id,
    status: subscription.status,
    priceId: subscription.price_id,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodEnd: subscription.current_period_end,
    currentPeriodStart: subscription.current_period_start,
    paymentMethod: {
      brand: subscription.payment_method_brand,
      last4: subscription.payment_method_last4
    },
    planName: planName
  };
} 