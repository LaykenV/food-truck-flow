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
      <div className="flex items-center justify-center min-h-[50vh]">
        <LucideLoader className="h-8 w-8 animate-spin text-admin-primary" />
        <span className="ml-2 text-admin-foreground">Loading settings...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
        <p>Failed to load settings. Please try again.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      
      <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-admin-border">
          <div className="space-y-1">
            <CardTitle className="text-admin-card-foreground">Website Status</CardTitle>
            <CardDescription className="text-admin-muted-foreground">Manage your website's publication status</CardDescription>
          </div>
          <div className="bg-admin-secondary/30 p-2 rounded-full">
            <LucideGlobe className="h-5 w-5 text-admin-primary" />
          </div>
        </CardHeader>
        <CardContent className="pt-6 text-admin-card-foreground">
          <div className="flex items-center space-x-2 mb-4">
            <p className="font-medium text-admin-card-foreground">Status:</p>
            <Badge 
              variant={isPublished ? "default" : "secondary"} 
              className={isPublished 
                ? "bg-gradient-to-r from-[hsl(var(--admin-gradient-start))] to-[hsl(var(--admin-gradient-end))] text-white" 
                : "bg-yellow-500 hover:bg-yellow-600 text-white"}
            >
              {isPublished ? "Published" : "Not Published"}
            </Badge>
          </div>
          
          {!isPublished && (
            <p className="text-sm text-admin-muted-foreground mb-4">
              {!hasSubscription
                ? "You need to subscribe to a plan before publishing."
                : !hasStripeKey 
                  ? "You need to set up your Stripe API key before publishing." 
                  : "Your website is ready to be published."}
            </p>
          )}
        </CardContent>
        <CardFooter className="border-t border-admin-border pt-4">
          {!hasSubscription ? (
            <Button variant="default" asChild className="w-full sm:w-auto bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground">
              <Link href="/admin/account">Manage Subscription</Link>
            </Button>
          ) : !hasStripeKey ? (
            <form onSubmit={handlePublishWebsite} className="w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripeApiKey" className="text-admin-card-foreground">Stripe API Key</Label>
                <Input
                  id="stripeApiKey"
                  value={stripeApiKey}
                  onChange={(e) => setStripeApiKey(e.target.value)}
                  type="password"
                  required
                  className="border-admin-border bg-admin-card text-admin-card-foreground"
                  autoComplete="off"
                />
                <p className="text-xs text-admin-muted-foreground">
                  Your Stripe API key is required to process payments for your food truck.
                </p>
              </div>
              <Button 
                type="submit"
                disabled={publishMutation.isPending || !stripeApiKey}
                className="w-full sm:w-auto bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground"
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
            <form onSubmit={handlePublishWebsite} className="w-full">
              <Button 
                type="submit"
                variant={isPublished ? "outline" : "default"}
                disabled={isPublished || publishMutation.isPending}
                className={`w-full sm:w-auto ${isPublished 
                  ? "border-admin-border text-admin-muted-foreground hover:bg-admin-secondary/30" 
                  : "bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground"}`}
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
      
      <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-admin-border">
          <div className="space-y-1">
            <CardTitle className="text-admin-card-foreground">Domain Settings</CardTitle>
            <CardDescription className="text-admin-muted-foreground">Configure your website's domain</CardDescription>
          </div>
          <div className="bg-admin-secondary/30 p-2 rounded-full">
            <LucideGlobe className="h-5 w-5 text-admin-primary" />
          </div>
        </CardHeader>
        <CardContent className="pt-6 text-admin-card-foreground">
          <form onSubmit={handleUpdateDomainSettings} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subdomain" className="text-admin-card-foreground">Subdomain</Label>
              <div className="flex items-center">
                <Input
                  id="subdomain"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  className="rounded-r-none border-admin-border bg-admin-card text-admin-card-foreground"
                  autoComplete="off"
                />
                <span className="bg-admin-secondary px-3 py-2 border border-admin-border border-l-0 rounded-r-md text-admin-muted-foreground whitespace-nowrap">
                  .foodtruckflow.com
                </span>
              </div>
              <p className="text-xs text-admin-muted-foreground mt-1">
                This is your unique subdomain for your food truck website.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="customDomain" className="text-admin-card-foreground">Custom Domain</Label>
                {foodTruck?.subscription_plan !== 'pro' && (
                  <Badge variant="outline" className="text-xs bg-admin-secondary/50 border-admin-border text-admin-muted-foreground">Pro Feature</Badge>
                )}
              </div>
              <Input
                id="customDomain"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="yourdomain.com"
                disabled={foodTruck?.subscription_plan !== 'pro'}
                className={`border-admin-border bg-admin-card text-admin-card-foreground ${foodTruck?.subscription_plan !== 'pro' ? "opacity-50" : ""}`}
                autoComplete="off"
              />
              {foodTruck?.subscription_plan !== 'pro' ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mt-1">
                  <p className="text-xs text-admin-muted-foreground">
                    Custom domains are available on the Pro plan.
                  </p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-admin-primary hover:text-admin-primary/90" asChild>
                    <Link href="/admin/account">Upgrade to Pro</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-admin-muted-foreground mt-1">
                  Enter your custom domain to use instead of the subdomain.
                </p>
              )}
            </div>
            
            <Button 
              type="submit"
              disabled={domainMutation.isPending || (!subdomain && (!customDomain || foodTruck?.subscription_plan !== 'pro'))}
              className="w-full sm:w-auto bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground"
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
      
      <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-admin-border">
          <div className="space-y-1">
            <CardTitle className="text-admin-card-foreground">Stripe Integration</CardTitle>
            <CardDescription className="text-admin-muted-foreground">Configure your Stripe payment settings</CardDescription>
          </div>
          <div className="bg-admin-secondary/30 p-2 rounded-full">
            <LucideCreditCard className="h-5 w-5 text-admin-primary" />
          </div>
        </CardHeader>
        <CardContent className="pt-6 text-admin-card-foreground">
          <form onSubmit={handleUpdateStripeApiKey} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="stripeKey" className="text-admin-card-foreground">Stripe API Key</Label>
              <Input
                id="stripeKey"
                value={stripeApiKey}
                onChange={(e) => setStripeApiKey(e.target.value)}
                type="password"
                placeholder={hasStripeKey ? "••••••••••••••••••••••" : "Enter your Stripe API key"}
                className="border-admin-border bg-admin-card text-admin-card-foreground"
                autoComplete="off"
              />
              <p className="text-xs text-admin-muted-foreground mt-1">
                Your Stripe API key is required to process payments for your food truck.
                {hasStripeKey && " Your key has been saved securely."}
              </p>
            </div>
            <Button 
              type="submit"
              disabled={stripeMutation.isPending || !stripeApiKey}
              className="w-full sm:w-auto bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground"
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