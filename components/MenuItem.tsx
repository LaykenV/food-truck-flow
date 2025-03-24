'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { PlusCircle, MessageCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { MenuItem as MenuItemType } from '@/lib/cartContext';
import { useCart } from '@/lib/cartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface MenuItemProps {
  item: MenuItemType;
  primaryColor?: string;
  secondaryColor?: string;
}

export function MenuItem({ item, primaryColor = '#FF6B35', secondaryColor = '#2EC4B6' }: MenuItemProps) {
  const { addItem, updateItemNotes } = useCart();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  
  const handleAddToCart = () => {
    addItem(item);
    if (notes.trim()) {
      updateItemNotes(item.id, notes.trim());
    }
    setNotes('');
    setIsDialogOpen(false);
  };
  
  // Get the image source - support both item.image and item.image_url
  const imageSource = item.image || (item as any).image_url;
  
  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {imageSource ? (
        <div className="relative h-32 w-full">
          <Image 
            src={imageSource} 
            alt={item.name} 
            fill 
            className="object-cover" 
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div 
            className="absolute bottom-0 right-0 p-1.5 px-2.5 rounded-tl-md font-medium text-white text-sm"
            style={{ backgroundColor: primaryColor }}
          >
            {formatCurrency(item.price)}
          </div>
        </div>
      ) : (
        <div className="h-32 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">No image available</span>
          <div 
            className="absolute bottom-0 right-0 p-1.5 px-2.5 rounded-tl-md font-medium text-white text-sm"
            style={{ backgroundColor: primaryColor }}
          >
            {formatCurrency(item.price)}
          </div>
        </div>
      )}
      <CardContent className="p-3 flex-grow">
        <h3 className="text-base font-medium text-gray-900 line-clamp-1">{item.name}</h3>
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{item.description}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full transition-all hover:opacity-90 h-9 text-sm"
              style={{ backgroundColor: primaryColor }}
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
              Add to Cart
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle style={{ color: primaryColor }}>Add {item.name} to Cart</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="notes" className="flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4" />
                  Special Instructions (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or modifications?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  addItem(item);
                  setIsDialogOpen(false);
                }}
              >
                Add Without Notes
              </Button>
              <Button 
                onClick={handleAddToCart}
                style={{ backgroundColor: primaryColor }}
              >
                Add to Cart
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
} 