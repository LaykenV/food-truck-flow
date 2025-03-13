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
}

export function MenuItem({ item, primaryColor = '#FF6B35' }: MenuItemProps) {
  const { addItem, updateItemNotes } = useCart();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  
  const handleAddToCart = () => {
    addItem(item);
    // Get the item ID from the cart (it will be the same as the menu item ID)
    if (notes.trim()) {
      updateItemNotes(item.id, notes.trim());
    }
    setNotes('');
    setIsDialogOpen(false);
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {item.image ? (
        <div className="relative h-40 w-full">
          <Image 
            src={item.image} 
            alt={item.name} 
            fill 
            className="object-cover" 
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : (
        <div className="h-40 bg-gray-200"></div>
      )}
      <CardContent className="p-4 flex-grow">
        <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
        <p className="mt-2 text-base font-medium text-gray-900">{formatCurrency(item.price)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full"
              style={{ backgroundColor: primaryColor }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add {item.name} to Cart</DialogTitle>
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