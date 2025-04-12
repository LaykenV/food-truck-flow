'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer';
import { useCart } from '@/lib/cartContext';
import { Cart } from '@/components/Cart';
import { cn } from '@/lib/utils';

interface ShoppingCartDrawerProps {
  foodTruckId: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export function ShoppingCartDrawer({ 
  foodTruckId, 
  primaryColor = '#FF6B35', 
  secondaryColor = '#2EC4B6' 
}: ShoppingCartDrawerProps) {
  const [open, setOpen] = useState(false);
  const [buttonAnimation, setButtonAnimation] = useState<'idle' | 'bounce'>('idle');
  const [prevItemCount, setPrevItemCount] = useState(0);
  const { items } = useCart();
  const pathname = usePathname();
  
  // Determine if we're on the order page
  const isOrderPage = pathname.includes('/order');
  
  // Filter items to only show those from this food truck
  const foodTruckItems = items.filter(item => item.food_truck_id === foodTruckId);
  const itemCount = foodTruckItems.reduce((total, item) => total + item.quantity, 0);
  
  // Add animation when items are added to the cart, but not on initial load
  useEffect(() => {
    // Skip animation on initial render/refresh
    if (prevItemCount === 0 && itemCount > 0) {
      setPrevItemCount(itemCount);
      return;
    }
    
    // Only animate when items increase
    if (itemCount > prevItemCount) {
      setButtonAnimation('bounce');
      const timer = setTimeout(() => {
        setButtonAnimation('idle');
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    setPrevItemCount(itemCount);
  }, [itemCount, prevItemCount]);
  
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-4 z-50 shopping-cart-drawer">
          {/* Bottom bump with gradient */}
          <div 
            className="absolute inset-0 rounded-t-[16px] shadow-lg"
            style={{ 
              background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Pull up indicator */}
            <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-10 h-1 bg-white/30 rounded-full" />
          </div>
          
          {/* Cart icon and count - positioned in the center */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-7 transform-gpu will-change-transform">
            <div 
              className={cn(
                "relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform",
                buttonAnimation === 'bounce' && "animate-cart-bounce"
              )}
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                border: '2px solid white',
              }}
            >
              <ShoppingCart className="h-7 w-7 text-white" />
              {itemCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 bg-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                  style={{ 
                    color: primaryColor,
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                    opacity: '0.8'
                  }}
                >
                  {itemCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </DrawerTrigger>
      
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="p-4 border-b" style={{ backgroundColor: `${primaryColor}10` }}>
          <DrawerTitle className="flex items-center justify-center gap-2">
            <ShoppingCart className="h-5 w-5" style={{ color: '#000000', opacity: '0.8' }} />
            <span style={{ color: '#000000', opacity: '0.8' }}>
              Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="overflow-y-auto flex-1 max-h-[calc(90vh-180px)]">
          <Cart 
            foodTruckId={foodTruckId} 
            primaryColor={primaryColor} 
            secondaryColor={secondaryColor} 
            hideCheckoutButton={isOrderPage}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
} 