'use client';

import React from 'react';
import { useCart } from '@/lib/cartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MinusCircle, PlusCircle, ShoppingCart, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface CartProps {
  onCheckout?: () => void;
  foodTruckId: string;
}

export function Cart({ onCheckout, foodTruckId }: CartProps) {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const router = useRouter();
  
  // Filter items to only show those from this food truck
  const foodTruckItems = items.filter(item => item.food_truck_id === foodTruckId);
  
  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      // Navigate to the order page
      router.push('./order');
    }
  };
  
  if (foodTruckItems.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add items from the menu to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {foodTruckItems.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-4">
            <div className="grid gap-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-muted-foreground">{formatCurrency(item.price)}</div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <MinusCircle className="h-4 w-4" />
                <span className="sr-only">Decrease quantity</span>
              </Button>
              <span className="w-4 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only">Increase quantity</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 ml-2"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove item</span>
              </Button>
            </div>
          </div>
        ))}
        <Separator />
        <div className="flex items-center justify-between font-medium">
          <div>Total</div>
          <div>{formatCurrency(totalPrice)}</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleCheckout}
          disabled={foodTruckItems.length === 0}
        >
          Checkout
        </Button>
      </CardFooter>
    </Card>
  );
} 