'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Clock, ArrowLeft, Home } from 'lucide-react';

export default function OrderConfirmationPage({
  params
}: {
  params: { subdomain: string }
}) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [orderStatus, setOrderStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const { subdomain } = params;
  
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
  
  return (
    <div className="bg-white min-h-screen">
      {/* Spacer for navbar */}
      <div className="h-16"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/${subdomain}`} className="inline-flex items-center text-orange-500 hover:text-orange-600">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
        <div className="max-w-md mx-auto">
          <Button variant="ghost" asChild className="flex items-center gap-2 mb-6">
            <Link href={`/${subdomain}/menu`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Menu
            </Link>
          </Button>
          
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center pb-2 pt-8">
              <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold">Order Confirmed</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6 px-6 pt-4">
              <div className="text-center">
                <p className="text-gray-600">
                  Thank you for your order! Your order has been received and is being processed.
                </p>
                {orderId && (
                  <p className="mt-2 text-sm text-gray-500">
                    Order ID: <span className="font-medium">{orderId}</span>
                  </p>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium">Order Status</h3>
                </div>
                <div className="pl-7">
                  <p className="capitalize font-medium">
                    {loading ? 'Loading...' : orderStatus}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    We'll update this status as your order progresses
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4 text-center text-gray-600">
                <p>
                  You will receive an email confirmation shortly at your provided email address.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-center gap-4 pb-8">
              <Button asChild variant="outline">
                <Link href={`/${subdomain}/menu`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Menu
                </Link>
              </Button>
              <Button asChild>
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