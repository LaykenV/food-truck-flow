"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFoodTruck } from "@/app/admin/clientQueries";
import { updateSubscription, cancelSubscription } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Gift, Shield, Zap } from "lucide-react";
import { useState } from "react";

export default function SubscribeClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch food truck data using React Query
  const { data: foodTruck, isLoading, error } = useQuery({
    queryKey: ['foodTruck'],
    queryFn: getFoodTruck
  });
  
  const currentPlan = foodTruck?.subscription_plan || 'none';
  const isSubscribed = !!foodTruck?.stripe_subscription_id;
  
  // Mutation for updating subscription
  const updateSubscriptionMutation = useMutation({
    mutationFn: (plan: string) => updateSubscription(plan),
    onMutate: () => {
      setIsProcessing(true);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['foodTruck'] });
      
      toast.success("Subscription updated successfully");
      router.push('/admin/account');
    },
    onError: (error: Error) => {
      toast.error(`Error updating subscription: ${error.message}`);
      setIsProcessing(false);
    }
  });
  
  // Mutation for cancelling subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: () => cancelSubscription(),
    onMutate: () => {
      setIsProcessing(true);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['foodTruck'] });
      
      toast.success("Subscription cancelled successfully");
      router.push('/admin/account');
    },
    onError: (error: Error) => {
      toast.error(`Error cancelling subscription: ${error.message}`);
      setIsProcessing(false);
    }
  });
  
  // Handle subscription update
  const handleSubscription = async (plan: string) => {
    updateSubscriptionMutation.mutate(plan);
  };
  
  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    cancelSubscriptionMutation.mutate();
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
        <Card className={`bg-admin-card border-admin-border hover:shadow-md transition-all duration-200 ${currentPlan === 'pro' ? 'border-admin-primary border-2' : ''}`}>
          <CardHeader className="pb-4">
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
          <CardContent className="space-y-4 pb-6">
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
            {currentPlan === 'pro' ? (
              <Button variant="outline" className="w-full bg-admin-secondary/50 text-admin-secondary-foreground border-admin-border" disabled>
                Current Plan
              </Button>
            ) : (
              <Button
                className="w-full bg-gradient-to-r from-[hsl(var(--admin-primary))] to-[hsl(var(--admin-gradient-end))] text-white hover:shadow-lg"
                onClick={() => handleSubscription('pro')}
                disabled={isProcessing}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {isProcessing ? 'Processing...' : currentPlan === 'none' ? 'Subscribe' : 'Upgrade to Pro'}
              </Button>
            )}
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
                    {foodTruck?.stripe_subscription_id || 'N/A'}
                  </p>
                </div>
                <div className="bg-admin-secondary/30 p-3 rounded-md">
                  <h3 className="text-sm font-medium text-admin-card-foreground">Status</h3>
                  <p className="text-sm text-admin-muted-foreground mt-1">
                    {isSubscribed ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="bg-admin-secondary/30 p-3 rounded-md">
                  <h3 className="text-sm font-medium text-admin-card-foreground">Next Billing Date</h3>
                  <p className="text-sm text-admin-muted-foreground mt-1">
                    {isSubscribed ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'N/A'}
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
        <CardFooter className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0 pt-2">
          {isSubscribed ? (
            <>
              <Button 
                variant="outline" 
                disabled 
                className="bg-admin-secondary/50 text-admin-secondary-foreground border-admin-border"
              >
                Manage Billing
              </Button>
              <Button 
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={isProcessing}
                className="bg-admin-destructive text-admin-destructive-foreground hover:bg-admin-destructive/90"
              >
                {isProcessing ? 'Processing...' : 'Cancel Subscription'}
              </Button>
            </>
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