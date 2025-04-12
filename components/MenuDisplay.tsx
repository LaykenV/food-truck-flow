'use client';

import React, { useState } from 'react';
import { MenuItem as MenuItemComponent } from '@/components/MenuItem';
import { MenuItem } from '@/lib/cartContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface MenuDisplayProps {
  items: MenuItem[];
  primaryColor?: string;
  secondaryColor?: string;
}

export function MenuDisplay({ items, primaryColor, secondaryColor }: MenuDisplayProps) {
  // Group items by category
  const categories = Array.from(new Set(items.map(item => item.category)));
  
  // Set "All" as the default selected tab
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Track active item index for each category (for mobile scrolling)
  const [activeCategoryItems, setActiveCategoryItems] = useState<Record<string, number>>(
    categories.reduce((acc, category) => ({ ...acc, [category]: 0 }), {})
  );
  
  // If there are no items, show a message
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No menu items available</p>
      </div>
    );
  }
  
  // Style for unselected tabs
  const unselectedTabStyle = {
    borderColor: 'transparent',
    color: 'var(--foreground)'
  };
  
  // Style for selected tabs
  const selectedTabStyle = {
    borderColor: primaryColor,
    color: primaryColor,
    backgroundColor: secondaryColor ? `${secondaryColor}15` : undefined
  };

  // Handle scroll events for mobile carousel
  const handleScroll = (category: string, e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollLeft;
    const categoryItems = items.filter(item => item.category === category);
    const itemWidth = container.scrollWidth / categoryItems.length;
    const newActiveIndex = Math.round(scrollPosition / itemWidth);
    
    if (newActiveIndex !== activeCategoryItems[category]) {
      setActiveCategoryItems(prev => ({
        ...prev,
        [category]: newActiveIndex
      }));
    }
  };
  
  return (
    <>
      {/* Mobile View - Vertically stacked categories with horizontally scrollable items */}
      <div className="space-y-10 lg:hidden">
        {categories.map(category => {
          const categoryItems = items.filter(item => item.category === category);
          
          return (
            <div key={category} className="space-y-4">
              {/* Category heading with primary color */}
              <h3 
                className="text-xl font-bold flex items-center pb-2 border-b" 
                style={{ color: '#000000', opacity: '0.8', borderColor: `${primaryColor}30` }}
              >
                {category}
              </h3>
              
              {/* Horizontal scrollable container with snap for menu items */}
              <div className="relative">
                <div 
                  className="flex overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide"
                  onScroll={(e) => handleScroll(category, e)}
                >
                  {categoryItems.map(item => (
                    <div 
                      key={item.id} 
                      className="min-w-[250px] w-[85vw] max-w-[300px] px-2 mr-2 snap-center flex-shrink-0"
                    >
                      <MenuItemComponent
                        item={item}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Scroll indicators for mobile */}
                {categoryItems.length > 1 && (
                  <div className="flex justify-center mt-2">
                    <div className="flex space-x-2">
                      {categoryItems.map((_, index) => (
                        <div 
                          key={index} 
                          className={cn(
                            "transition-all duration-300",
                            activeCategoryItems[category] === index 
                              ? "w-6 h-2 rounded-full" 
                              : "w-2 h-2 rounded-full opacity-70"
                          )}
                          style={{ 
                            backgroundColor: 
                              activeCategoryItems[category] === index 
                                ? secondaryColor || primaryColor
                                : `color-mix(in srgb, ${secondaryColor || primaryColor} 30%, white)` 
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Desktop View - Tabs Interface */}
      <div className="hidden lg:block">
        <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <ScrollArea className="w-full">
            <TabsList className="mb-4 flex w-max">
              <TabsTrigger 
                key="All" 
                value="All"
                className="px-4 py-2"
                style={selectedCategory === 'All' ? selectedTabStyle : unselectedTabStyle}
              >
                All
              </TabsTrigger>
              {categories.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="px-4 py-2"
                  style={selectedCategory === category ? selectedTabStyle : unselectedTabStyle}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
          
          <TabsContent key="All" value="All" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(item => (
                <MenuItemComponent 
                  key={item.id} 
                  item={item} 
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              ))}
            </div>
          </TabsContent>
          
          {categories.map(category => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items
                  .filter(item => item.category === category)
                  .map(item => (
                    <MenuItemComponent 
                      key={item.id} 
                      item={item} 
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                    />
                  ))
                }
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
} 