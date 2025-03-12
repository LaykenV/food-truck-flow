'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, ChefHat, Package } from 'lucide-react';
import Link from 'next/link';

interface OrderStatusTrackerProps {
  subdomain: string;
}

export function OrderStatusTracker({ subdomain }: OrderStatusTrackerProps) {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if there's an active order in localStorage
    const storedOrderId = localStorage.getItem('activeOrderId');
    const orderExpiry = localStorage.getItem('orderExpiry');
    
    // If there's no order ID or it has expired, don't show the tracker
    if (!storedOrderId || !orderExpiry || parseInt(orderExpiry) < Date.now()) {
      if (storedOrderId) {
        // Clear expired order data
        localStorage.removeItem('activeOrderId');
        localStorage.removeItem('orderExpiry');
      }
      setLoading(false);
      return;
    }
    
    setOrderId(storedOrderId);
    
    // Fetch the initial order status
    const fetchOrderStatus = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('Orders')
          .select('status')
          .eq('id', storedOrderId)
          .single();
        
        if (error) throw error;
        if (data) setOrderStatus(data.status);
      } catch (error) {
        console.error('Error fetching order status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderStatus();
    
    // Set up real-time subscription for order status updates
    const supabase = createClient();
    const channel = supabase
      .channel('order-status-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'Orders',
        filter: `id=eq.${storedOrderId}`,
      }, (payload) => {
        if (payload.new && payload.new.status) {
          setOrderStatus(payload.new.status);
          
          // If the order is completed, set it to expire in 1 hour
          if (payload.new.status === 'completed') {
            localStorage.setItem('orderExpiry', (Date.now() + 60 * 60 * 1000).toString());
          }
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // If there's no active order or we're still loading, don't render anything
  if (!orderId || loading) {
    return null;
  }
  
  // Get the status icon based on the current status
  const getStatusIcon = () => {
    switch (orderStatus) {
      case 'preparing':
        return <ChefHat className="h-5 w-5" />;
      case 'ready':
        return <Package className="h-5 w-5" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <ChefHat className="h-5 w-5" />;
    }
  };
  
  // Get the status text based on the current status
  const getStatusText = () => {
    switch (orderStatus) {
      case 'preparing':
        return 'Your order is being prepared';
      case 'ready':
        return 'Your order is ready for pickup';
      case 'completed':
        return 'Your order has been completed';
      default:
        return 'Order status: ' + orderStatus;
    }
  };
  
  // Get the status color based on the current status
  const getStatusColor = () => {
    switch (orderStatus) {
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Order Status</span>
          <Badge variant="outline" className={getStatusColor()}>
            {orderStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-full">
            {getStatusIcon()}
          </div>
          <div>
            <p className="text-sm font-medium">{getStatusText()}</p>
            <Link 
              href={`/${subdomain}/order-confirmation?id=${orderId}`}
              className="text-xs text-orange-600 hover:text-orange-700"
            >
              View details
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 