"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideHome, LucideSettings, LucideShoppingCart, LucideBarChart, LucideMenu, LucideCreditCard, LucideLogOut, LucideUser, LucideCalendar } from 'lucide-react'
import Image from 'next/image'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { signOutAction } from '@/app/actions'
import { useQuery } from '@tanstack/react-query'
import { getFoodTruck } from '@/app/admin/clientQueries'
import { Skeleton } from '@/components/ui/skeleton'

export function AdminSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

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
  
  // Close the mobile sidebar when navigating to a new route
  const handleNavigation = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar
      className="border-r border-admin-border bg-gradient-to-b from-admin-primary/5 to-admin/95 text-admin-foreground"
      style={
        {
          "--sidebar-width": "16rem",
        } as React.CSSProperties
      }
    >
      <SidebarHeader className="px-3 py-3 h-14 bg-admin-primary/5 flex items-center">
        <div className="flex items-center gap-3 px-2 w-full">
          {(isLoading || error || !foodTruck?.configuration?.logo) ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-admin-primary/20 shadow-sm">
              <Image 
                src={foodTruck.configuration.logo} 
                alt={`${foodTruck.configuration.name ?? 'Food Truck'} Logo`} 
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col justify-center flex-1 min-w-0">
            {isLoading ? (
              <Skeleton className="h-5 w-3/4" />
            ) : error ? (
              <p className="text-sm text-admin-destructive truncate">Error loading info</p>
            ) : (
              <p className="text-base font-medium truncate text-admin-foreground">
                {foodTruck?.configuration?.name ?? 'Truck Name Not Set'}
              </p>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-3 mt-2">
        <nav className="grid gap-1.5">
          {routes.map((route) => {
            const isActive = route.exact 
              ? pathname === route.href
              : pathname.startsWith(route.href)
            
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-r from-admin-primary to-[hsl(var(--admin-gradient-end))] text-admin-primary-foreground shadow-sm" 
                    : "text-admin-foreground/80 hover:bg-admin-accent/30 hover:text-admin-foreground"
                )}
                prefetch={true}
                onClick={handleNavigation}
              >
                <route.icon className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isActive ? "text-admin-primary-foreground" : "text-admin-muted-foreground"
                )} />
                <span>{route.label}</span>
              </Link>
            )
          })}
        </nav>
      </SidebarContent>
      <SidebarFooter className="border-t border-admin-border p-3">
        <form action={signOutAction}>
          <Button 
            type="submit" 
            variant="outline" 
            className="w-full justify-start text-admin-foreground/80 border-admin-border hover:bg-admin-secondary/50 hover:text-admin-foreground transition-all duration-200"
          >
            <LucideLogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
} 