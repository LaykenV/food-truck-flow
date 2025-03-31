'use client'

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LucideGlobe, LucideCreditCard, LucideLoader } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getFoodTruck } from "@/app/admin/clientQueries";
import { publishWebsite, updateDomainSettings, updateStripeApiKey } from "./actions";

// FoodTruck type definition
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

export default function SettingsClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // State for form fields
  const [subdomain, setSubdomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [stripeApiKey, setStripeApiKey] = useState('');
  
  // Fetch food truck data with React Query
  const { 
    data: foodTruck, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['foodTruck'],
    queryFn: getFoodTruck
  });
  
  // Use effect to update form values when food truck data changes
  useEffect(() => {
    if (foodTruck) {
      setSubdomain(foodTruck.subdomain || '');
      setCustomDomain(foodTruck.custom_domain || '');
    }
  }, [foodTruck]);

  // Computed properties
  const isPublished = foodTruck?.published || false;
  const hasStripeKey = !!foodTruck?.stripe_api_key;
  const hasSubscription = !!foodTruck?.stripe_subscription_id;
  
  // Publish website mutation
  const publishMutation = useMutation({
    mutationFn: (apiKey?: string) => publishWebsite(apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodTruck'] });
      toast.success("Website published successfully!");
      
      // Clear the API key input if it was used
      if (stripeApiKey) {
        setStripeApiKey('');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish website: ${error.message}`);
    }
  });
  
  // Domain settings mutation
  const domainMutation = useMutation({
    mutationFn: ({ subdomain, customDomain, subscriptionPlan }: { 
      subdomain: string; 
      customDomain?: string; 
      subscriptionPlan?: string 
    }) => updateDomainSettings(subdomain, customDomain, subscriptionPlan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodTruck'] });
      toast.success("Domain settings updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update domain settings: ${error.message}`);
    }
  });
  
  // Stripe API key mutation
  const stripeMutation = useMutation({
    mutationFn: (apiKey: string) => updateStripeApiKey(apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodTruck'] });
      toast.success("Stripe API key updated successfully!");
      setStripeApiKey(''); // Clear the input field
    },
    onError: (error: Error) => {
      toast.error(`Failed to update Stripe API key: ${error.message}`);
    }
  });
  
  // Event handlers
  const handlePublishWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasSubscription) {
      router.push('/admin/subscribe');
      return;
    }
    
    // If they don't have a Stripe API key yet but provided one, save it and publish
    if (!hasStripeKey && stripeApiKey) {
      publishMutation.mutate(stripeApiKey);
    } else {
      publishMutation.mutate(undefined);
    }
  };
  
  const handleUpdateDomainSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    domainMutation.mutate({
      subdomain,
      customDomain: foodTruck?.subscription_plan === 'pro' ? customDomain : undefined,
      subscriptionPlan: foodTruck?.subscription_plan || undefined
    });
  };
  
  const handleUpdateStripeApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripeApiKey) {
      toast.error("Please enter a valid Stripe API key.");
      return;
    }
    
    stripeMutation.mutate(stripeApiKey);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LucideLoader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Failed to load settings. Please try again.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
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
            <form onSubmit={handlePublishWebsite} className="w-full space-y-4">
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
                disabled={publishMutation.isPending || !stripeApiKey}
              >
                {publishMutation.isPending ? (
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
            <form onSubmit={handlePublishWebsite}>
              <Button 
                type="submit"
                variant={isPublished ? "outline" : "default"}
                disabled={isPublished || publishMutation.isPending}
              >
                {publishMutation.isPending ? (
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
          <form onSubmit={handleUpdateDomainSettings} className="space-y-4">
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
              disabled={domainMutation.isPending || (!subdomain && (!customDomain || foodTruck?.subscription_plan !== 'pro'))}
            >
              {domainMutation.isPending ? (
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
          <form onSubmit={handleUpdateStripeApiKey} className="space-y-4">
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
              disabled={stripeMutation.isPending || !stripeApiKey}
            >
              {stripeMutation.isPending ? (
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