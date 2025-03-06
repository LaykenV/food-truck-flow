'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { MenuItem as MenuItemType } from '@/lib/cartContext';
import { useCart } from '@/lib/cartContext';

interface MenuItemProps {
  item: MenuItemType;
  primaryColor?: string;
}

export function MenuItem({ item, primaryColor = '#FF6B35' }: MenuItemProps) {
  const { addItem } = useCart();
  
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
        <Button 
          onClick={() => addItem(item)}
          className="w-full"
          style={{ backgroundColor: primaryColor }}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
} 