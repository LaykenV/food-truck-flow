"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideHome, LucideSettings, LucideShoppingCart, LucideBarChart, LucideMenu, LucideCreditCard, LucideLogOut } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar'
import { signOutAction } from '@/app/actions'

interface AdminSidebarProps {
  foodTruckName?: string
}

export function AdminSidebar({ foodTruckName = "Food Truck" }: AdminSidebarProps) {
  const pathname = usePathname()
  
  const routes = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LucideHome,
      exact: true
    },
    {
      href: '/admin/config',
      label: 'Configuration',
      icon: LucideSettings
    },
    {
      href: '/admin/menus',
      label: 'Menus',
      icon: LucideMenu
    },
    {
      href: '/admin/orders',
      label: 'Orders',
      icon: LucideShoppingCart
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: LucideBarChart
    },
    {
      href: '/admin/subscribe',
      label: 'Subscription',
      icon: LucideCreditCard
    }
  ]

  return (
    <Sidebar
      className="border-r"
      style={
        {
          "--sidebar-width": "16rem",
        } as React.CSSProperties
      }
    >
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">FoodTruckFlow</h1>
          <p className="text-sm text-muted-foreground truncate">{foodTruckName}</p>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <nav className="grid gap-1">
          {routes.map((route) => {
            const isActive = route.exact 
              ? pathname === route.href
              : pathname.startsWith(route.href)
            
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "transparent"
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            )
          })}
        </nav>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <form action={signOutAction}>
          <Button type="submit" variant="outline" className="w-full justify-start">
            <LucideLogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
} 