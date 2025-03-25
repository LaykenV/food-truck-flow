'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlusCircle, MessageCircle, MinusCircle, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { MenuItem as MenuItemType } from '@/lib/cartContext';
import { useCart } from '@/lib/cartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MenuItemProps {
  item: MenuItemType;
  primaryColor?: string;
  secondaryColor?: string;
}

export function MenuItem({ item, primaryColor = '#FF6B35', secondaryColor = '#2EC4B6' }: MenuItemProps) {
  const { addItem, updateItemNotes } = useCart();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const handleAddToCart = () => {
    // Add the item to cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addItem(item);
    }
    
    // Update notes if provided
    if (notes.trim()) {
      updateItemNotes(item.id, notes.trim());
    }
    
    // Reset state
    setNotes('');
    setQuantity(1);
    setIsDialogOpen(false);
  };
  
  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);
  
  // Get the image source - support both item.image and item.image_url
  const imageSource = item.image || (item as any).image_url;
  
  // Create gradient border style with primary and secondary colors
  const gradientBorderStyle = {
    backgroundImage: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})`,
    padding: '2px',
  };
  
  return (
    <>
      {/* Photo-centric card with gradient border that opens dialog when clicked */}
      <div 
        className="group h-full rounded-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
        style={gradientBorderStyle}
        onClick={() => setIsDialogOpen(true)}
      >
        <Card className="h-full flex flex-col overflow-hidden">
          <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
            {imageSource ? (
              <Image 
                src={imageSource} 
                alt={item.name} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-300" 
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-200">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            {/* Price badge */}
            <Badge 
              className="absolute bottom-2 right-2 font-medium text-white border-0"
              style={{ backgroundColor: primaryColor }}
            >
              {formatCurrency(item.price)}
            </Badge>
          </div>
          
          {/* Minimal info overlay at the bottom */}
          <div className="p-3 flex-grow">
            <h3 className="font-medium text-gray-900 line-clamp-1">{item.name}</h3>
          </div>
        </Card>
      </div>

      {/* Detailed Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden mx-auto max-w-[calc(100%-2rem)] rounded-lg">
          <div className="p-6 pb-3">
            <DialogHeader>
              <DialogTitle className="text-xl" style={{ color: primaryColor }}>{item.name}</DialogTitle>
            </DialogHeader>
          </div>
          
          {/* Image after header */}
          <div className="relative w-full aspect-video">
            {imageSource ? (
              <Image 
                src={imageSource} 
                alt={item.name}
                fill
                className="object-cover" 
                sizes="(max-width: 768px) 100vw, 500px"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-200">
                <ShoppingBag className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="p-6 pt-4">
            {/* Price immediately after image */}
            <div className="text-lg font-medium mb-2" style={{ color: secondaryColor }}>
              {formatCurrency(item.price)}
            </div>
            
            {/* Description */}
            <p className="text-gray-600">{item.description}</p>
            
            {/* Special Instructions */}
            <div className="mt-6 grid gap-2">
              <Label htmlFor="notes" className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" />
                Special Instructions (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Any special requests or modifications?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            {/* Quantity selector */}
            <div className="mt-6 flex items-center justify-between">
              <Label className="font-medium">Quantity</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    decrementQuantity();
                  }}
                >
                  <MinusCircle className="h-4 w-4" />
                  <span className="sr-only">Decrease quantity</span>
                </Button>
                <span className="w-4 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    incrementQuantity();
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only">Increase quantity</span>
                </Button>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                className={cn("w-full text-white")}
                style={{ backgroundColor: primaryColor }}
                onClick={handleAddToCart}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add to Cart • {formatCurrency(item.price * quantity)}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 