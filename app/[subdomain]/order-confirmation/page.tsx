'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Clock, ArrowLeft, Home, Info } from 'lucide-react';

export default function OrderConfirmationPage() {
  // Use the useParams hook instead of accessing params directly
  const params = useParams();
  const subdomain = params.subdomain as string;
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [orderStatus, setOrderStatus] = useState('preparing');
  const [loading, setLoading] = useState(true);
  const [foodTruckConfig, setFoodTruckConfig] = useState<any>(null);
  
  // Set default colors
  const primaryColor = foodTruckConfig?.primaryColor || '#FF6B35';
  const secondaryColor = foodTruckConfig?.secondaryColor || '#2EC4B6';
  
  useEffect(() => {
    // Fetch food truck configuration for colors
    const fetchFoodTruckConfig = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('FoodTrucks')
          .select('configuration')
          .eq('subdomain', subdomain)
          .single();
        
        if (error) throw error;
        if (data && data.configuration) {
          setFoodTruckConfig(data.configuration);
        }
      } catch (error) {
        console.error('Error fetching food truck config:', error);
      }
    };
    
    if (subdomain) {
      fetchFoodTruckConfig();
    }
  }, [subdomain]);
  
  useEffect(() => {
    if (!orderId) return;
    
    const fetchOrderStatus = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('Orders')
          .select('status')
          .eq('id', orderId)
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
        filter: `id=eq.${orderId}`,
      }, (payload) => {
        if (payload.new && payload.new.status) {
          setOrderStatus(payload.new.status);
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);
  
  // Format the order status for display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready for Pickup';
      case 'completed':
        return 'Completed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  // Get status color based on order status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return secondaryColor;
      case 'completed':
        return '#4CAF50'; // green for completed
      default:
        return primaryColor; // preparing or other statuses
    }
  };
  
  // Create dynamic styles
  const linkStyle = { color: primaryColor };
  const buttonStyle = { backgroundColor: primaryColor };
  const outlineButtonStyle = { 
    color: primaryColor,
    borderColor: `${secondaryColor}60`
  };
  const iconBgStyle = { 
    backgroundColor: `${secondaryColor}20` 
  };
  const iconStyle = { color: secondaryColor };
  const cardStyle = {
    borderColor: `${secondaryColor}30`,
    boxShadow: `0 10px 25px rgba(0, 0, 0, 0.1)`
  };
  const statusColor = getStatusColor(orderStatus);
  
  return (
    <div className="min-h-screen bg-white">
      {/* Spacer for navbar */}
      <div className="h-16"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href={`/${subdomain}`} 
            className="inline-flex items-center hover:underline transition-colors"
            style={linkStyle}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
        <div className="max-w-md mx-auto">
          <Button 
            variant="ghost" 
            asChild 
            className="flex items-center gap-2 mb-6 hover:bg-transparent"
            style={{ color: secondaryColor }}
          >
            <Link href={`/${subdomain}/menu`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Menu
            </Link>
          </Button>
          
          <Card className="border-0 rounded-xl overflow-hidden" style={cardStyle}>
            <CardHeader className="text-center pb-2 pt-8">
              <div 
                className="mx-auto p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4"
                style={iconBgStyle}
              >
                <CheckCircle className="h-8 w-8" style={iconStyle} />
              </div>
              <CardTitle className="text-2xl font-bold">
                <span style={{ color: primaryColor }}>Order </span>
                <span style={{ color: secondaryColor }}>Confirmed</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6 px-6 pt-4">
              <div className="text-center">
                <p className="text-gray-600">
                  Thank you for your order! Your order has been received and is being processed.
                </p>
                {orderId && (
                  <p className="mt-2 text-sm text-gray-500">
                    Order ID: <span className="font-medium" style={{ color: secondaryColor }}>{orderId}</span>
                  </p>
                )}
              </div>
              
              <div className="p-4 rounded-md" style={{ backgroundColor: `${secondaryColor}10`, borderLeft: `3px solid ${statusColor}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5" style={{ color: statusColor }} />
                  <h3 className="font-medium" style={{ color: primaryColor }}>Order Status</h3>
                </div>
                <div className="pl-7">
                  <p className="capitalize font-medium" style={{ color: statusColor }}>
                    {loading ? 'Loading...' : getStatusDisplay(orderStatus)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    We'll update this status as your order progresses
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4 text-center text-gray-600 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-3">
                  <Info className="h-4 w-4" style={{ color: secondaryColor }} />
                </div>
                <p>
                  You will receive an email confirmation shortly at your provided email address.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-center gap-4 pb-8">
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
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  border: 'none'
                }}
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
    </div>
  );
} 