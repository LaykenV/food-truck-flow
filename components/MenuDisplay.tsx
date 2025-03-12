'use client';

import React, { useState } from 'react';
import { MenuItem as MenuItemComponent } from '@/components/MenuItem';
import { MenuItem } from '@/lib/cartContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MenuDisplayProps {
  items: MenuItem[];
  primaryColor?: string;
}

export function MenuDisplay({ items, primaryColor }: MenuDisplayProps) {
  // Group items by category
  const categories = Array.from(new Set(items.map(item => item.category)));
  
  // Set "All" as the default selected tab
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // If there are no items, show a message
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No menu items available</p>
      </div>
    );
  }
  
  return (
    <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
      <ScrollArea className="w-full">
        <TabsList className="mb-4 flex w-max">
          <TabsTrigger 
            key="All" 
            value="All"
            className="px-4 py-2"
            style={{ 
              borderColor: selectedCategory === 'All' ? primaryColor : undefined,
              color: selectedCategory === 'All' ? primaryColor : undefined
            }}
          >
            All
          </TabsTrigger>
          {categories.map(category => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="px-4 py-2"
              style={{ 
                borderColor: selectedCategory === category ? primaryColor : undefined,
                color: selectedCategory === category ? primaryColor : undefined
              }}
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </ScrollArea>
      
      <TabsContent key="All" value="All" className="mt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map(item => (
            <MenuItemComponent 
              key={item.id} 
              item={item} 
              primaryColor={primaryColor}
            />
          ))}
        </div>
      </TabsContent>
      
      {categories.map(category => (
        <TabsContent key={category} value={category} className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items
              .filter(item => item.category === category)
              .map(item => (
                <MenuItemComponent 
                  key={item.id} 
                  item={item} 
                  primaryColor={primaryColor}
                />
              ))
            }
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
} 