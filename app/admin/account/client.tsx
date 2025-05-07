'use client';

import { useQuery } from "@tanstack/react-query";
import { getFoodTruck, getUser, getSubscriptionData } from "@/app/admin/clientQueries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideUser, LucideCreditCard, LucideArrowRight, LucideShield } from "lucide-react";
import Link from "next/link";

// Define SVG components for logos
const GoogleLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    className="mr-1"
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const FacebookLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="#1877F2"
    className="mr-1"
  >
    <path
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
    />
  </svg>
);

export default function AccountClient() {
  const { 
    data: user, 
    isLoading: isUserLoading, 
    error: userError 
  } = useQuery({
    queryKey: ['user'],
    queryFn: getUser
  });

  console.log(user);

  const { 
    data: foodTruck, 
    isLoading: isFoodTruckLoading, 
    error: foodTruckError 
  } = useQuery({
    queryKey: ['foodTruck'],
    queryFn: getFoodTruck
  });

  const {
    data: subscriptionData,
    isLoading: isSubscriptionLoading,
    error: subscriptionError
  } = useQuery({
    queryKey: ['subscriptionData'],
    queryFn: getSubscriptionData
  });

  // Get email and display name from user data
  const email = user?.email || 'No email found';
  const displayName = user?.user_metadata?.name || null;
  
  const authProvider = user?.app_metadata?.provider;
  const isEmailPasswordAuth = authProvider === 'email';

  const hasSubscription = subscriptionData?.status === 'active';
  const currentPlan = subscriptionData?.planName || 'none';

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
    <div className="space-y-6">
      <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-admin-border">
          <div className="space-y-1">
            <CardTitle className="text-admin-card-foreground">Subscription</CardTitle>
            <CardDescription className="text-admin-muted-foreground">Manage your subscription plan</CardDescription>
          </div>
          <div className="bg-admin-secondary/30 p-2 rounded-full">
            <LucideCreditCard className="h-5 w-5 text-admin-primary" />
          </div>
        </CardHeader>
        <CardContent className="pt-6 text-admin-card-foreground">
          <div className="flex items-center space-x-2 mb-4">
            <p className="font-medium text-admin-card-foreground">Current Plan:</p>
            {hasSubscription ? (
              <Badge className="bg-gradient-to-r from-[hsl(var(--admin-primary))] to-[hsl(var(--admin-gradient-end))] text-admin-primary-foreground">
                {currentPlan}
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
        <CardFooter className="border-t border-admin-border pt-4">
          {hasSubscription ? (
            <Button 
              variant="outline" 
              asChild 
              className="w-full sm:w-auto bg-admin-card hover:bg-admin-secondary text-admin-foreground border-admin-border"
            >
              <Link href="/admin/account/subscribe" className="flex items-center justify-center">
                Manage Subscription
                <LucideArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button 
              asChild 
              className="w-full sm:w-auto bg-gradient-to-r from-[hsl(var(--admin-primary))] to-[hsl(var(--admin-gradient-end))] text-admin-primary-foreground hover:opacity-90"
            >
              <Link href="/admin/account/subscribe" className="flex items-center justify-center">
                Subscribe Now
                <LucideArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-admin-border">
          <div className="space-y-1">
            <CardTitle className="text-admin-card-foreground">Profile Information</CardTitle>
            <CardDescription className="text-admin-muted-foreground">Manage your account details</CardDescription>
          </div>
          <div className="bg-admin-secondary/30 p-2 rounded-full">
            <LucideUser className="h-5 w-5 text-admin-primary" />
          </div>
        </CardHeader>
        <CardContent className="pt-6 text-admin-card-foreground">
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
            
            {isEmailPasswordAuth ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-admin-card-foreground">Password</p>
                <p className="text-sm text-admin-muted-foreground">••••••••</p>
              </div>
            ) : (
              authProvider && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-admin-card-foreground">Authentication</p>
                  <div className="flex items-center space-x-2">
                    {/* TODO: Add actual logos */}
                    {authProvider === 'google' && <GoogleLogo />}
                    {authProvider === 'facebook' && <FacebookLogo />}
                    {/* Add more providers as needed */}
                    <p className="text-sm text-admin-muted-foreground">
                      Signed in with {authProvider.charAt(0).toUpperCase() + authProvider.slice(1)}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t border-admin-border pt-4">
          {isEmailPasswordAuth && (
            <Button 
              variant="outline" 
              asChild 
              className="w-full sm:w-auto bg-admin-card hover:bg-admin-secondary text-admin-foreground border-admin-border"
            >
              <Link href="/admin/account/reset-password" className="flex items-center justify-center">
                Change Password
                <LucideArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 