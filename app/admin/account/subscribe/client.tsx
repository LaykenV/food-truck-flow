"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFoodTruck, getSubscriptionData } from "@/app/admin/clientQueries";
import { updateSubscription, createBillingPortalSession } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Gift, Shield, Zap } from "lucide-react";
import { useState } from "react";

// Helper to format date
const formatDate = (timestamp: number | null) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleDateString();
};

export default function SubscribeClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch subscription data using React Query
  const { data: subscription, isLoading: isLoadingSubscription, error: subscriptionError } = useQuery({
    queryKey: ['subscriptionData'],
    queryFn: getSubscriptionData
  });
  
  // Fetch food truck data for other info
  const { data: foodTruck, isLoading: isLoadingFoodTruck, error: foodTruckError } = useQuery({
    queryKey: ['foodTruck'],
    queryFn: getFoodTruck
  });

  const isLoading = isLoadingSubscription || isLoadingFoodTruck;
  const error = subscriptionError || foodTruckError;
  
  // Use planName directly from the subscription data
  const currentPlan = subscription?.planName || 'none';
    
  const isSubscribed = subscription?.status === 'active';
  const isCancelling = subscription?.cancelAtPeriodEnd;
  
  // Mutation for updating subscription
  const updateSubscriptionMutation = useMutation({
    mutationFn: (plan: string) => updateSubscription(plan),
    onMutate: () => {
      setIsProcessing(true);
    },
    onSuccess: (data) => {
      // If we have a sessionUrl, redirect to Stripe Checkout
      if (data?.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        // Otherwise, invalidate the query and show a success message
        queryClient.invalidateQueries({ queryKey: ['subscriptionData'] });
        queryClient.invalidateQueries({ queryKey: ['foodTruck'] });
        toast.success("Subscription updated successfully");
      }
    },
    onError: (error: Error) => {
      toast.error(`Error updating subscription: ${error.message}`);
      setIsProcessing(false);
    }
  });
  
  // Mutation for billing portal
  const billingPortalMutation = useMutation({
    mutationFn: () => createBillingPortalSession(),
    onMutate: () => {
      setIsProcessing(true);
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast.error(`Error opening billing portal: ${error.message}`);
      setIsProcessing(false);
    }
  });
  
  // Handle subscription update
  const handleSubscription = async (plan: string) => {
    updateSubscriptionMutation.mutate(plan);
  };
  
  // Handle manage billing
  const handleManageBilling = async () => {
    billingPortalMutation.mutate();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-admin-destructive/10 border border-admin-destructive text-admin-destructive px-4 py-3 rounded-md">
        <p>{(error as Error).message}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Plan */}
        <Card className={`bg-admin-card border-admin-border hover:shadow-md transition-all duration-200 ${currentPlan === 'basic' ? 'border-admin-primary border-2' : ''}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-admin-primary" />
                <CardTitle className="text-admin-card-foreground">Basic Plan</CardTitle>
              </div>
              {currentPlan === 'basic' && (
                <Badge variant="outline" className="ml-2 bg-admin-primary/10 text-admin-primary border-admin-primary">Current Plan</Badge>
              )}
            </div>
            <CardDescription className="text-admin-muted-foreground">Perfect for getting started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <div className="text-4xl font-bold text-admin-card-foreground">$29<span className="text-sm font-normal text-admin-muted-foreground">/month</span></div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-admin-primary" />
                <span className="text-admin-card-foreground">Website template</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-admin-primary" />
                <span className="text-admin-card-foreground">Online ordering</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-admin-primary" />
                <span className="text-admin-card-foreground">Basic analytics</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-admin-primary" />
                <span className="text-admin-card-foreground">Subdomain hosting</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-2">
            {currentPlan === 'basic' ? (
              <Button variant="outline" className="w-full bg-admin-secondary/50 text-admin-secondary-foreground border-admin-border" disabled>
                Current Plan
              </Button>
            ) : (
              <Button
                className="w-full bg-gradient-to-r from-[hsl(var(--admin-primary))] to-[hsl(var(--admin-gradient-end))] text-white hover:shadow-lg"
                onClick={() => handleSubscription('basic')}
                disabled={isProcessing}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {isProcessing ? 'Processing...' : currentPlan === 'none' ? 'Subscribe' : 'Switch to Basic'}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Pro Plan */}
        <Card className={`bg-admin-card border-admin-border hover:shadow-md transition-all duration-200 ${currentPlan === 'pro' ? 'border-admin-primary border-2' : ''} relative`}>
          <CardHeader className="pb-4 opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-admin-primary" />
                <CardTitle className="text-admin-card-foreground">Pro Plan</CardTitle>
              </div>
              {currentPlan === 'pro' && (
                <Badge variant="outline" className="ml-2 bg-admin-primary/10 text-admin-primary border-admin-primary">Current Plan</Badge>
              )}
            </div>
            <CardDescription className="text-admin-muted-foreground">For serious food truck businesses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-6 opacity-60">
            <div className="text-4xl font-bold text-admin-card-foreground">$49<span className="text-sm font-normal text-admin-muted-foreground">/month</span></div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-admin-primary" />
                <span className="text-admin-card-foreground">Everything in Basic</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-admin-primary" />
                <span className="text-admin-card-foreground">Custom domain support</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-admin-primary" />
                <span className="text-admin-card-foreground">Advanced analytics</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-admin-primary" />
                <span className="text-admin-card-foreground">Priority support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-2">
             <Button 
              variant="outline" 
              className="w-full bg-admin-secondary/50 text-admin-secondary-foreground border-admin-border" 
              disabled
            >
              Coming Soon
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card className="bg-admin-card border-admin-border shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-admin-primary" />
            <CardTitle className="text-admin-card-foreground">Subscription Status</CardTitle>
          </div>
          <CardDescription className="text-admin-muted-foreground">Manage your current subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-admin-secondary/30 p-3 rounded-md">
              <h3 className="text-sm font-medium text-admin-card-foreground">Current Plan</h3>
              <p className="text-sm text-admin-muted-foreground mt-1">
                {currentPlan === 'none' ? 'No active subscription' : `${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan`}
              </p>
            </div>
            {isSubscribed && (
              <>
                <div className="bg-admin-secondary/30 p-3 rounded-md">
                  <h3 className="text-sm font-medium text-admin-card-foreground">Subscription ID</h3>
                  <p className="text-sm text-admin-muted-foreground mt-1 truncate">
                    {subscription?.subscriptionId || 'N/A'}
                  </p>
                </div>
                <div className="bg-admin-secondary/30 p-3 rounded-md">
                  <h3 className="text-sm font-medium text-admin-card-foreground">Status</h3>
                  <p className="text-sm text-admin-muted-foreground mt-1 flex items-center">
                    {isSubscribed ? (
                      <>
                        <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                        {isCancelling ? 'Active (Cancels at period end)' : 'Active'}
                      </>
                    ) : (
                      'Inactive'
                    )}
                  </p>
                </div>
                <div className="bg-admin-secondary/30 p-3 rounded-md">
                  <h3 className="text-sm font-medium text-admin-card-foreground">Next Billing Date</h3>
                  <p className="text-sm text-admin-muted-foreground mt-1">
                    {formatDate(subscription?.currentPeriodEnd)}
                  </p>
                </div>
                <div className="bg-admin-secondary/30 p-3 rounded-md">
                  <h3 className="text-sm font-medium text-admin-card-foreground">Payment Method</h3>
                  <p className="text-sm text-admin-muted-foreground mt-1">
                    {subscription?.paymentMethod?.brand && subscription?.paymentMethod?.last4 
                      ? `${subscription.paymentMethod.brand.charAt(0).toUpperCase() + subscription.paymentMethod.brand.slice(1)} •••• ${subscription.paymentMethod.last4}`
                      : 'N/A'
                    }
                  </p>
                </div>
                <div className="bg-admin-secondary/30 p-3 rounded-md">
                  <h3 className="text-sm font-medium text-admin-card-foreground">Monthly Price</h3>
                  <p className="text-sm text-admin-muted-foreground mt-1">
                    {currentPlan === 'pro' ? '$49' : '$29'}/month
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          {isSubscribed ? (
            <div className="w-full flex justify-end">
              <Button 
                variant="outline" 
                onClick={handleManageBilling}
                disabled={isProcessing}
                className="bg-admin-secondary/50 border-admin-primary text-admin-secondary-foreground w-full sm:w-auto"
              >
                {isProcessing ? 'Processing...' : 'Manage Billing'}
              </Button>
            </div>
          ) : (
            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-[hsl(var(--admin-primary))] to-[hsl(var(--admin-gradient-end))] text-white hover:shadow-lg"
              onClick={() => handleSubscription('basic')}
              disabled={isProcessing}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Subscribe Now'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 