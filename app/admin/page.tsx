import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LucideShoppingCart, LucideDollarSign, LucideUsers, LucideActivity } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch food truck data
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('*')
    .eq('user_id', user?.id)
    .single();
  
  const isSubscribed = !!foodTruck?.stripe_subscription_id;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <SidebarTrigger className="md:hidden" />
      </div>
      
      {/* Getting Started Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started Checklist</CardTitle>
          <CardDescription>Complete these tasks to set up your food truck website</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox id="setup-profile" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="setup-profile" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Set up your profile
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add your food truck name, logo, and contact information
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox id="customize-website" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="customize-website" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Customize your website
                </Label>
                <p className="text-sm text-muted-foreground">
                  Choose colors, layout, and design elements
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox id="add-menu" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="add-menu" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Add menu items
                </Label>
                <p className="text-sm text-muted-foreground">
                  Create your menu with prices and descriptions
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox id="setup-stripe" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="setup-stripe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Set up Stripe for payments
                </Label>
                <p className="text-sm text-muted-foreground">
                  Connect your Stripe account to accept online payments
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox id="preview-site" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="preview-site" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Preview your website
                </Label>
                <p className="text-sm text-muted-foreground">
                  Check how your website looks before publishing
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox id="subscribe" checked={isSubscribed} disabled />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="subscribe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Subscribe to a plan
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isSubscribed 
                    ? `Current plan: ${foodTruck?.subscription_plan || 'Basic'}`
                    : 'Choose a subscription plan to publish your website'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <LucideShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <LucideDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Website Visits</CardTitle>
            <LucideUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <LucideActivity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0 since last hour
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest website and order activity</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent activity to display.</p>
        </CardContent>
      </Card>
    </div>
  )
}
