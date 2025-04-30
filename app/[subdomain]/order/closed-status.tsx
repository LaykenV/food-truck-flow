import { CalendarX } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { differenceInMinutes, parseISO } from "date-fns";

interface ScheduleDay {
  day: string;
  location?: string;
  address?: string;
  hours?: string;
  openTime?: string;
  closeTime?: string;
  isClosed?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  closureTimestamp?: string;
}

interface ClosedStatusProps {
  todaySchedule: ScheduleDay | undefined;
  primaryColor: string;
  secondaryColor: string;
}

export function ClosedStatus({ todaySchedule, primaryColor, secondaryColor }: ClosedStatusProps) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  // Format time for display
  const formatTime = (time: string | undefined) => {
    if (!time) return '';
    
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };
  
  const formatTimeRange = (openTime?: string, closeTime?: string) => {
    if (!openTime || !closeTime) return '';
    return `${formatTime(openTime)} - ${formatTime(closeTime)}`;
  };
  
  // Check if we're near closing time
  const isNearClosingTime = () => {
    if (!todaySchedule?.closeTime) return false;
    
    const now = new Date();
    const [closeHour, closeMinute] = todaySchedule.closeTime.split(':').map(Number);
    
    const closeTime = new Date();
    closeTime.setHours(closeHour, closeMinute, 0, 0);
    
    // If close time is earlier than current time on the clock, 
    // it might be for overnight hours (e.g. closing at 2 AM)
    if (closeTime < now && closeHour < 12) {
      closeTime.setDate(closeTime.getDate() + 1);
    }
    
    // Check if we're within 15 minutes of closing
    const minutesToClose = differenceInMinutes(closeTime, now);
    return minutesToClose <= 15 && minutesToClose > 0;
  };
  
  const nearClosingTime = isNearClosingTime();
  
  return (
    <Alert className="my-6 border-2" style={{ borderColor: `${primaryColor}30` }}>
      <div className="flex items-start">
        <CalendarX className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
        <div>
          <AlertTitle className="text-lg font-bold" style={{ color: primaryColor }}>
            {nearClosingTime 
              ? "Orders are no longer being accepted" 
              : "This food truck is currently closed"}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {todaySchedule ? (
              <>
                {nearClosingTime ? (
                  <p className="mt-2">
                    We're no longer accepting orders as we're preparing to close for the day.
                    Our closing time today is {formatTime(todaySchedule.closeTime)}.
                    Please visit us again tomorrow!
                  </p>
                ) : (
                  <p className="mt-2">
                    We're scheduled to be at {todaySchedule.location || 'our location'} today ({today}) 
                    {todaySchedule.openTime && todaySchedule.closeTime && (
                      <> from {formatTimeRange(todaySchedule.openTime, todaySchedule.closeTime)}</>
                    )}
                  </p>
                )}
                
                <p className="mt-2 font-medium" style={{ color: secondaryColor }}>
                  {(() => {
                    if (nearClosingTime) {
                      return "We stop taking orders 15 minutes before closing to ensure quality service.";
                    }
                    
                    if (todaySchedule.isClosed) {
                      return "We've temporarily closed for today. Please check back tomorrow!";
                    }
                    
                    if (todaySchedule.openTime) {
                      const [hour, minute] = todaySchedule.openTime.split(':').map(Number);
                      const openTime = new Date();
                      openTime.setHours(hour, minute, 0, 0);
                      
                      const now = new Date();
                      
                      if (now < openTime) {
                        return `We'll be open in ${Math.floor((openTime.getTime() - now.getTime()) / (1000 * 60))} minutes.`;
                      } else {
                        // We're after the closing time
                        return "We've closed for today. Please check back tomorrow!";
                      }
                    }
                    
                    return "We're currently closed. Please check back later!";
                  })()}
                </p>
              </>
            ) : (
              <p className="mt-2">We're not scheduled to be open today ({today}). Please check back tomorrow or visit our schedule page.</p>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
} 