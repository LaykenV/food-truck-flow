'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, ChefHat, Package, X, Timer } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { format } from 'date-fns';

// This component has been optimized to use Supabase Realtime subscriptions
// for order status updates instead of polling. This reduces server load
// and provides more responsive updates to users.

interface OrderStatusTrackerProps {
  subdomain: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface ActiveOrder {
  id: string;
  expiresAt: number;
}

interface OrderDetails {
  status: string;
  pickup_time: string | null;
  is_asap: boolean;
}

export function OrderStatusTracker({ 
  subdomain,
  primaryColor = '#FF6B35',
  secondaryColor = '#2EC4B6' 
}: OrderStatusTrackerProps) {
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [menuButtonVisible, setMenuButtonVisible] = useState(false);
  const [cartDrawerVisible, setCartDrawerVisible] = useState(false);
  
  // Use a ref to track the last selected order ID to prevent unwanted switches
  const userSelectedOrderRef = useRef<string | null>(null);
  
  // Function to get active orders from cookie
  const getActiveOrders = () => {
    try {
      const ordersJson = getCookie('activeOrders');
      if (ordersJson) {
        const orders = JSON.parse(String(ordersJson)) as ActiveOrder[];
        // Filter out expired orders
        const now = Date.now();
        const validOrders = orders.filter(order => order.expiresAt > now);
        
        // If we filtered out any expired orders, update the cookie
        if (validOrders.length !== orders.length) {
          if (validOrders.length === 0) {
            deleteCookie('activeOrders');
          } else {
            setCookie('activeOrders', JSON.stringify(validOrders), {
              maxAge: 60 * 60 * 24, // 24 hours
              path: '/',
            });
          }
        }
        
        return validOrders;
      }
    } catch (error) {
      console.error('Error parsing active orders:', error);
    }
    return [];
  };
  
  // Function to fetch order status
  const fetchOrderStatus = async (orderId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('Orders')
        .select('status, pickup_time, is_asap')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      if (data) {
        setOrderStatus(data.status);
        setOrderDetails({
          status: data.status,
          pickup_time: data.pickup_time,
          is_asap: data.is_asap
        });
      }
    } catch (error) {
      console.error('Error fetching order status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Set up a cookie change listener and custom event listener
  useEffect(() => {
    // Check for orders initially
    loadOrders();
    
    // Set up an interval to check for cookie changes - using a longer interval for efficiency
    const intervalId = setInterval(() => {
      loadOrders();
    }, 5000); // Check every 5 seconds instead of every second
    
    // Listen for the custom event from OrderForm
    const handleOrderUpdate = () => {
      loadOrders();
    };
    
    window.addEventListener('orderStatusUpdate', handleOrderUpdate);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('orderStatusUpdate', handleOrderUpdate);
    };
  }, []);
  
  // Refresh order status periodically when visible
  // OPTIMIZATION: Removed polling interval to rely solely on Supabase Realtime subscriptions
  // This reduces server load and provides immediate updates without unnecessary API calls
  // Similar to the optimization done in OrderConfirmationClient
  
  // Function to load orders and set up subscriptions
  const loadOrders = () => {
    const orders = getActiveOrders();
    
    // Only update state if orders have changed
    if (JSON.stringify(orders) !== JSON.stringify(activeOrders)) {
      setActiveOrders(orders);
      
      // If there are no active orders, don't show the tracker
      if (orders.length === 0) {
        setLoading(false);
        setCurrentOrderId(null);
        userSelectedOrderRef.current = null;
        return;
      }
      
      // If we don't have a current order ID or it's not in the list anymore,
      // use the most recent order as the current order
      const shouldUpdateCurrentOrder = 
        !currentOrderId || 
        !orders.some(order => order.id === currentOrderId);
      
      // If the user has manually selected an order and it's still in the list,
      // keep that selection instead of defaulting to the most recent
      const userSelectedOrder = userSelectedOrderRef.current;
      const userSelectedOrderExists = userSelectedOrder && 
        orders.some(order => order.id === userSelectedOrder);
      
      if (shouldUpdateCurrentOrder) {
        // If user has a valid selection, use that
        if (userSelectedOrderExists) {
          setCurrentOrderId(userSelectedOrder);
          fetchOrderStatus(userSelectedOrder!);
          setupOrderSubscription(userSelectedOrder!);
        } else {
          // Otherwise use the most recent order
          const mostRecentOrder = orders[orders.length - 1];
          setCurrentOrderId(mostRecentOrder.id);
          userSelectedOrderRef.current = mostRecentOrder.id;
          fetchOrderStatus(mostRecentOrder.id);
          setupOrderSubscription(mostRecentOrder.id);
        }
      }
    }
  };
  
  // Keep track of the current subscription
  const [currentSubscription, setCurrentSubscription] = useState<{ channel: any; orderId: string } | null>(null);
  
  // Function to set up a subscription for an order
  const setupOrderSubscription = (orderId: string) => {
    // If we already have a subscription for this order, don't create a new one
    if (currentSubscription && currentSubscription.orderId === orderId) {
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
      .channel(`order-status-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'Orders',
        filter: `id=eq.${orderId}`,
      }, (payload) => {
        if (payload.new) {
          // Update status
          if (payload.new.status) {
            setOrderStatus(payload.new.status);
          }
          
          // Update order details and clear loading state
          setOrderDetails({
            status: payload.new.status || orderDetails?.status || '',
            pickup_time: payload.new.pickup_time !== undefined ? payload.new.pickup_time : orderDetails?.pickup_time || null,
            is_asap: payload.new.is_asap !== undefined ? payload.new.is_asap : orderDetails?.is_asap || false
          });
          setLoading(false);
          
          console.log('Real-time update received for order:', orderId, 'Status:', payload.new.status);
          
          // If the order is completed, update its expiry time to 1 hour from now
          if (payload.new.status === 'completed') {
            updateOrderExpiry(orderId, Date.now() + 60 * 60 * 1000);
          }
        }
      })
      .subscribe((status) => {
        console.log(`Subscription status for order ${orderId}:`, status);
      });
    
    setCurrentSubscription({ channel, orderId });
    console.log('Subscription set up for order:', orderId);
  };
  
  // Clean up subscription when component unmounts
  useEffect(() => {
    return () => {
      if (currentSubscription) {
        try {
          console.log('Cleaning up subscription for order:', currentSubscription.orderId);
          const supabase = createClient();
          supabase.removeChannel(currentSubscription.channel);
          // Setting to null not needed as component is unmounting
        } catch (error) {
          console.error('Error cleaning up subscription:', error);
        }
      }
    };
  }, [currentSubscription]);
  
  // Function to update an order's expiry time
  const updateOrderExpiry = (orderId: string, expiresAt: number) => {
    const updatedOrders = activeOrders.map(order => 
      order.id === orderId ? { ...order, expiresAt } : order
    );
    
    setActiveOrders(updatedOrders);
    setCookie('activeOrders', JSON.stringify(updatedOrders), {
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
  };
  
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
  
  // Function to remove an order from tracking
  const removeOrder = (orderId: string) => {
    const updatedOrders = activeOrders.filter(order => order.id !== orderId);
    
    if (updatedOrders.length === 0) {
      deleteCookie('activeOrders');
      setActiveOrders([]);
      setCurrentOrderId(null);
      userSelectedOrderRef.current = null;
    } else {
      setCookie('activeOrders', JSON.stringify(updatedOrders), {
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
      setActiveOrders(updatedOrders);
      
      // If we removed the current order, switch to the most recent one
      if (orderId === currentOrderId) {
        const mostRecentOrder = updatedOrders[updatedOrders.length - 1];
        setCurrentOrderId(mostRecentOrder.id);
        userSelectedOrderRef.current = mostRecentOrder.id;
        // Fetch the status for the new current order
        fetchOrderStatus(mostRecentOrder.id);
        setupOrderSubscription(mostRecentOrder.id);
      }
    }
  };
  
  // Handle switching between orders
  const switchToOrder = (orderId: string) => {
    if (orderId === currentOrderId) return;
    
    // Update the user selected order ref
    userSelectedOrderRef.current = orderId;
    
    setCurrentOrderId(orderId);
    // Instead of clearing the status, set loading to true
    setLoading(true);
    // Keep the previous status visible until the new one loads
    fetchOrderStatus(orderId);
    setupOrderSubscription(orderId);
  };
  
  // Handle dismissing the tracker
  const handleDismiss = () => {
    setIsDismissed(true);
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
      <span className={cn(
        "text-xs font-medium",
        isApproaching ? "text-amber-600" : "text-gray-600"
      )}>
        {timeRemaining}
      </span>
    );
  };
  
  // Update position when floating menu button or shopping cart drawer appears/disappears
  useEffect(() => {
    const checkForElements = () => {
      // Look for the floating menu button using the specific class name
      const menuButton = document.querySelector('.floating-menu-button');
      const menuButtonIsVisible = !!menuButton && 
        window.getComputedStyle(menuButton).visibility !== 'hidden' && 
        window.getComputedStyle(menuButton).opacity !== '0';
      
      // Look for the shopping cart drawer - only consider it on mobile
      const isMobile = window.innerWidth < 1024; // lg breakpoint in Tailwind is typically 1024px
      const cartDrawer = document.querySelector('.shopping-cart-drawer');
      const cartDrawerIsVisible = isMobile && !!cartDrawer && 
        window.getComputedStyle(cartDrawer).visibility !== 'hidden' && 
        window.getComputedStyle(cartDrawer).opacity !== '0';
      
      if (menuButtonIsVisible !== menuButtonVisible) {
        setMenuButtonVisible(menuButtonIsVisible);
      }
      
      if (cartDrawerIsVisible !== cartDrawerVisible) {
        setCartDrawerVisible(cartDrawerIsVisible);
      }
    };

    // Check more frequently to ensure we don't miss elements
    const intervalId = setInterval(checkForElements, 300);

    // Also check when window is resized
    const handleResize = () => {
      checkForElements();
    };
    window.addEventListener('resize', handleResize);

    // Set up an observer to detect when elements are added/removed
    const observer = new MutationObserver(() => {
      checkForElements();
    });

    // Start observing the body for DOM changes
    observer.observe(document.body, { 
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    // Check initially
    setTimeout(checkForElements, 100);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [menuButtonVisible, cartDrawerVisible]);
  
  // If there's no active order or we're still loading initially, don't render anything
  if (!currentOrderId || (loading && !orderStatus) || isDismissed) {
    return null;
  }
  
  // Get the status icon based on the current status
  const getStatusIcon = (whiteVersion = false) => {
    const iconColor = whiteVersion ? 'white' : secondaryColor;
    
    if (loading) {
      return (
        <div className="animate-spin h-5 w-5 border-2 rounded-full" 
          style={{ 
            borderColor: whiteVersion ? 'rgba(255, 255, 255, 0.3)' : `${secondaryColor}30`,
            borderTopColor: iconColor
          }} 
        />
      );
    }
    
    switch (orderStatus) {
      case 'preparing':
        return <ChefHat className="h-5 w-5" style={{ color: iconColor }} />;
      case 'ready':
        return <Package className="h-5 w-5" style={{ color: iconColor }} />;
      case 'completed':
        return <CheckCircle className="h-5 w-5" style={{ color: iconColor }} />;
      default:
        return <Clock className="h-5 w-5" style={{ color: iconColor }} />;
    }
  };
  
  // Get the status text based on the current status
  const getStatusText = () => {
    if (loading && currentOrderId) {
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

  // Handle minimizing/maximizing the tracker
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  // Create dynamic styles based on primary and secondary colors
  const cardBgStyle = { 
    backgroundColor: 'white',  // Solid white background instead of transparent
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
  };
  const buttonGradientStyle = { 
    background: `linear-gradient(135deg, ${primaryColor}90, ${secondaryColor}90)`,
    boxShadow: `0 4px 12px rgba(0, 0, 0, 0.2)`
  };
  const linkStyle = { color: primaryColor };
  const borderStyle = { borderColor: `${primaryColor}30` };
  
  return (
    <div className={cn(
      "fixed z-50 transition-all duration-500 ease-in-out",
      "sm:right-6",
      "md:right-8",
      isMinimized ? "w-14 h-14 scale-100" : "w-full max-w-xs scale-100",
      // Adjust position based on what's visible
      menuButtonVisible ? 
        "bottom-20 sm:bottom-24 md:bottom-24" : 
        cartDrawerVisible ?
          "bottom-8 sm:bottom-8 md:bottom-8 lg:bottom-4" : // Higher adjustment for cart drawer on mobile/tablet only
          "bottom-4 sm:bottom-6 md:bottom-8",
      "right-4",
      "transform transition-all duration-300"
    )}>
      {isMinimized ? (
        <div className={cn(
          "h-14 w-14 rounded-full bg-background",
          "transition-all duration-300 ease-out",
          orderDetails?.pickup_time && !orderDetails.is_asap && isPickupApproaching(orderDetails.pickup_time) && "animate-pulse"
        )}>
          <Button 
            onClick={toggleMinimize}
            className={cn(
              "w-14 h-14 rounded-full shadow-lg text-white p-0 flex items-center justify-center",
              "transform transition-all duration-300 hover:scale-105"
            )}
            style={buttonGradientStyle}
            onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.filter = ''}
          >
            {getStatusIcon(true)}
          </Button>
        </div>
      ) : (
        <Card className={cn(
          "shadow-lg transform transition-all duration-300",
          orderDetails?.pickup_time && !orderDetails.is_asap && isPickupApproaching(orderDetails.pickup_time) && "border-amber-300"
        )}
        style={{
          ...cardBgStyle,
          borderColor: `${primaryColor}30`
        }}>
          <CardHeader className="pb-2 pt-3 px-4" style={{ borderBottomColor: `${primaryColor}20` }}>
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span style={{ color: primaryColor }}>Order Status</span>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={getStatusColor().className}
                  style={getStatusColor().style}
                >
                  {loading ? "Loading" : orderStatus}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={toggleMinimize}
                >
                  <span className="sr-only">Minimize</span>
                  <span className="h-1 w-4 bg-gray-600 rounded-full block"></span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={handleDismiss}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full" style={{ 
                background: `linear-gradient(135deg, ${secondaryColor}15 0%, ${secondaryColor}25 100%)`
              }}>
                {getStatusIcon()}
              </div>
              <div>
                <p className="text-sm font-medium">{getStatusText()}</p>
                <Link 
                  href={`/order-confirmation?id=${currentOrderId}`}
                  className="text-xs hover:underline"
                  style={linkStyle}
                >
                  View details
                </Link>
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
            
            {activeOrders.length > 1 && (
              <div className="mt-3 pt-3 border-t" style={borderStyle}>
                <p className="text-xs text-gray-600 mb-1">You have {activeOrders.length} active orders</p>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {activeOrders.map((order) => (
                    <Button
                      key={order.id}
                      variant={order.id === currentOrderId ? "default" : "outline"}
                      size="sm"
                      className="text-xs py-0 h-6"
                      style={order.id === currentOrderId ? 
                        { backgroundColor: secondaryColor, color: 'white', borderColor: 'transparent' } : 
                        { borderColor: `${secondaryColor}30`, color: secondaryColor }
                      }
                      onClick={() => switchToOrder(order.id)}
                    >
                      Order #{order.id.substring(0, 4)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 