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
import { Loader2 } from 'lucide-react';

interface OrderFormProps {
  foodTruckId: string;
  subdomain?: string;
  onSuccess?: () => void;
}

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
      const supabase = createClient();
      
      // Create the order in the database
      const { data, error } = await supabase
        .from('Orders')
        .insert({
          food_truck_id: foodTruckId,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          notes: formData.notes,
          items: foodTruckItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          total_amount: totalPrice,
          status: 'pending',
        })
        .select('id')
        .single();
      
      if (error) {
        throw error;
      }
      
      // Store the order ID in localStorage for tracking
      if (data?.id) {
        localStorage.setItem('activeOrderId', data.id);
        localStorage.setItem('orderExpiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
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
          ? `/${subdomain}/order-confirmation?id=${data?.id}`
          : `/order-confirmation?id=${data?.id}`;
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any special requests or instructions"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(totalPrice)}</span>
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