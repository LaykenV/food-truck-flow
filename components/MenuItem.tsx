'use client';

import React, { useState, useEffect } from 'react';
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
import { usePathname } from 'next/navigation';

// Helper function to generate JSON-LD script tag
function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

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
  const [showNotesField, setShowNotesField] = useState(false);
  const pathname = usePathname();
  const [currentUrl, setCurrentUrl] = useState('');
  
  // Set the current URL safely on the client side
  useEffect(() => {
    setCurrentUrl(window.location.origin + pathname);
  }, [pathname]);
  
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
    setShowNotesField(false);
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
  
  // Create Product schema for this menu item - only if dialog is open and we have a URL
  const productSchema = currentUrl ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": item.name,
    "description": item.description || '',
    "image": imageSource || '',
    "offers": {
      "@type": "Offer",
      "price": item.price.toFixed(2),
      "priceCurrency": "USD",
      "availability": "http://schema.org/InStock",
      "url": currentUrl
    }
  } : null;
  
  return (
    <>
      {/* Photo-centric card with gradient border that opens dialog when clicked */}
      <div 
        className="h-full rounded-lg overflow-hidden cursor-pointer"
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
                className="object-cover" 
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
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden mx-auto max-w-[calc(100%-2rem)] rounded-lg max-h-[90vh] flex flex-col">
          <div className="relative p-6 pb-3 flex items-center justify-center">
            {/* Price in top left */}
            <div className="absolute left-6 top-6 text-lg font-medium" style={{ color: '#000000', opacity: '0.8' }}>
              {formatCurrency(item.price)}
            </div>
            
            {/* Item name centered */}
            <DialogTitle className="text-xl text-center" style={{ color: '#000000', opacity: '0.8' }}>{item.name}</DialogTitle>
          </div>
          
          {/* Square image after header - with max height */}
          <div className="relative w-full aspect-square overflow-hidden">
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
          
          <div className="p-6 pt-4 overflow-y-auto">
            {/* Description */}
            <p className="text-gray-600">{item.description}</p>
            
            {/* Special Instructions */}
            <div className="mt-6">
              {showNotesField ? (
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
                    className="min-h-[40px]"
                  />
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground flex items-center hover:bg-muted/20 rounded-full px-3"
                  onClick={() => setShowNotesField(true)}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" style={{ color: primaryColor }} />
                  Add special instructions
                </Button>
              )}
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
                style={{ backgroundColor: primaryColor, opacity: '0.8' }}
                onClick={handleAddToCart}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add to Cart • {formatCurrency(item.price * quantity)}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* JSON-LD structured data - only render when dialog is open and schema is available */}
      {isDialogOpen && productSchema && <JsonLdScript data={productSchema} />}
    </>
  );
} 