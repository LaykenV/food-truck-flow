'use client';

import { OrderStatusTracker } from '@/components/OrderStatusTracker';
import { useParams } from 'next/navigation';

interface OrderStatusTrackerWrapperProps {
  primaryColor?: string;
  secondaryColor?: string;
}

export function OrderStatusTrackerWrapper({
  primaryColor = '#FF6B35',
  secondaryColor = '#2EC4B6',
}: OrderStatusTrackerWrapperProps) {
  const params = useParams();
  const subdomain = params.subdomain as string;
  
  return <OrderStatusTracker 
    subdomain={subdomain} 
    primaryColor={primaryColor} 
    secondaryColor={secondaryColor} 
  />;
} 