import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch the user's food truck
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('*')
    .eq('user_id', user?.id)
    .single();
  
  const isPublished = foodTruck?.published || false;
  const hasStripeKey = !!foodTruck?.stripe_api_key;
  const hasSubscription = !!foodTruck?.stripe_subscription_id;
  
  // Add this publish function
  async function publishWebsite(formData: FormData) {
    'use server'
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Instead of returning an error object, we'll just return
      return;
    }
    
    // Fetch the food truck to check subscription and API key
    const { data: foodTruck } = await supabase
      .from('FoodTrucks')
      .select('stripe_subscription_id, stripe_api_key')
      .eq('user_id', user.id)
      .single();
    
    // Check if user has a subscription
    if (!foodTruck?.stripe_subscription_id) {
      redirect('/admin/subscribe');
    }
    
    // Check if user has set up their Stripe API key
    if (!foodTruck?.stripe_api_key) {
      // If they submitted the API key in this form, save it
      const stripeApiKey = formData.get('stripeApiKey') as string;
      if (stripeApiKey) {
        const { error } = await supabase
          .from('FoodTrucks')
          .update({ 
            stripe_api_key: stripeApiKey,
            published: true 
          })
          .eq('user_id', user.id);
          
        if (error) {
          // Instead of returning an error object, we'll just return
          return;
        }
        // Instead of returning a success object, we'll just return
        return;
      } else {
        // Instead of returning an error object, we'll just return
        return;
      }
    }
    
    // If they have both subscription and API key, publish the website
    const { error } = await supabase
      .from('FoodTrucks')
      .update({ published: true })
      .eq('user_id', user.id);
      
    if (error) {
      // Instead of returning an error object, we'll just return
      return;
    }
    // Instead of returning a success object, we'll just return
    return;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Website Status</h2>
        <div className="p-4 bg-gray-100 rounded-md mb-4">
          <p className="font-medium">
            Status: <span className={isPublished ? "text-green-600" : "text-yellow-600"}>
              {isPublished ? "Published" : "Not Published"}
            </span>
          </p>
          {!isPublished && (
            <p className="text-sm text-gray-500 mt-2">
              {!hasSubscription
                ? "You need to subscribe to a plan before publishing."
                : !hasStripeKey 
                  ? "You need to set up your Stripe API key before publishing." 
                  : "Your website is ready to be published."}
            </p>
          )}
        </div>
        
        {!hasSubscription ? (
          <a 
            href="/admin/subscribe"
            className="inline-block px-4 py-2 rounded text-white bg-purple-600 hover:bg-purple-700"
          >
            Subscribe to a Plan
          </a>
        ) : !hasStripeKey ? (
          <form action={publishWebsite} className="space-y-4">
            <div>
              <label htmlFor="stripeApiKey" className="block text-sm font-medium text-gray-700">Stripe API Key</label>
              <input
                id="stripeApiKey"
                name="stripeApiKey"
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your Stripe API key is required to process payments for your food truck.
              </p>
            </div>
            <button 
              type="submit"
              className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
            >
              Save API Key & Publish Website
            </button>
          </form>
        ) : (
          <form action={publishWebsite}>
            <button 
              type="submit"
              className={`px-4 py-2 rounded text-white ${
                isPublished 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={isPublished}
            >
              {isPublished ? "Already Published" : "Publish Website"}
            </button>
          </form>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Update Account
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Subscription</h2>
        <div className="p-4 bg-gray-100 rounded-md mb-4">
          <p className="font-medium">
            Current Plan: <span className="text-blue-600">
              {hasSubscription ? (foodTruck?.subscription_plan || 'Basic') : 'No Subscription'}
            </span>
          </p>
          {hasSubscription && <p className="text-sm text-gray-500">{foodTruck?.subscription_plan === 'pro' ? '$49' : '$29'}/month</p>}
        </div>
        {hasSubscription ? (
          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            {foodTruck?.subscription_plan === 'pro' ? 'Manage Subscription' : 'Upgrade to Pro'}
          </button>
        ) : (
          <a href="/admin/subscribe" className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Subscribe Now
          </a>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Domain Settings</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">Subdomain</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="subdomain"
                id="subdomain"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300"
                placeholder="your-truck-name"
                defaultValue={foodTruck?.subdomain || ''}
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500">
                .foodtruckflow.com
              </span>
            </div>
          </div>
          
          <div>
            <label htmlFor="customDomain" className="block text-sm font-medium text-gray-700">Custom Domain (Pro Plan Only)</label>
            <input
              id="customDomain"
              name="customDomain"
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="www.yourdomain.com"
              defaultValue={foodTruck?.custom_domain || ''}
              disabled={foodTruck?.subscription_plan !== 'pro'}
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Domain Settings
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Stripe Integration</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="stripeKey" className="block text-sm font-medium text-gray-700">Stripe API Key</label>
            <input
              id="stripeKey"
              name="stripeKey"
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder={hasStripeKey ? "••••••••••••••••••••••" : ""}
            />
            <p className="text-xs text-gray-500 mt-1">
              {hasStripeKey ? "Your Stripe API key is set. Enter a new value to update it." : "Required to process payments for your food truck."}
            </p>
          </div>
          
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {hasStripeKey ? "Update Stripe Settings" : "Save Stripe Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 