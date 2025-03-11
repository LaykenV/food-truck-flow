import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LucideUser, LucideCreditCard, LucideArrowRight } from "lucide-react";
import Link from "next/link";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Fetch food truck data
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('*')
    .eq('user_id', user?.id)
    .single();
  
  const hasSubscription = !!foodTruck?.stripe_subscription_id;
  const currentPlan = foodTruck?.subscription_plan || 'none';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
        <SidebarTrigger className="md:hidden" />
      </div>
      
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
            <div className="space-y-2">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {user?.email || 'No email found'}
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
    </div>
  );
} 