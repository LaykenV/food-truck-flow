'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MinusCircle, PlusCircle, ShoppingCart, Trash2, MessageCircle, Edit, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

interface CartProps {
  onCheckout?: () => void;
  foodTruckId: string;
  primaryColor?: string;
  secondaryColor?: string;
  hideCheckoutButton?: boolean;
  isPublished?: boolean;
  subdomain?: string;
}

export function Cart({ onCheckout, foodTruckId, primaryColor = '#FF6B35', secondaryColor = '#2EC4B6', hideCheckoutButton = false, isPublished, subdomain }: CartProps) {
  const { items, removeItem, updateQuantity, updateItemNotes, totalItems, totalPrice, isUpdating, error } = useCart();
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const router = useRouter();
  
  // Filter items to only show those from this food truck
  const foodTruckItems = items.filter(item => item.food_truck_id === foodTruckId);
  
  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      isPublished ? router.push(`/order`) : router.push(`/${subdomain}/order`);
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
      <Card className="w-full border rounded-xl shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted/30 p-4 mb-4">
              <ShoppingCart className="h-10 w-10" style={{ color: primaryColor }} />
            </div>
            <p className="font-medium text-lg mb-2">Your cart is empty</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Add items from the menu to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full border rounded-xl shadow-sm overflow-hidden">
      {/* Error message display */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-3">
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            {error}
          </p>
        </div>
      )}
      
      {/* Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }}></div>
        </div>
      )}
      
      <CardContent className="p-4 sm:p-5">
        <div className="grid gap-5">
          {foodTruckItems.map((item) => (
            <div key={item.id} className="flex flex-col border-b pb-5">
              <div className="flex items-start gap-3">
                {/* Item image */}
                <div className="relative flex-shrink-0">
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted">
                    {(item.image || item.image_url) ? (
                      <Image 
                        src={item.image || item.image_url || ''}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted/40">
                        <div style={{ color: primaryColor }}>🍽️</div>
                      </div>
                    )}
                  </div>
                  <Badge 
                    className="absolute -top-2 -right-2 flex items-center justify-center h-6 min-w-6 rounded-full" 
                    style={{ backgroundColor: primaryColor }}
                  >
                    {item.quantity}
                  </Badge>
                </div>
                
                {/* Item details */}
                <div className="flex-1 grid gap-1">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm font-medium" style={{ color: '#000000', opacity: '0.8' }}>{formatCurrency(item.price)}</div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-2"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{ borderColor: primaryColor, opacity: '0.7' }}
                    disabled={isUpdating}
                  >
                    <MinusCircle className="h-4 w-4" style={{ color: primaryColor, opacity: '0.7' }} />
                    <span className="sr-only">Decrease quantity</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-2"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{ borderColor: primaryColor, opacity: '0.7' }}
                    disabled={isUpdating}
                  >
                    <PlusCircle className="h-4 w-4" style={{ color: primaryColor, opacity: '0.7' }} />
                    <span className="sr-only">Increase quantity</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full ml-1"
                    onClick={() => removeItem(item.id)}
                    disabled={isUpdating}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              </div>
              
              {/* Notes section */}
              {editingNotes === item.id ? (
                <div className="mt-3 ml-19 pl-0 sm:ml-19">
                  <Textarea
                    placeholder="Add special instructions..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="text-sm min-h-[80px] border-2 focus-visible:ring-offset-0 focus-visible:ring-0"
                    style={{ borderColor: `${primaryColor}30` }}
                    disabled={isUpdating}
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingNotes(null)}
                      className="rounded-full"
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleSaveNotes(item.id)}
                      className="rounded-full"
                      style={{ backgroundColor: primaryColor, opacity: '0.8' }}
                      disabled={isUpdating}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 pl-19 ml-0 sm:ml-19">
                  {item.notes ? (
                    <div className="text-sm text-muted-foreground flex justify-between items-start bg-muted/20 p-2 rounded-lg">
                      <div className="flex items-start gap-1.5">
                        <MessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                        <span className="italic text-sm">{item.notes}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 hover:bg-muted/30"
                        onClick={() => handleEditNotes(item.id, item.notes)}
                        disabled={isUpdating}
                      >
                        <Edit className="h-3 w-3 mr-1" style={{ color: primaryColor }} />
                        <span style={{ color: primaryColor }}>Edit</span>
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs text-muted-foreground flex items-center hover:bg-muted/20 rounded-full px-3"
                      onClick={() => handleEditNotes(item.id)}
                      disabled={isUpdating}
                    >
                      <MessageCircle className="h-3.5 w-3.5 mr-1.5" style={{ color: primaryColor }} />
                      Add special instructions
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex items-center justify-between font-medium text-lg py-2">
          <div>Total</div>
          <div className="font-bold" style={{ color: '#000000', opacity: '0.8' }}>{formatCurrency(totalPrice)}</div>
        </div>
      </CardContent>
      
      {!hideCheckoutButton && (
        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full py-6 font-medium text-white rounded-full transition-all hover:opacity-90 active:scale-98 text-lg"
            onClick={handleCheckout}
            style={{ 
              background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              opacity: '0.8'
            }}
            disabled={foodTruckItems.length === 0 || isUpdating}
          >
            {isUpdating ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                Updating...
              </span>
            ) : (
              `Checkout (${totalItems} ${totalItems === 1 ? 'item' : 'items'})`
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 