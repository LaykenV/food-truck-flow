"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideHome, LucideSettings, LucideShoppingCart, LucideBarChart, LucideMenu, LucideCreditCard, LucideLogOut, LucideUser, LucideCalendar } from 'lucide-react'
import Image from 'next/image'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar'
import { signOutAction } from '@/app/actions'
import { useQuery } from '@tanstack/react-query'
import { getFoodTruck } from '@/app/admin/clientQueries'


export function AdminSidebar() {
  const pathname = usePathname()

  const { data: foodTruck, isLoading, error } = useQuery({
    queryKey: ['foodTruck'],
    queryFn:  getFoodTruck
  })
  
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
      href: '/admin/schedule',
      label: 'Schedule',
      icon: LucideCalendar
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
      href: '/admin/account',
      label: 'Account',
      icon: LucideUser
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: LucideSettings
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
        <div className="flex items-center gap-3">
          {(isLoading || error || !foodTruck?.configuration?.logo) ? (
            <div className="h-8 w-8 rounded-full bg-muted" />
          ) : (
            <Image 
              src={foodTruck.configuration.logo} 
              alt={`${foodTruck.configuration.name ?? 'Food Truck'} Logo`} 
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">FoodTruckFlow</h1>
            {isLoading ? (
              <p className="text-sm text-muted-foreground truncate">Loading...</p>
            ) : error ? (
              <p className="text-sm text-red-500 truncate">Error loading info</p>
            ) : (
              <p className="text-sm text-muted-foreground truncate">
                {foodTruck?.configuration?.name ?? 'Truck Name Not Set'}
              </p>
            )}
          </div>
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
                prefetch={true}
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