'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Clock } from 'lucide-react';
import { getCookie, setCookie } from 'cookies-next';
import { PickupTimeSelector, PickupTimeInfo } from './PickupTimeSelector';

interface OrderFormProps {
  foodTruckId: string;
  subdomain?: string;
  onSuccess?: () => void;
}

interface ActiveOrder {
  id: string;
  expiresAt: number;
}

// Create a custom event for order tracking updates
const triggerOrderUpdate = () => {
  // Create and dispatch a custom event that the OrderStatusTracker can listen for
  const event = new CustomEvent('orderStatusUpdate');
  window.dispatchEvent(event);
};

export function OrderForm({ foodTruckId, subdomain, onSuccess }: OrderFormProps) {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter items to only show those from this food truck
  const foodTruckItems = items.filter(item => item.food_truck_id === foodTruckId);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Pickup time state
  const [pickupInfo, setPickupInfo] = useState<PickupTimeInfo>({
    time: null,
    isAsap: true
  });
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle navigation back to menu
  const handleCancel = () => {
    if (subdomain) {
      router.push(`/${subdomain}/menu`);
    } else {
      router.back();
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (foodTruckItems.length === 0) {
      toast("Cart is empty", {
        description: "Please add items to your cart before placing an order.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use the new API route instead of directly interacting with Supabase
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          food_truck_id: foodTruckId,
          customer_name: formData.name,
          customer_email: formData.email,
          items: foodTruckItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            notes: item.notes || '' // Include item notes
          })),
          total_amount: totalPrice,
          pickup_time: pickupInfo.time ? pickupInfo.time.toISOString() : null,
          is_asap: pickupInfo.isAsap
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to place order');
      }
      
      // Store the order ID in a cookie for tracking
      if (result.orderId) {
        // Get existing active orders from cookie
        let activeOrders: ActiveOrder[] = [];
        try {
          const ordersJson = getCookie('activeOrders');
          if (ordersJson) {
            activeOrders = JSON.parse(String(ordersJson));
            
            // Clean up any expired orders while we're at it
            const now = Date.now();
            activeOrders = activeOrders.filter(order => order.expiresAt > now);
          }
        } catch (error) {
          console.error('Error parsing active orders:', error);
        }
        
        // Add the new order
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
        activeOrders.push({
          id: result.orderId,
          expiresAt
        });
        
        // Save the updated orders
        setCookie('activeOrders', JSON.stringify(activeOrders), {
          maxAge: 60 * 60 * 24, // 24 hours
          path: '/',
          sameSite: 'strict'
        });
        
        // Trigger the order tracker to update immediately
        triggerOrderUpdate();
      }
      
      // Clear the cart
      clearCart();
      
      // Show success message
      toast("Order placed successfully!", {
        description: "Your order has been received and is being processed.",
      });
      
      // Call the success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        const redirectPath = subdomain 
          ? `/${subdomain}/order-confirmation?id=${result.orderId}`
          : `/order-confirmation?id=${result.orderId}`;
        router.push(redirectPath);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast("Failed to place order", {
        description: "There was an error processing your order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Complete Your Order</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Your phone number"
              value={formData.phone}
              onChange={handleChange}
            />
            <p className="text-xs text-muted-foreground">
              For order notifications (not stored in database)
            </p>
          </div>
          
          {/* Pickup Time Selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Pickup Time
            </Label>
            <PickupTimeSelector 
              onChange={setPickupInfo}
              className="pt-1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Order Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any special requests or instructions for the entire order"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>
          
          {/* Order Summary */}
          <div className="mt-6 space-y-4 bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium">Order Summary</h3>
            <div className="space-y-2">
              {foodTruckItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span className="font-medium">{item.quantity}x {item.name}</span>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground italic mt-0.5">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                  <div className="text-right">{formatCurrency(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Back to Menu
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Place Order'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 