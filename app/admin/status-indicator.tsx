'use client';

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, formatDistance } from "date-fns"

interface StatusIndicatorProps {
  isCurrentlyOpen: boolean
  isClosed?: boolean
  closureTimestamp?: string
}

export function StatusIndicator({ isCurrentlyOpen, isClosed, closureTimestamp }: StatusIndicatorProps) {
  // If there's a closure timestamp, it's an emergency closure
  const isEmergencyClosure = isClosed && closureTimestamp

  // Format closure time if available
  const formattedClosureTime = closureTimestamp 
    ? format(new Date(closureTimestamp), "MMM d, h:mm a")
    : null

  // Get time since closure for tooltip
  const timeSinceClosure = closureTimestamp
    ? formatDistance(new Date(closureTimestamp), new Date(), { addSuffix: true })
    : null

  if (isClosed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="destructive" 
              className="px-3 py-1 text-sm font-medium rounded-full"
            >
              {isEmergencyClosure ? 'Emergency Closure' : 'Closed Today'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-admin-secondary border border-admin-border shadow-md">
            <p className="text-sm font-medium">
              {isEmergencyClosure 
                ? `Emergency closure ${timeSinceClosure} (${formattedClosureTime})`
                : 'Scheduled as closed for today'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (isCurrentlyOpen) {
    return (
      <Badge 
        variant="admin"
        className="px-3 py-1 text-sm font-medium rounded-full"
      >
        Open Now
      </Badge>
    )
  }

  return (
    <Badge 
      variant="secondary" 
      className="px-3 py-1 text-sm font-medium rounded-full"
    >
      Closed Now
    </Badge>
  )
} 