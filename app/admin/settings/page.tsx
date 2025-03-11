'use client'

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LucideSettings, LucideGlobe, LucideCreditCard, LucideLoader } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { User } from '@supabase/supabase-js';

// Define FoodTruck type
interface FoodTruck {
  id: string;
  user_id: string;
  subdomain: string | null;
  custom_domain: string | null;
  published: boolean;
  stripe_api_key: string | null;
  stripe_subscription_id: string | null;
  subscription_plan: string | null;
  [key: string]: any; // For any other properties
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState<User | null>(null);
  const [foodTruck, setFoodTruck] = useState<FoodTruck | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishLoading, setPublishLoading] = useState(false);
  const [domainLoading, setDomainLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  
  const [subdomain, setSubdomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [stripeApiKey, setStripeApiKey] = useState('');
  
  useEffect(() => {
    async function loadData() {
      try {
        // Get current user
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !currentUser) {
          router.push('/login');
          return;
        }
        
        setUser(currentUser);
        
        // Fetch the user's food truck
        const { data: foodTruckData, error: foodTruckError } = await supabase
          .from('FoodTrucks')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();
        
        if (foodTruckError) {
          console.error('Error fetching food truck:', foodTruckError);
          toast.error("Failed to load settings. Please try again.");
          return;
        }
        
        setFoodTruck(foodTruckData as FoodTruck);
        setSubdomain(foodTruckData?.subdomain || '');
        setCustomDomain(foodTruckData?.custom_domain || '');
      } catch (error) {
        console.error('Error in loadData:', error);
        toast.error("Failed to load settings. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [router, supabase]);
  
  const isPublished = foodTruck?.published || false;
  const hasStripeKey = !!foodTruck?.stripe_api_key;
  const hasSubscription = !!foodTruck?.stripe_subscription_id;
  
  async function publishWebsite(e: React.FormEvent) {
    e.preventDefault();
    setPublishLoading(true);
    
    try {
      if (!hasSubscription) {
        router.push('/admin/subscribe');
        return;
      }
      
      // If they don't have a Stripe API key yet, save it
      if (!hasStripeKey && stripeApiKey) {
        // Optimistic update
        setFoodTruck(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            stripe_api_key: stripeApiKey,
            published: true
          };
        });
        
        const { error } = await supabase
          .from('FoodTrucks')
          .update({ 
            stripe_api_key: stripeApiKey,
            published: true 
          })
          .eq('user_id', user?.id);
          
        if (error) {
          throw error;
        }
        
        toast.success("API key saved and website published successfully!");
        
        return;
      }
      
      // If they have both subscription and API key, publish the website
      // Optimistic update
      setFoodTruck(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          published: true
        };
      });
      
      const { error } = await supabase
        .from('FoodTrucks')
        .update({ published: true })
        .eq('user_id', user?.id);
        
      if (error) {
        throw error;
      }
      
      toast.success("Website published successfully!");
      
      router.refresh();
    } catch (error) {
      console.error('Error publishing website:', error);
      
      // Revert optimistic update
      setFoodTruck(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          published: isPublished
        };
      });
      
      toast.error("Failed to publish website. Please try again.");
    } finally {
      setPublishLoading(false);
    }
  }
  
  async function updateDomainSettings(e: React.FormEvent) {
    e.preventDefault();
    setDomainLoading(true);
    
    try {
      // Optimistic update
      setFoodTruck(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          subdomain,
          custom_domain: customDomain
        };
      });
      
      const updateData: { subdomain: string; custom_domain?: string } = {
        subdomain,
      };
      
      // Only include custom_domain if on pro plan
      if (foodTruck?.subscription_plan === 'pro') {
        updateData.custom_domain = customDomain;
      }
      
      const { error } = await supabase
        .from('FoodTrucks')
        .update(updateData)
        .eq('user_id', user?.id);
        
      if (error) {
        throw error;
      }
      
      toast.success("Domain settings updated successfully!");
      
      router.refresh();
    } catch (error) {
      console.error('Error updating domain settings:', error);
      
      // Revert optimistic update
      setFoodTruck(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          subdomain: foodTruck?.subdomain || '',
          custom_domain: foodTruck?.custom_domain || ''
        };
      });
      
      setSubdomain(foodTruck?.subdomain || '');
      setCustomDomain(foodTruck?.custom_domain || '');
      
      toast.error("Failed to update domain settings. Please try again.");
    } finally {
      setDomainLoading(false);
    }
  }
  
  async function updateStripeApiKey(e: React.FormEvent) {
    e.preventDefault();
    setStripeLoading(true);
    
    try {
      if (!stripeApiKey) {
        toast.error("Please enter a valid Stripe API key.");
        return;
      }
      
      // Optimistic update
      setFoodTruck(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          stripe_api_key: stripeApiKey
        };
      });
      
      const { error } = await supabase
        .from('FoodTrucks')
        .update({ stripe_api_key: stripeApiKey })
        .eq('user_id', user?.id);
        
      if (error) {
        throw error;
      }
      
      toast.success("Stripe API key updated successfully!");
      
      // Clear the input field after successful update
      setStripeApiKey('');
      
      router.refresh();
    } catch (error) {
      console.error('Error updating Stripe API key:', error);
      
      // Revert optimistic update if we had a previous value
      if (hasStripeKey) {
        setFoodTruck(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            stripe_api_key: foodTruck?.stripe_api_key
          };
        });
      }
      
      toast.error("Failed to update Stripe API key. Please try again.");
    } finally {
      setStripeLoading(false);
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LucideLoader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
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
              <Link href="/admin/account">Manage Subscription</Link>
            </Button>
          ) : !hasStripeKey ? (
            <form onSubmit={publishWebsite} className="w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripeApiKey">Stripe API Key</Label>
                <Input
                  id="stripeApiKey"
                  value={stripeApiKey}
                  onChange={(e) => setStripeApiKey(e.target.value)}
                  type="password"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your Stripe API key is required to process payments for your food truck.
                </p>
              </div>
              <Button 
                type="submit"
                disabled={publishLoading || !stripeApiKey}
              >
                {publishLoading ? (
                  <>
                    <LucideLoader className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save API Key & Publish Website"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={publishWebsite}>
              <Button 
                type="submit"
                variant={isPublished ? "outline" : "default"}
                disabled={isPublished || publishLoading}
              >
                {publishLoading ? (
                  <>
                    <LucideLoader className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : isPublished ? (
                  "Already Published"
                ) : (
                  "Publish Website"
                )}
              </Button>
            </form>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Domain Settings</CardTitle>
            <CardDescription>Configure your website's domain</CardDescription>
          </div>
          <LucideGlobe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={updateDomainSettings} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex items-center">
                <Input
                  id="subdomain"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  className="rounded-r-none"
                />
                <span className="bg-muted px-3 py-2 border border-l-0 rounded-r-md text-muted-foreground">
                  .foodtruckflow.com
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="customDomain">Custom Domain</Label>
                {foodTruck?.subscription_plan !== 'pro' && (
                  <Badge variant="outline" className="text-xs bg-muted">Pro Feature</Badge>
                )}
              </div>
              <Input
                id="customDomain"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="yourdomain.com"
                disabled={foodTruck?.subscription_plan !== 'pro'}
                className={foodTruck?.subscription_plan !== 'pro' ? "opacity-50" : ""}
              />
              {foodTruck?.subscription_plan !== 'pro' ? (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Custom domains are available on the Pro plan.
                  </p>
                  <Button variant="link" size="sm" className="h-auto p-0" asChild>
                    <Link href="/admin/account">Upgrade to Pro</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Enter your custom domain to use instead of the subdomain.
                </p>
              )}
            </div>
            
            <Button 
              type="submit"
              disabled={domainLoading || (!subdomain && (!customDomain || foodTruck?.subscription_plan !== 'pro'))}
            >
              {domainLoading ? (
                <>
                  <LucideLoader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Domain Settings"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Stripe Integration</CardTitle>
            <CardDescription>Configure your Stripe payment settings</CardDescription>
          </div>
          <LucideCreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={updateStripeApiKey} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stripeKey">Stripe API Key</Label>
              <Input
                id="stripeKey"
                value={stripeApiKey}
                onChange={(e) => setStripeApiKey(e.target.value)}
                type="password"
                placeholder={hasStripeKey ? "••••••••••••••••••••••" : "Enter your Stripe API key"}
              />
              <p className="text-xs text-muted-foreground">
                Your Stripe API key is required to process payments for your food truck.
              </p>
            </div>
            <Button 
              type="submit"
              disabled={stripeLoading || !stripeApiKey}
            >
              {stripeLoading ? (
                <>
                  <LucideLoader className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Stripe Settings"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 