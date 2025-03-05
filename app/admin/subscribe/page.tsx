import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function SubscribePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Fetch the user's food truck
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('*')
    .eq('user_id', user?.id)
    .single();
  
  // Check if user already has a subscription
  if (foodTruck?.stripe_subscription_id) {
    // If they already have a subscription, redirect to settings
    redirect('/admin/settings');
  }
  
  // This function will be called when the user selects a plan
  async function handleSubscription(formData: FormData) {
    'use server'
    
    const plan = formData.get('plan') as string;
    if (!plan || (plan !== 'basic' && plan !== 'pro')) {
      // Invalid plan selected
      return;
    }
    
    // In a real implementation, this would redirect to Stripe Checkout
    // For now, we'll simulate a successful subscription by updating the database
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect('/login');
    }
    
    // Update the food truck with a simulated subscription
    const { error } = await supabase
      .from('FoodTrucks')
      .update({
        subscription_plan: plan,
        stripe_subscription_id: `sub_${Math.random().toString(36).substring(2, 15)}`, // Simulated subscription ID
      })
      .eq('user_id', user.id);
    
    if (error) {
      // Handle error
      console.error('Error updating subscription:', error);
      return;
    }
    
    // Redirect to settings page after successful subscription
    redirect('/admin/settings');
  }
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Choose Your Subscription Plan</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Basic Plan */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 p-6 text-white">
            <h2 className="text-2xl font-bold">Basic Plan</h2>
            <p className="text-4xl font-bold mt-2">$29<span className="text-lg font-normal">/month</span></p>
          </div>
          <div className="p-6 space-y-4">
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Custom website template</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Online ordering system</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Basic analytics</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Subdomain hosting</span>
              </li>
            </ul>
            <form action={handleSubscription} className="mt-6">
              <input type="hidden" name="plan" value="basic" />
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Select Basic Plan
              </button>
            </form>
          </div>
        </div>
        
        {/* Pro Plan */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-purple-500">
          <div className="bg-purple-600 p-6 text-white relative">
            <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-3 py-1 rounded-bl-lg text-purple-900">
              RECOMMENDED
            </div>
            <h2 className="text-2xl font-bold">Pro Plan</h2>
            <p className="text-4xl font-bold mt-2">$49<span className="text-lg font-normal">/month</span></p>
          </div>
          <div className="p-6 space-y-4">
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Everything in Basic</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Custom domain</strong> support</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Advanced</strong> analytics</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Priority support</span>
              </li>
            </ul>
            <form action={handleSubscription} className="mt-6">
              <input type="hidden" name="plan" value="pro" />
              <button 
                type="submit"
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                Select Pro Plan
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-gray-100 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Why subscribe?</h3>
        <p className="text-gray-700">
          Subscribing to FoodTruckFlow gives you access to a professional online presence for your food truck business.
          Our platform handles all the technical details so you can focus on what matters most - your food and your customers.
        </p>
        <p className="text-gray-700 mt-2">
          All plans include a 14-day money-back guarantee. No long-term contracts - cancel anytime.
        </p>
      </div>
    </div>
  );
} 