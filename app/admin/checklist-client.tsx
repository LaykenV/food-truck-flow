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
    <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-admin-card-foreground">Getting Started Checklist</CardTitle>
          <CardDescription className="text-admin-muted-foreground">Complete these tasks to set up your food truck website</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="setup-profile" 
              checked={checklist.profileSetup} 
              onCheckedChange={() => handleCheckboxChange('profileSetup')}
              className="border-admin-primary data-[state=checked]:bg-admin-primary data-[state=checked]:text-admin-primary-foreground"
            />
            <div className="grid gap-1.5 leading-none">
              <div className="flex items-center gap-2">
                <Label htmlFor="setup-profile" className="text-sm font-medium leading-none text-admin-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Set up your profile
                </Label>
                {!initialChecklist.profileSetup && (
                  <Button variant="admin-ghost" size="icon" className="h-5 w-5 text-admin-muted-foreground hover:text-admin-foreground hover:bg-admin-accent/50" asChild>
                    <Link href="/admin/config" title="Configure Profile">
                      <LucideArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
              <p className="text-sm text-admin-muted-foreground">
                Add your food truck name, logo, and contact information
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="customize-website" 
              checked={checklist.customColors} 
              onCheckedChange={() => handleCheckboxChange('customColors')}
              className="border-admin-primary data-[state=checked]:bg-admin-primary data-[state=checked]:text-admin-primary-foreground"
            />
            <div className="grid gap-1.5 leading-none">
              <div className="flex items-center gap-2">
                <Label htmlFor="customize-website" className="text-sm font-medium leading-none text-admin-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Customize your website
                </Label>
                {!initialChecklist.customColors && (
                  <Button variant="admin-ghost" size="icon" className="h-5 w-5 text-admin-muted-foreground hover:text-admin-foreground hover:bg-admin-accent/50" asChild>
                    <Link href="/admin/config" title="Customize Colors">
                      <LucideArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
              <p className="text-sm text-admin-muted-foreground">
                Choose colors to customize your website
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="add-menu" 
              checked={checklist.menuItems} 
              onCheckedChange={() => handleCheckboxChange('menuItems')}
              className="border-admin-primary data-[state=checked]:bg-admin-primary data-[state=checked]:text-admin-primary-foreground"
            />
            <div className="grid gap-1.5 leading-none">
              <div className="flex items-center gap-2">
                <Label htmlFor="add-menu" className="text-sm font-medium leading-none text-admin-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Add menu items
                </Label>
                {!initialChecklist.menuItems && (
                  <Button variant="admin-ghost" size="icon" className="h-5 w-5 text-admin-muted-foreground hover:text-admin-foreground hover:bg-admin-accent/50" asChild>
                    <Link href="/admin/menus" title="Add Menu Items">
                      <LucideArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
              <p className="text-sm text-admin-muted-foreground">
                Create your menu with prices and descriptions
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="setup-domain" 
              checked={checklist.customDomain} 
              onCheckedChange={() => handleCheckboxChange('customDomain')}
              className="border-admin-primary data-[state=checked]:bg-admin-primary data-[state=checked]:text-admin-primary-foreground"
            />
            <div className="grid gap-1.5 leading-none">
              <div className="flex items-center gap-2">
                <Label htmlFor="setup-domain" className="text-sm font-medium leading-none text-admin-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Set up domain name
                </Label>
                {!initialChecklist.customDomain && (
                  <Button variant="admin-ghost" size="icon" className="h-5 w-5 text-admin-muted-foreground hover:text-admin-foreground hover:bg-admin-accent/50" asChild>
                    <Link href="/admin/settings" title="Configure Domain">
                      <LucideArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
              <p className="text-sm text-admin-muted-foreground">
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
              className="border-admin-primary data-[state=checked]:bg-admin-primary data-[state=checked]:text-admin-primary-foreground"
            />
            <div className="grid gap-1.5 leading-none">
              <div className="flex items-center gap-2">
                <Label htmlFor="subscribe" className="text-sm font-medium leading-none text-admin-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Subscribe to a plan
                </Label>
                {!initialChecklist.subscribed && (
                  <Button variant="admin-ghost" size="icon" className="h-5 w-5 text-admin-muted-foreground hover:text-admin-foreground hover:bg-admin-accent/50" asChild>
                    <Link href="/admin/account/subscribe" title="Choose a Plan">
                      <LucideArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
              <p className="text-sm text-admin-muted-foreground">
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