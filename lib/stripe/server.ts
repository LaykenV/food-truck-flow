import Stripe from 'stripe';
import { createClient, getServiceRoleClient } from '@/utils/supabase/server';

// Initialize Stripe with latest version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

/**
 * Syncs Stripe subscription data to Supabase for a given customer
 * Follows Theo's approach of having a single function to sync all data
 * to avoid race conditions and split-brain issues
 * 
 * @param stripeCustomerId The Stripe customer ID to sync data for
 */
export async function syncStripeDataToSupabase(stripeCustomerId: string) {
  // Ensure environment variables are set
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }

  const supabase = await getServiceRoleClient();
  
  // Find the user associated with this Stripe customer ID
  const { data: userData, error: userError } = await supabase
    .from('FoodTrucks')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();
  
  if (userError) throw new Error(`Error fetching user for Stripe customer ${stripeCustomerId}: ${userError.message}`);
  
  const userId = userData.id;
  
  // Fetch latest subscription data from Stripe
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: 'all',
    limit: 1,
    expand: ['data.default_payment_method'],
  });
  
  // Get the most recent subscription
  const subscription = subscriptions.data[0];
  console.log(subscription);
  if (subscription) {
    // Extract payment method details if available
    const paymentMethod = subscription.default_payment_method as Stripe.PaymentMethod;
    const paymentMethodBrand = paymentMethod?.card?.brand || null;
    const paymentMethodLast4 = paymentMethod?.card?.last4 || null;
    
    // Use type assertion for subscription properties
    // The Stripe types might not include all available properties
    const sub = subscription as any;

    console.log(sub);

    // Convert Unix timestamps (seconds) to ISO string format for Supabase
    const currentPeriodEnd = new Date(sub.items.data[0].current_period_end * 1000).toISOString();
    const currentPeriodStart = new Date(sub.items.data[0].current_period_start * 1000).toISOString();

    // Upsert to subscriptions table
    const { error: subscriptionError } = await supabase
      .from('Subscriptions')
      .upsert({
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: currentPeriodEnd,
        current_period_start: currentPeriodStart,
        payment_method_brand: paymentMethodBrand,
        payment_method_last4: paymentMethodLast4,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'stripe_customer_id',
      });
    
    if (subscriptionError) throw new Error(`Error updating subscription: ${subscriptionError.message}`);
  } else {
    // If no subscription exists, check if there's an entry to delete
    const { error: deleteError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('stripe_customer_id', stripeCustomerId);
    
    if (deleteError) throw new Error(`Error deleting subscription: ${deleteError.message}`);
  }
  
  return { success: true };
}

/**
 * Helper function to get a stripe customer ID from a user ID
 */
export async function getStripeCustomerIdFromUserId(userId: string): Promise<string> {
  const supabase = await getServiceRoleClient();
  
  // Get stripe_customer_id
  const { data: userData, error: userError } = await supabase
    .from('FoodTrucks')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();
  
  if (userError) throw new Error(`Error fetching user: ${userError.message}`);
  
  let stripeCustomerId = userData.stripe_customer_id;

  
  // If no Stripe customer exists, create one and update the user
  if (!stripeCustomerId) {
    const  { data: { user } }  = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not found');
    
    const customer = await stripe.customers.create({
      email: user?.email,
      name: user?.user_metadata?.name,
      metadata: { userId },
    });
    
    stripeCustomerId = customer.id;
    
    // Update user with Stripe customer ID
    const { error: updateError } = await supabase
      .from('FoodTrucks')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', userId);
    
    if (updateError) throw new Error(`Error updating user: ${updateError.message}`);
  }
  
  return stripeCustomerId;
}

export { stripe }; 