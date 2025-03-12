'use client';

import { OrderStatusTracker } from '@/components/OrderStatusTracker';
import { useParams } from 'next/navigation';

export function OrderStatusTrackerWrapper() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  
  return <OrderStatusTracker subdomain={subdomain} />;
} 