"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { getFoodTruck } from '@/app/admin/clientQueries'
import { Badge } from '@/components/ui/badge'
import { isScheduledOpen } from '@/lib/schedule-utils'

interface ScheduleDay {
  day: string;
  location?: string;
  address?: string;
  hours?: string;
  openTime?: string;
  closeTime?: string;
  isClosed?: boolean;
  timezone?: string;
  closureTimestamp?: string;
}

export function AdminHeader() {
  const { data: foodTruck, isLoading, error } = useQuery({
    queryKey: ['foodTruck'],
    queryFn: getFoodTruck
  })

  // Get today's schedule and check if we're currently open
  const { todaySchedule, isCurrentlyOpen } = useMemo(() => {
    // Get schedule data from configuration
    const scheduleData = foodTruck?.configuration?.schedule?.days || []
    
    // Get today's day of the week
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    
    // Find today's schedule
    const todaySchedule = scheduleData.find((day: ScheduleDay) => day.day === today)
    
    // Check if currently within operating hours
    const isCurrentlyOpen = isScheduledOpen(todaySchedule)
    
    return { todaySchedule, isCurrentlyOpen }
  }, [foodTruck])

  return (
    <div className="sticky top-0 z-50 w-full">
      <header className="flex h-14 items-center justify-between bg-admin/60 backdrop-blur-lg px-3 sm:px-4 shadow-sm transition-all duration-200">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="h-9 w-9 text-admin-foreground/80 hover:text-admin-foreground" />
          <ThemeToggle />
          
          {/* Status Indicator */}
          {todaySchedule?.isClosed ? (
            <Badge variant="admin-destructive" className="text-xs px-2">
              {todaySchedule.closureTimestamp ? 'Emergency Closure' : 'Closed Today'}
            </Badge>
          ) : isCurrentlyOpen ? (
            <Badge className="bg-green-500 hover:bg-green-500 text-white text-xs px-2">
              Open Now
            </Badge>
          ) : todaySchedule ? (
            <Badge variant="admin-secondary" className="text-xs px-2">
              Closed Now
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs px-2 border-admin-border text-admin-muted-foreground">
              No Schedule Set
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isLoading && !error && foodTruck?.subdomain && (
            <Button 
              size="sm" 
              variant="admin"
              asChild
              className="bg-gradient-to-r from-admin-primary to-[hsl(var(--admin-gradient-end))] hover:opacity-90 text-admin-primary-foreground border-none shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <Link href={`www.${foodTruck.subdomain}.foodtruckflow.com`} target="_blank" className="flex items-center gap-1">
                <span className="hidden md:inline">Visit My Website</span>
                <span className="inline md:hidden">Preview</span>
                <ExternalLink className="h-3 w-3 ml-0.5" />
              </Link>
            </Button>
          )}
        </div>
      </header>
      <div className="h-px w-full bg-gradient-to-r from-admin-border/40 via-admin-border to-admin-border/40"></div>
    </div>
  )
} 