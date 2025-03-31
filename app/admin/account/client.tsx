'use client';

import { useQuery } from "@tanstack/react-query";
import { getFoodTruck, getUser } from "@/app/admin/clientQueries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideUser, LucideCreditCard, LucideArrowRight } from "lucide-react";
import Link from "next/link";

export default function AccountClient() {
  const { 
    data: user, 
    isLoading: isUserLoading, 
    error: userError 
  } = useQuery({
    queryKey: ['user'],
    queryFn: getUser
  });

  const { 
    data: foodTruck, 
    isLoading: isFoodTruckLoading, 
    error: foodTruckError 
  } = useQuery({
    queryKey: ['foodTruck'],
    queryFn: getFoodTruck
  });

  // Get email and display name from user data
  const email = user?.email || 'No email found';
  const displayName = user?.user_metadata?.name || null;
  
  const hasSubscription = !!foodTruck?.stripe_subscription_id;
  const currentPlan = foodTruck?.subscription_plan || 'none';

  const isLoading = isUserLoading || isFoodTruckLoading;
  const error = userError || foodTruckError;

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
        <p>Error loading account information. Please try again later.</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </div>
          <LucideUser className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {displayName && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">
                  {displayName}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {email}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Password</p>
              <p className="text-sm text-muted-foreground">••••••••</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild>
            <Link href="/admin/reset-password">
              Change Password
              <LucideArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
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
              {hasSubscription ? (currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)) : 'No Subscription'}
            </Badge>
          </div>
          
          {hasSubscription && (
            <p className="text-sm text-muted-foreground">
              {currentPlan === 'pro' ? '$49' : '$29'}/month
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="default" asChild>
            <Link href="/admin/subscribe">
              {hasSubscription ? 'Manage Subscription' : 'Subscribe Now'}
              <LucideArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
} 