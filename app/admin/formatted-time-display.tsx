'use client';

import { format } from 'date-fns'

interface FormattedTimeDisplayProps {
  openTime: string
  closeTime: string
}

export function FormattedTimeDisplay({ openTime, closeTime }: FormattedTimeDisplayProps) {
  const formatTimeString = (timeStr: string) => {
    try {
      // Parse 24-hour format (e.g., "14:30") to readable 12-hour format
      const [hours, minutes] = timeStr.split(':').map(Number)
      
      // Create a date object with today's date but set the hours and minutes
      const date = new Date()
      date.setHours(hours, minutes, 0, 0)
      
      // Format to 12-hour time with AM/PM
      return format(date, 'h:mm a')
    } catch (e) {
      console.error('Error formatting time:', e)
      return timeStr
    }
  }
  
  const formattedOpenTime = formatTimeString(openTime)
  const formattedCloseTime = formatTimeString(closeTime)
  
  return (
    <span className="font-medium text-admin-foreground">
      {formattedOpenTime} – {formattedCloseTime}
    </span>
  )
} 