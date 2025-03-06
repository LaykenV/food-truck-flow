import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LucideSettings, LucideGlobe, LucideUser, LucideCreditCard } from "lucide-react";
import { toast } from "sonner";

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
          return;
        }
        return;
      } else {
        return;
      }
    }
    
    // If they have both subscription and API key, publish the website
    const { error } = await supabase
      .from('FoodTrucks')
      .update({ published: true })
      .eq('user_id', user.id);
      
    if (error) {
      return;
    }
    return;
  }
  
  // Add this update Stripe API key function
  async function updateStripeApiKey(formData: FormData) {
    'use server'
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return;
    }
    
    const stripeApiKey = formData.get('stripeKey') as string;
    
    if (!stripeApiKey) {
      return;
    }
    
    const { error } = await supabase
      .from('FoodTrucks')
      .update({ stripe_api_key: stripeApiKey })
      .eq('user_id', user.id);
      
    if (error) {
      return;
    }
    
    return;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <SidebarTrigger className="md:hidden" />
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Website Status</CardTitle>
            <CardDescription>Manage your website's publication status</CardDescription>
          </div>
          <LucideGlobe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <p className="font-medium">Status:</p>
            <Badge variant={isPublished ? "default" : "secondary"} className={isPublished ? "bg-green-500" : "bg-yellow-500"}>
              {isPublished ? "Published" : "Not Published"}
            </Badge>
          </div>
          
          {!isPublished && (
            <p className="text-sm text-muted-foreground mb-4">
              {!hasSubscription
                ? "You need to subscribe to a plan before publishing."
                : !hasStripeKey 
                  ? "You need to set up your Stripe API key before publishing." 
                  : "Your website is ready to be published."}
            </p>
          )}
        </CardContent>
        <CardFooter>
          {!hasSubscription ? (
            <Button variant="default" asChild>
              <a href="/admin/subscribe">Subscribe to a Plan</a>
            </Button>
          ) : !hasStripeKey ? (
            <form action={publishWebsite} className="w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripeApiKey">Stripe API Key</Label>
                <Input
                  id="stripeApiKey"
                  name="stripeApiKey"
                  type="password"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your Stripe API key is required to process payments for your food truck.
                </p>
              </div>
              <Button type="submit">
                Save API Key & Publish Website
              </Button>
            </form>
          ) : (
            <form action={publishWebsite}>
              <Button 
                type="submit"
                variant={isPublished ? "outline" : "default"}
                disabled={isPublished}
              >
                {isPublished ? "Already Published" : "Publish Website"}
              </Button>
            </form>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </div>
          <LucideUser className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user?.email || ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
              />
            </div>
            
            <Button type="submit">
              Update Account
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </div>
          <LucideCreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <p className="font-medium">Current Plan:</p>
            <Badge variant="secondary">
              {hasSubscription ? (foodTruck?.subscription_plan || 'Basic') : 'No Subscription'}
            </Badge>
          </div>
          
          {hasSubscription && (
            <p className="text-sm text-muted-foreground">
              {foodTruck?.subscription_plan === 'pro' ? '$49' : '$29'}/month
            </p>
          )}
        </CardContent>
        <CardFooter>
          {hasSubscription ? (
            <Button variant="default">
              {foodTruck?.subscription_plan === 'pro' ? 'Manage Subscription' : 'Upgrade to Pro'}
            </Button>
          ) : (
            <Button variant="default" asChild>
              <a href="/admin/subscribe">Subscribe Now</a>
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Domain Settings</CardTitle>
            <CardDescription>Configure your website domain</CardDescription>
          </div>
          <LucideSettings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex">
                <Input
                  id="subdomain"
                  name="subdomain"
                  className="rounded-r-none"
                  placeholder="your-truck-name"
                  defaultValue={foodTruck?.subdomain || ''}
                />
                <div className="flex items-center justify-center px-3 border border-l-0 rounded-r-md bg-muted text-muted-foreground">
                  .foodtruckflow.com
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customDomain">Custom Domain (Pro Plan Only)</Label>
              <Input
                id="customDomain"
                name="customDomain"
                placeholder="www.yourdomain.com"
                defaultValue={foodTruck?.custom_domain || ''}
                disabled={foodTruck?.subscription_plan !== 'pro'}
              />
              {foodTruck?.subscription_plan !== 'pro' && (
                <p className="text-xs text-muted-foreground">
                  Upgrade to Pro plan to use a custom domain.
                </p>
              )}
            </div>
            
            <Button type="submit">
              Save Domain Settings
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Stripe Integration</CardTitle>
            <CardDescription>Configure your payment processing</CardDescription>
          </div>
          <LucideCreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-6">
          <form action={updateStripeApiKey} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stripeKey">Stripe API Key</Label>
              <Input
                id="stripeKey"
                name="stripeKey"
                type="password"
                placeholder={hasStripeKey ? "••••••••••••••••••••••" : ""}
              />
              <p className="text-xs text-muted-foreground">
                {hasStripeKey 
                  ? "Your Stripe API key is set. Enter a new value to update it." 
                  : "Required to process payments for your food truck."}
              </p>
            </div>
            
            <Button type="submit">
              {hasStripeKey ? "Update Stripe Settings" : "Save Stripe Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 