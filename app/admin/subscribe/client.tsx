"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFoodTruck } from "@/app/admin/clientQueries";
import { updateSubscription, cancelSubscription } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard } from "lucide-react";
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{(error as Error).message}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
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
              <Button
                className="w-full"
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
              <Button
                className="w-full"
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
            {isSubscribed && (
              <>
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
                    {isSubscribed ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Monthly Price</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentPlan === 'pro' ? '$49' : '$29'}/month
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0">
          {isSubscribed ? (
            <>
              <Button variant="outline" disabled>Manage Billing</Button>
              <Button 
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Cancel Subscription'}
              </Button>
            </>
          ) : (
            <Button
              className="w-full sm:w-auto"
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