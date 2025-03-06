import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Check, CreditCard } from "lucide-react";

export default async function SubscribePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Fetch food truck data
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('*')
    .eq('user_id', user?.id)
    .single();
  
  const currentPlan = foodTruck?.subscription_plan || 'none';
  const isSubscribed = !!foodTruck?.stripe_subscription_id;
  
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
        <SidebarTrigger className="md:hidden" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Plan */}
        <Card className={currentPlan === 'basic' ? 'border-primary' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Basic Plan</CardTitle>
              {currentPlan === 'basic' && (
                <Badge variant="outline" className="ml-2">Current Plan</Badge>
              )}
            </div>
            <CardDescription>Perfect for getting started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">$29<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Website template</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Online ordering</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Basic analytics</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Subdomain hosting</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {currentPlan === 'basic' ? (
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            ) : (
              <form action={handleSubscription} className="w-full">
                <input type="hidden" name="plan" value="basic" />
                <Button type="submit" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  {currentPlan === 'none' ? 'Subscribe' : 'Switch to Basic'}
                </Button>
              </form>
            )}
          </CardFooter>
        </Card>
        
        {/* Pro Plan */}
        <Card className={currentPlan === 'pro' ? 'border-primary' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pro Plan</CardTitle>
              {currentPlan === 'pro' && (
                <Badge variant="outline" className="ml-2">Current Plan</Badge>
              )}
            </div>
            <CardDescription>For serious food truck businesses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">$49<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Everything in Basic</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Custom domain support</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Priority support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {currentPlan === 'pro' ? (
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            ) : (
              <form action={handleSubscription} className="w-full">
                <input type="hidden" name="plan" value="pro" />
                <Button type="submit" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  {currentPlan === 'none' ? 'Subscribe' : 'Upgrade to Pro'}
                </Button>
              </form>
            )}
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Manage your current subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium">Current Plan</h3>
              <p className="text-sm text-muted-foreground">
                {currentPlan === 'none' ? 'No active subscription' : `${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan`}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Subscription ID</h3>
              <p className="text-sm text-muted-foreground truncate">
                {foodTruck?.stripe_subscription_id || 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Status</h3>
              <p className="text-sm text-muted-foreground">
                {isSubscribed ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Next Billing Date</h3>
              <p className="text-sm text-muted-foreground">
                {isSubscribed ? 'Not available' : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0">
          {isSubscribed ? (
            <>
              <Button variant="outline">Manage Billing</Button>
              <Button variant="destructive">Cancel Subscription</Button>
            </>
          ) : (
            <Button className="w-full sm:w-auto">
              <CreditCard className="mr-2 h-4 w-4" />
              Subscribe Now
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 