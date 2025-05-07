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
import { getFoodTruck, getSubscriptionData } from "@/app/admin/clientQueries";
import { publishWebsite, updateDomainSettings, updateStripeApiKey } from "./actions";

// Helper function for client-side subdomain validation
function validateSubdomainClientSide(subdomain: string): string | null {
  if (!subdomain) {
    // Presence Check (already partially handled by disabling save, but explicit check is good)
    // This case might be redundant if button is disabled, but included for completeness
    // as per plan.
    return "Subdomain cannot be empty."; 
  }

  if (subdomain.length < 3 || subdomain.length > 63) {
    return "Subdomain must be between 3 and 63 characters long.";
  }

  if (!/^[a-zA-Z0-9-]+$/.test(subdomain)) {
    return "Subdomain can only contain letters, numbers, and hyphens.";
  }

  if (/^-|-$|--/.test(subdomain)) {
    return "Subdomain cannot start or end with a hyphen, or contain consecutive hyphens.";
  }

  return null; // Validation passed
}

// FoodTruck type definition
interface FoodTruck {
  id: string;
  user_id: string;
  subdomain: string | null;
  custom_domain: string | null;
  published: boolean;
  stripe_api_key: string | null;
  [key: string]: any; // For any other properties
}

export default function SettingsClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // State for form fields
  const [subdomain, setSubdomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  
  // Fetch food truck data with React Query
  const { 
    data: foodTruck, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['foodTruck'],
    queryFn: getFoodTruck
  });

  const { data: subscriptionData, isLoading: isSubscriptionLoading } = useQuery({
    queryKey: ['subscriptionData'],
    queryFn: getSubscriptionData
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
  const hasSubscription = subscriptionData?.status === 'active';
  
  // Publish website mutation
  const publishMutation = useMutation({
    mutationFn: () => publishWebsite(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodTruck'] });
      toast.success("Website published successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish website: ${error.message}`);
    }
  });
  
  // Domain settings mutation
  const domainMutation = useMutation({
    mutationFn: ({ subdomain, customDomain }: { 
      subdomain: string; 
      customDomain?: string; 
    }) => updateDomainSettings(subdomain, customDomain),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodTruck'] });
      toast.success("Domain settings updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update domain settings: ${error.message}`);
    }
  });
  
  // Event handlers
  const handlePublishWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasSubscription) {
      router.push('/admin/account/subscribe');
      return;
    }
    
    publishMutation.mutate();
  };
  
  const handleUpdateDomainSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateSubdomainClientSide(subdomain);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    
    domainMutation.mutate({
      subdomain,
      customDomain: customDomain 
    });
  };
  
  if (isLoading || isSubscriptionLoading) {
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
                : "Your website is ready to be published."}
            </p>
          )}
        </CardContent>
        <CardFooter className="border-t border-admin-border pt-4">
          {!hasSubscription ? (
            <Button variant="default" asChild className="w-full sm:w-auto bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground">
              <Link href="/admin/account/subscribe">Manage Subscription</Link>
            </Button>
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
              <div className="flex items-center group">
                <Input
                  id="subdomain"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  className="rounded-r-none border-r-0 border-admin-border bg-admin-card text-admin-card-foreground focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-admin-primary focus-visible:border-admin-primary focus-visible:z-10"
                  autoComplete="off"
                />
                <span className="bg-admin-secondary h-10 flex items-center px-3 border border-admin-border rounded-r-md text-admin-muted-foreground whitespace-nowrap group-focus-within:border-admin-primary">
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
              </div>
              <Input
                id="customDomain"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="Coming Soon"
                disabled={true}
                className="border-admin-border bg-admin-card text-admin-card-foreground opacity-50 cursor-not-allowed"
                autoComplete="off"
              />
              <p className="text-xs text-admin-muted-foreground mt-1">
                Custom domain support is coming soon!
              </p>
            </div>
            
            <Button 
              type="submit"
              disabled={domainMutation.isPending || !subdomain}
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
          <p className="text-sm text-admin-muted-foreground">
            Stripe integration for seamless payments is coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 