'use client';

import { formatTimeRange } from '@/lib/schedule-utils';

interface FormattedTimeDisplayProps {
  openTime: string;
  closeTime: string;
  timezone?: string;
}

export function FormattedTimeDisplay({ openTime, closeTime, timezone }: FormattedTimeDisplayProps) {
  const formattedRange = formatTimeRange(openTime, closeTime, timezone);
  
  return (
    <span className="font-medium text-admin-foreground">
      {formattedRange}
    </span>
  );
} 