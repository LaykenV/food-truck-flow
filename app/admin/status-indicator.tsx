'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusIndicatorProps {
  isCurrentlyOpen: boolean;
  isClosed?: boolean;
  closureTimestamp?: string;
}

export function StatusIndicator({ isCurrentlyOpen, isClosed, closureTimestamp }: StatusIndicatorProps) {
  if (isClosed) {
    return (
      <Badge variant="destructive" className="text-xs">
        {closureTimestamp ? 'Emergency Closure' : 'Closed'}
      </Badge>
    );
  }
  
  if (isCurrentlyOpen) {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs">
        Open
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className="text-xs">
      Closed
    </Badge>
  );
} 