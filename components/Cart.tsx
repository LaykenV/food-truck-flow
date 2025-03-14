'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MinusCircle, PlusCircle, ShoppingCart, Trash2, MessageCircle, Edit } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';

interface CartProps {
  onCheckout?: () => void;
  foodTruckId: string;
}

export function Cart({ onCheckout, foodTruckId }: CartProps) {
  const { items, removeItem, updateQuantity, updateItemNotes, totalItems, totalPrice } = useCart();
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
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

  // Handle opening the notes editor
  const handleEditNotes = (itemId: string, currentNotes: string = '') => {
    setEditingNotes(itemId);
    setNoteText(currentNotes);
  };
  
  // Handle saving notes
  const handleSaveNotes = (itemId: string) => {
    updateItemNotes(itemId, noteText);
    setEditingNotes(null);
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
          <div key={item.id} className="flex flex-col border-b pb-4">
            <div className="flex items-start justify-between gap-4">
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
            
            {/* Notes section */}
            {editingNotes === item.id ? (
              <div className="mt-2">
                <Textarea
                  placeholder="Add special instructions..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="text-sm min-h-[80px]"
                />
                <div className="flex justify-end mt-1 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditingNotes(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleSaveNotes(item.id)}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                {item.notes ? (
                  <div className="text-sm text-muted-foreground flex justify-between items-start">
                    <div className="flex items-start gap-1">
                      <MessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="italic">{item.notes}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2"
                      onClick={() => handleEditNotes(item.id, item.notes)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-muted-foreground flex items-center"
                    onClick={() => handleEditNotes(item.id)}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Add special instructions
                  </Button>
                )}
              </div>
            )}
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