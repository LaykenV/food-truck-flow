'use client';

import { formatTimeRange } from "@/lib/schedule-utils";

export function FormattedTimeDisplay({ openTime, closeTime }: { openTime?: string; closeTime?: string }) {
  if (!openTime || !closeTime) return null;
  return <>{formatTimeRange(openTime, closeTime)}</>;
} 