'use client';

import { useQuery } from "@tanstack/react-query";
import { getFoodTruck, getUser } from "@/app/admin/clientQueries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideUser, LucideCreditCard, LucideArrowRight, LucideShield } from "lucide-react";
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-admin-destructive/10 border border-admin-destructive text-admin-destructive px-4 py-3 rounded-md">
        <p>Error loading account information. Please try again later.</p>
      </div>
    );
  }

  return (
    <>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-admin-card-foreground">Profile Information</CardTitle>
              <CardDescription className="text-admin-muted-foreground">Manage your account details</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-full bg-admin-primary/10 flex items-center justify-center">
              <LucideUser className="h-4 w-4 text-admin-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {displayName && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-admin-card-foreground">Name</p>
                  <p className="text-sm text-admin-muted-foreground">
                    {displayName}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-admin-card-foreground">Email</p>
                <p className="text-sm text-admin-muted-foreground">
                  {email}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-admin-card-foreground">Password</p>
                <p className="text-sm text-admin-muted-foreground">••••••••</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              asChild 
              className="w-full sm:w-auto bg-admin-card hover:bg-admin-secondary text-admin-foreground border-admin-border"
            >
              <Link href="/admin/reset-password" className="flex items-center justify-center">
                Change Password
                <LucideArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-admin-card-foreground">Subscription</CardTitle>
              <CardDescription className="text-admin-muted-foreground">Manage your subscription plan</CardDescription>
            </div>
            <div className="h-8 w-8 rounded-full bg-admin-primary/10 flex items-center justify-center">
              <LucideCreditCard className="h-4 w-4 text-admin-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <p className="font-medium text-admin-card-foreground">Current Plan:</p>
              {hasSubscription ? (
                <Badge className="bg-gradient-to-r from-[hsl(var(--admin-primary))] to-[hsl(var(--admin-gradient-end))] text-admin-primary-foreground">
                  {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-admin-secondary text-admin-secondary-foreground">
                  No Subscription
                </Badge>
              )}
            </div>
            
            {hasSubscription ? (
              <div className="space-y-3">
                <p className="text-sm text-admin-muted-foreground">
                  {currentPlan === 'pro' ? '$49' : '$29'}/month
                </p>
                <div className="flex items-center space-x-2">
                  <LucideShield className="h-4 w-4 text-admin-primary" />
                  <p className="text-xs text-admin-muted-foreground">
                    Your subscription renews on the 1st of each month
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-admin-muted-foreground">
                Subscribe to unlock all premium features and increase your food truck's reach.
              </p>
            )}
          </CardContent>
          <CardFooter>
            {hasSubscription ? (
              <Button 
                variant="outline" 
                asChild 
                className="w-full sm:w-auto bg-admin-card hover:bg-admin-secondary text-admin-foreground border-admin-border"
              >
                <Link href="/admin/subscribe" className="flex items-center justify-center">
                  Manage Subscription
                  <LucideArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button 
                asChild 
                className="w-full sm:w-auto bg-gradient-to-r from-[hsl(var(--admin-primary))] to-[hsl(var(--admin-gradient-end))] text-admin-primary-foreground hover:opacity-90"
              >
                <Link href="/admin/subscribe" className="flex items-center justify-center">
                  Subscribe Now
                  <LucideArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
} 