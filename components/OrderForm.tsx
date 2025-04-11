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

// Format a phone number as the user types
const formatPhoneNumber = (value: string): string => {
  // Strip all non-digit characters
  const digitsOnly = value.replace(/\D/g, '');
  
  // Don't format if empty
  if (!digitsOnly) return '';
  
  // Format based on length
  if (digitsOnly.length <= 3) {
    return digitsOnly;
  } else if (digitsOnly.length <= 6) {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
  } else {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
  }
};

interface OrderFormProps {
  foodTruckId: string;
  subdomain?: string;
  onSuccess?: () => void;
  primaryColor?: string;
  secondaryColor?: string;
  closingTime?: string | null;
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

export function OrderForm({ 
  foodTruckId, 
  subdomain, 
  onSuccess, 
  primaryColor = '#FF6B35', 
  secondaryColor = '#2EC4B6',
  closingTime
}: OrderFormProps) {
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
    
    // Special handling for phone number formatting
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
          customer_phone_number: formData.phone,
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
  
  // Define styles using the color props
  const labelStyle = { color: primaryColor };
  const focusRingStyle = { 
    "--focus-ring": `0 0 0 2px ${primaryColor}30`,
    "--ring": `0 0 0 1px ${primaryColor}30`
  } as React.CSSProperties;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" style={{ color: primaryColor }}>Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border-gray-300 focus:border-transparent"
            style={focusRingStyle}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" style={{ color: primaryColor }}>Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            pattern="^[0-9+\-\(\) ]{10,15}$"
            placeholder="Your phone number"
            value={formData.phone}
            onChange={handleChange}
            required
            className="border-gray-300 focus:border-transparent"
            style={focusRingStyle}
          />
          <p className="text-xs text-muted-foreground">
            Enter 10-15 digits (e.g., 123-456-7890)
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" style={{ color: primaryColor }}>Email (optional)</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Your email"
            value={formData.email}
            onChange={handleChange}
            className="border-gray-300 focus:border-transparent"
            style={focusRingStyle}
          />
        </div>
        
        {/* Pickup Time Selector */}
        <div className="space-y-2 p-3 rounded-md" style={{ backgroundColor: `${secondaryColor}08` }}>
          <Label className="flex items-center gap-1.5" style={{ color: secondaryColor, opacity: 0.9 }}>
            <Clock className="h-4 w-4" style={{ color: secondaryColor }} />
            Pickup Time
          </Label>
          <PickupTimeSelector 
            onChange={setPickupInfo}
            closingTime={closingTime || undefined}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes" style={{ color: secondaryColor, opacity: 0.9 }}>Additional Order Notes (optional)</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Any special requests or instructions for the entire order"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="border-gray-300 focus:border-transparent"
            style={focusRingStyle}
          />
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="space-y-4 rounded-lg p-4" style={{ backgroundColor: `${secondaryColor}10` }}>
        <h3 className="font-medium flex items-center gap-2">
          <span style={{ color: secondaryColor }}>●</span>
          <span style={{ color: secondaryColor, opacity: 0.9 }}>Order Summary</span>
        </h3>
        <div className="space-y-2 text-sm">
          {foodTruckItems.length === 0 ? (
            <p className="text-gray-500">Your cart is empty</p>
          ) : (
            <>
              {foodTruckItems.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.quantity} × {item.name}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 font-medium flex justify-between">
                <span>Total</span>
                <span style={{ color: primaryColor}}>{formatCurrency(totalPrice)}</span>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCancel}
          style={{ color: secondaryColor, borderColor: `${secondaryColor}60` }}
          className="hover:bg-transparent hover:border-opacity-80 transition-all"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || foodTruckItems.length === 0}
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` 
          }}
          className="transition-all opacity-90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Place Order'
          )}
        </Button>
      </div>
    </form>
  );
} 