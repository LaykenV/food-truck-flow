import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';
import { formatTimeRange } from '@/lib/schedule-utils';
import { cn } from '@/lib/utils';

export interface ScheduleDayGroup {
  days: {
    day: string;
    location?: string;
    address?: string;
    openTime?: string;
    closeTime?: string;
    isClosed?: boolean;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }[];
  dayRange: string;
}

interface ScheduleCardProps {
  group: ScheduleDayGroup;
  primaryColor: string;
  secondaryColor: string;
  className?: string;
}

export function ScheduleCard({ 
  group, 
  primaryColor, 
  secondaryColor,
  className
}: ScheduleCardProps) {
  const firstDay = group.days[0];
  const isClosed = firstDay.isClosed;
  
  // Function to generate map direction links
  const getDirectionLinks = (coordinates?: { lat: number; lng: number }) => {
    if (!coordinates) return null;
    
    const { lat, lng } = coordinates;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    const appleMapsUrl = `https://maps.apple.com/?q=${lat},${lng}`;
    
    return { googleMapsUrl, appleMapsUrl };
  };
  
  // Generate direction links based on coordinates
  const directionLinks = getDirectionLinks(firstDay.coordinates);
  
  return (
    <Card 
      className={cn(
        "h-full overflow-hidden border-2 transition-all duration-200 hover:shadow-md",
        className
      )} 
      style={{ borderColor: isClosed ? 'rgba(0,0,0,0.1)' : primaryColor + '20' }}
    >
      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="flex items-start gap-3">
          <div 
            className="p-2 rounded-full shrink-0 mt-0.5"
            style={{ 
              backgroundColor: `color-mix(in srgb, ${secondaryColor} 20%, white)` 
            }}
          >
            <Calendar 
              className="h-4 w-4" 
              style={{ color: secondaryColor }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-lg sm:text-xl leading-tight truncate">
              {group.dayRange}
            </h3>
            {isClosed ? (
              <Badge 
                variant="outline" 
                className="mt-1 text-xs bg-destructive/10 text-destructive border-destructive/20"
              >
                Closed
              </Badge>
            ) : (
              <Badge 
                variant="outline" 
                className="mt-1 text-xs"
                style={{ 
                  backgroundColor: `color-mix(in srgb, ${primaryColor} 10%, white)`,
                  borderColor: `color-mix(in srgb, ${primaryColor} 30%, white)`,
                  color: primaryColor
                }}
              >
                {(firstDay.openTime && firstDay.closeTime) ? 
                  formatTimeRange(firstDay.openTime, firstDay.closeTime) : 
                  'Hours vary'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {firstDay.address && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 min-h-[40px]">
            {firstDay.address}
          </p>
        )}
        
        {/* Location Display */}
        <div className="flex items-center mb-4">
          <div 
            className="p-2 rounded-full mr-3 shrink-0"
            style={{ 
              backgroundColor: `color-mix(in srgb, ${secondaryColor} 20%, white)` 
            }}
          >
            <MapPin 
              className="h-4 w-4" 
              style={{ color: secondaryColor }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-base sm:text-lg truncate">
              {firstDay.location || 'Location'}
            </p>
          </div>
        </div>
      </CardContent>
      
      {/* Direction Buttons */}
      {(firstDay.address || firstDay.coordinates) && !isClosed && (
        <CardFooter className="p-4 pt-0">
          <div className="flex gap-2 w-full">
            {directionLinks ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-9 text-xs sm:text-sm"
                  style={{ 
                    borderColor: primaryColor,
                    color: primaryColor
                  }}
                  asChild
                >
                  <a 
                    href={directionLinks.googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="truncate">Google Maps</span>
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-9 text-xs sm:text-sm"
                  style={{ 
                    borderColor: primaryColor,
                    color: primaryColor
                  }}
                  asChild
                >
                  <a 
                    href={directionLinks.appleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="truncate">Apple Maps</span>
                  </a>
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                disabled
              >
                No directions available
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
} 