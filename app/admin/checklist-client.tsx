'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LucideArrowUpRight } from "lucide-react"
import Link from "next/link"

type ChecklistProps = {
  initialChecklist: {
    profileSetup: boolean
    customColors: boolean
    menuItems: boolean
    stripeApiKey: boolean
    customDomain: boolean
    subscribed: boolean
  }
  markChecklistAsCompleted: () => Promise<void>
}

export function ChecklistClient({ initialChecklist, markChecklistAsCompleted }: ChecklistProps) {
  // Use state to track checkbox status
  const [checklist, setChecklist] = useState({
    profileSetup: initialChecklist.profileSetup,
    customColors: initialChecklist.customColors,
    menuItems: initialChecklist.menuItems,
    stripeApiKey: initialChecklist.stripeApiKey,
    customDomain: initialChecklist.customDomain,
    subscribed: initialChecklist.subscribed
  })

  // Check if all items are checked
  const allItemsChecked = Object.values(checklist).every(value => value === true)

  // Automatically mark checklist as completed when all items are checked
  useEffect(() => {
    if (allItemsChecked) {
      markChecklistAsCompleted();
    }
  }, [allItemsChecked, markChecklistAsCompleted]);

  // Handle checkbox changes
  const handleCheckboxChange = (key: keyof typeof checklist) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Getting Started Checklist</CardTitle>
          <CardDescription>Complete these tasks to set up your food truck website</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="setup-profile" 
              checked={checklist.profileSetup} 
              onCheckedChange={() => handleCheckboxChange('profileSetup')}
            />
            <div className="grid gap-1.5 leading-none">
              <div className="flex items-center gap-2">
                <Label htmlFor="setup-profile" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Set up your profile
                </Label>
                {!initialChecklist.profileSetup && (
                  <Button variant="ghost" size="icon" className="h-5 w-5" asChild>
                    <Link href="/admin/config" title="Configure Profile">
                      <LucideArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Add your food truck name, logo, and contact information
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="customize-website" 
              checked={checklist.customColors} 
              onCheckedChange={() => handleCheckboxChange('customColors')}
            />
            <div className="grid gap-1.5 leading-none">
              <div className="flex items-center gap-2">
                <Label htmlFor="customize-website" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Customize your website
                </Label>
                {!initialChecklist.customColors && (
                  <Button variant="ghost" size="icon" className="h-5 w-5" asChild>
                    <Link href="/admin/config" title="Customize Colors">
                      <LucideArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Choose colors, layout, and design elements
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="add-menu" 
              checked={checklist.menuItems} 
              onCheckedChange={() => handleCheckboxChange('menuItems')}
            />
            <div className="grid gap-1.5 leading-none">
              <div className="flex items-center gap-2">
                <Label htmlFor="add-menu" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Add menu items
                </Label>
                {!initialChecklist.menuItems && (
                  <Button variant="ghost" size="icon" className="h-5 w-5" asChild>
                    <Link href="/admin/menus" title="Add Menu Items">
                      <LucideArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Create your menu with prices and descriptions
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="setup-stripe" 
              checked={checklist.stripeApiKey} 
              onCheckedChange={() => handleCheckboxChange('stripeApiKey')}
            />
            <div className="grid gap-1.5 leading-none">
              <div className="flex items-center gap-2">
                <Label htmlFor="setup-stripe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Set up Stripe for payments
                </Label>
                {!initialChecklist.stripeApiKey && (
                  <Button variant="ghost" size="icon" className="h-5 w-5" asChild>
                    <Link href="/admin/settings" title="Configure Stripe">
                      <LucideArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Connect your Stripe account to accept online payments
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="setup-domain" 
              checked={checklist.customDomain} 
              onCheckedChange={() => handleCheckboxChange('customDomain')}
            />
            <div className="grid gap-1.5 leading-none">
              <div className="flex items-center gap-2">
                <Label htmlFor="setup-domain" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Set up domain name
                </Label>
                {!initialChecklist.customDomain && (
                  <Button variant="ghost" size="icon" className="h-5 w-5" asChild>
                    <Link href="/admin/settings" title="Configure Domain">
                      <LucideArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Configure a custom domain for your food truck website
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="subscribe" 
              checked={checklist.subscribed} 
              onCheckedChange={() => handleCheckboxChange('subscribed')}
              disabled={initialChecklist.subscribed}
            />
            <div className="grid gap-1.5 leading-none">
              <div className="flex items-center gap-2">
                <Label htmlFor="subscribe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Subscribe to a plan
                </Label>
                {!initialChecklist.subscribed && (
                  <Button variant="ghost" size="icon" className="h-5 w-5" asChild>
                    <Link href="/admin/subscribe" title="Choose a Plan">
                      <LucideArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {initialChecklist.subscribed 
                  ? 'Current plan: Basic'
                  : 'Choose a subscription plan to publish your website'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 