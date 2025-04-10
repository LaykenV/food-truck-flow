'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CheckCircle, Clock, ArrowLeft, Home, ChefHat, Package, Timer } from 'lucide-react';
import { format } from 'date-fns';

// This component has been optimized to use Supabase Realtime subscriptions
// for order status updates instead of polling. This reduces server load
// and provides more responsive updates to users.

interface OrderConfirmationClientProps {
  orderId: string | null;
  subdomain: string;
  primaryColor: string;
  secondaryColor: string;
}

export function OrderConfirmationClient({ 
  orderId, 
  subdomain, 
  primaryColor, 
  secondaryColor 
}: OrderConfirmationClientProps) {
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<{
    status: string;
    pickup_time: string | null;
    is_asap: boolean;
    items?: any[];
    total?: number;
    created_at?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Keep track of the current subscription
  const [currentSubscription, setCurrentSubscription] = useState<{ channel: any; orderId: string } | null>(null);
  
  // Function to fetch order details
  const fetchOrderDetails = async (id: string) => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Match the query structure from OrderStatusTracker.tsx
      const { data, error } = await supabase
        .from('Orders')
        .select('*')  // Select all fields first as a safer approach
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (data) {
        setOrderStatus(data.status);
        setOrderDetails({
          status: data.status,
          pickup_time: data.pickup_time,
          is_asap: data.is_asap,
          items: data.items,
          total: data.total,
          created_at: data.created_at
        });
      } else {
        console.log('No order found with ID:', id);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to set up a subscription for an order
  const setupOrderSubscription = (id: string) => {
    // If we already have a subscription for this order, don't create a new one
    if (currentSubscription && currentSubscription.orderId === id) {
      return;
    }
    
    // Clean up any existing subscription
    if (currentSubscription) {
      const supabase = createClient();
      supabase.removeChannel(currentSubscription.channel);
      console.log('Cleaned up previous subscription before creating new one');
    }
    
    // Set up real-time subscription for order status updates
    const supabase = createClient();
    const channel = supabase
      .channel(`order-confirmation-${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'Orders',
        filter: `id=eq.${id}`,
      }, (payload) => {
        if (payload.new) {
          // Update status
          if (payload.new.status) {
            setOrderStatus(payload.new.status);
          }
          
          // Update order details and clear loading state
          setOrderDetails(prevDetails => ({
            ...prevDetails,
            status: payload.new.status || prevDetails?.status || '',
            pickup_time: payload.new.pickup_time !== undefined ? payload.new.pickup_time : prevDetails?.pickup_time || null,
            is_asap: payload.new.is_asap !== undefined ? payload.new.is_asap : prevDetails?.is_asap || false,
            items: payload.new.items || prevDetails?.items,
            total: payload.new.total || prevDetails?.total
          }));
          setLoading(false);
          
          console.log('Real-time update received for order:', id, 'Status:', payload.new.status);
        }
      })
      .subscribe((status) => {
        console.log(`Subscription status for order ${id}:`, status);
      });
    
    setCurrentSubscription({ channel, orderId: id });
    console.log('Subscription set up for order:', id);
  };
  
  // Fetch order details and set up subscription
  useEffect(() => {
    if (!orderId) return;
    
    // Initial fetch
    fetchOrderDetails(orderId);
    
    // Set up subscription
    setupOrderSubscription(orderId);
  }, [orderId]);
  
  // Clean up subscription when component unmounts
  useEffect(() => {
    return () => {
      if (currentSubscription) {
        try {
          console.log('Cleaning up subscription for order:', currentSubscription.orderId);
          const supabase = createClient();
          supabase.removeChannel(currentSubscription.channel);
          // Setting to null not needed as component is unmounting, but good practice
        } catch (error) {
          console.error('Error cleaning up subscription:', error);
        }
      }
    };
  }, [currentSubscription]);
  
  // Format pickup time with relative time if it's today
  const formatPickupTime = (pickupTime: string | null, isAsap: boolean) => {
    if (isAsap) {
      return 'As soon as possible';
    }
    
    if (!pickupTime) {
      return null;
    }
    
    const pickupDate = new Date(pickupTime);
    const now = new Date();
    
    // If it's today, show relative time (e.g., "Today at 2:30 PM")
    if (pickupDate.toDateString() === now.toDateString()) {
      return `Today at ${format(pickupDate, 'h:mm a')}`;
    }
    
    // Otherwise show full date and time
    return format(pickupDate, 'MMM d, yyyy h:mm a');
  };
  
  // Calculate time remaining until pickup
  const getTimeUntilPickup = (pickupTime: string) => {
    const pickupDate = new Date(pickupTime);
    const now = new Date();
    const diffMinutes = Math.floor((pickupDate.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes < 0) {
      return 'Overdue';
    } else if (diffMinutes < 1) {
      return 'Less than a minute';
    } else if (diffMinutes === 1) {
      return '1 minute';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minutes`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };
  
  // Check if pickup time is approaching (within 15 minutes)
  const isPickupApproaching = (pickupTime: string | null) => {
    if (!pickupTime) return false;
    
    const pickupDate = new Date(pickupTime);
    const now = new Date();
    const diffMinutes = Math.floor((pickupDate.getTime() - now.getTime()) / (1000 * 60));
    
    return diffMinutes >= 0 && diffMinutes <= 15;
  };
  
  // Get the status icon based on the current status
  const getStatusIcon = () => {
    if (loading) {
      return (
        <div className="animate-spin h-5 w-5 border-2 rounded-full" 
          style={{ 
            borderColor: `${secondaryColor}30`,
            borderTopColor: secondaryColor
          }} 
        />
      );
    }
    
    switch (orderStatus) {
      case 'preparing':
        return <ChefHat className="h-5 w-5" style={{ color: secondaryColor }} />;
      case 'ready':
        return <Package className="h-5 w-5" style={{ color: secondaryColor }} />;
      case 'completed':
        return <CheckCircle className="h-5 w-5" style={{ color: secondaryColor }} />;
      default:
        return <Clock className="h-5 w-5" style={{ color: secondaryColor }} />;
    }
  };
  
  // Get the status text based on the current status
  const getStatusText = () => {
    if (loading) {
      return 'Updating order status...';
    }
    
    switch (orderStatus) {
      case 'preparing':
        return 'Your order is being prepared';
      case 'ready':
        return 'Your order is ready for pickup';
      case 'completed':
        return 'Your order has been completed';
      default:
        return orderStatus ? 'Order status: ' + orderStatus : 'Checking status...';
    }
  };
  
  // Get the status color based on the current status
  const getStatusColor = () => {
    if (loading) {
      return {
        className: 'bg-gray-50 text-gray-500',
        style: { 
          borderColor: `${secondaryColor}30`,
          color: secondaryColor
        }
      };
    }
    
    switch (orderStatus) {
      case 'preparing':
        return {
          className: '',
          style: {
            backgroundColor: `${primaryColor}15`,
            color: primaryColor,
            borderColor: `${primaryColor}30`
          }
        };
      case 'ready':
        return {
          className: '',
          style: {
            backgroundColor: `${secondaryColor}15`,
            color: secondaryColor,
            borderColor: `${secondaryColor}30`
          }
        };
      case 'completed':
        return {
          className: 'bg-gray-100',
          style: {
            color: 'rgba(75, 85, 99, 1)',
            borderColor: 'rgba(229, 231, 235, 1)'
          }
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-800',
          style: {}
        };
    }
  };
  
  // Countdown timer that updates every minute
  const PickupCountdown = ({ pickupTime }: { pickupTime: string }) => {
    const [timeRemaining, setTimeRemaining] = useState(getTimeUntilPickup(pickupTime));
    const [isApproaching, setIsApproaching] = useState(isPickupApproaching(pickupTime));
    
    useEffect(() => {
      // Update the countdown
      const updateCountdown = () => {
        setTimeRemaining(getTimeUntilPickup(pickupTime));
        setIsApproaching(isPickupApproaching(pickupTime));
      };
      
      // Initial update
      updateCountdown();
      
      // Update more frequently (every 15 seconds) when approaching pickup time
      // Otherwise update every minute
      const intervalId = setInterval(() => {
        updateCountdown();
      }, isApproaching ? 15000 : 60000);
      
      return () => clearInterval(intervalId);
    }, [pickupTime, isApproaching]);
    
    return (
      <span className={`text-xs font-medium ${isApproaching ? "text-amber-600" : "text-gray-600"}`}>
        {timeRemaining}
      </span>
    );
  };
  
  // Create dynamic styles with the provided colors
  const linkStyle = { color: primaryColor };
  const borderStyle = { borderColor: `${primaryColor}30` };
  const gradientButtonStyle = { 
    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
    border: 'none',
    opacity: 0.9
  };
  const outlineButtonStyle = { 
    color: primaryColor,
    borderColor: `${secondaryColor}60`
  };
  
  return (
    <div className="min-h-screen bg-gray-50 md:py-8">
      {/* Spacer for navbar */}
      <div className="h-16"></div>
      
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-md">
        <Card className="border rounded-xl overflow-hidden shadow-lg">
          <CardHeader className="text-center pb-2 pt-6">
            <div 
              className="mx-auto p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4"
              style={{ background: `${secondaryColor}15` }}
            >
              <CheckCircle className="h-8 w-8" style={{ color: secondaryColor }} />
            </div>
            <CardTitle className="text-2xl font-bold">
              <span style={{ color: primaryColor }}>Order </span>
              <span style={{ color: primaryColor }}>Confirmed</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 px-5 pt-4">
            <div className="text-center">
              <p className="text-gray-600">
                Thank you for your order! Your order has been received and is being processed.
              </p>
              {orderId && (
                <p className="mt-2 text-sm text-gray-500">
                  Order ID: <span className="font-medium" style={{ color: secondaryColor }}>{orderId}</span>
                </p>
              )}
              {orderDetails?.created_at && (
                <p className="mt-1 text-xs text-gray-500">
                  Placed on {format(new Date(orderDetails.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </div>
            
            {/* Order Status Section - Styled like OrderStatusTracker */}
            <div className="p-4 rounded-lg border" style={borderStyle}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium" style={{ color: primaryColor }}>Order Status</h3>
                <Badge 
                  variant="outline" 
                  className={getStatusColor().className}
                  style={getStatusColor().style}
                >
                  {loading ? "Loading" : orderStatus}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3 mt-3">
                <div className="p-2 rounded-full" style={{ 
                  background: `linear-gradient(135deg, ${secondaryColor}15 0%, ${secondaryColor}25 100%)`
                }}>
                  {getStatusIcon()}
                </div>
                <div>
                  <p className="text-sm font-medium">{getStatusText()}</p>
                </div>
              </div>
              
              {/* Pickup Time Information */}
              {orderDetails && (
                <div className="mt-3 pt-3 border-t" style={borderStyle}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" style={{ color: secondaryColor }} />
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        {orderDetails.is_asap 
                          ? "Pickup: As soon as possible" 
                          : orderDetails.pickup_time 
                            ? `Pickup: ${formatPickupTime(orderDetails.pickup_time, false)}`
                            : "Pickup time not specified"
                        }
                      </p>
                      {orderDetails.pickup_time && !orderDetails.is_asap && orderStatus !== 'completed' && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Timer className="h-3 w-3" style={{ color: secondaryColor }} />
                          <PickupCountdown pickupTime={orderDetails.pickup_time} />
                          {isPickupApproaching(orderDetails.pickup_time) && (
                            <Badge 
                              variant="outline" 
                              className="ml-1 py-0 h-4 text-[10px]"
                              style={{ 
                                backgroundColor: `${secondaryColor}15`,
                                color: secondaryColor,
                                borderColor: `${secondaryColor}30`
                              }}
                            >
                              Soon
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Order Details Summary */}
            {orderDetails?.items && orderDetails.items.length > 0 && (
              <div className="border rounded-lg p-4" style={borderStyle}>
                <h3 className="font-medium mb-2" style={{ color: primaryColor }}>Order Summary</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.quantity}x {item.name}</span>
                      <span className="text-gray-600">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                {orderDetails.total !== undefined && (
                  <div className="border-t mt-3 pt-2 flex justify-between font-medium" style={borderStyle}>
                    <span>Total</span>
                    <span style={{ color: secondaryColor }}>${orderDetails.total.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center gap-4 pb-6 pt-2">
            <Button 
              asChild 
              variant="outline"
              className="border hover:bg-transparent transition-colors hover:border-opacity-80"
              style={outlineButtonStyle}
            >
              <Link href={`/${subdomain}/menu`}>
                <ArrowLeft className="h-4 w-4 mr-2" style={{ color: secondaryColor }} />
                Back to Menu
              </Link>
            </Button>
            <Button 
              asChild
              className="transition-colors hover:opacity-90"
              style={gradientButtonStyle}
            >
              <Link href={`/${subdomain}`}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 