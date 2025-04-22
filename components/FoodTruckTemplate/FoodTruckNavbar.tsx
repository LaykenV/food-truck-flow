'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import { DisplayMode } from './index';
import { cn } from '@/lib/utils';

export interface FoodTruckNavbarProps {
  config: {
    name?: string;
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    heroFont?: string;
  };
  subdomain: string;
  displayMode?: DisplayMode;
  forceViewMode?: 'mobile' | 'desktop';
}

export default function FoodTruckNavbar({ 
  config, 
  subdomain,
  displayMode = 'live',
  forceViewMode
}: FoodTruckNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { items } = useCart();
  
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  // Extract configuration data with defaults
  const {
    name = 'Food Truck',
    logo,
    primaryColor = '#FF6B35',
    secondaryColor = '#2EC4B6',
    heroFont = '#ffffff',
  } = config;

  // Check if current page is a page without hero section
  const isNonHeroPage = pathname.includes('/menu') || pathname.includes('/order');

  // Determine if we should show mobile view based on forceViewMode or screen size
  const [isMobileView, setIsMobileView] = useState(forceViewMode === 'mobile');

  useEffect(() => {
    if (forceViewMode) {
      setIsMobileView(forceViewMode === 'mobile');
      // When forceViewMode is set, don't add resize listeners
      // to prevent screen size from overriding the forced mode
    } else {
      const checkMobileView = () => {
        setIsMobileView(window.innerWidth < 768);
      };
      
      checkMobileView();
      window.addEventListener('resize', checkMobileView);
      
      return () => {
        window.removeEventListener('resize', checkMobileView);
      };
    }
  }, [forceViewMode]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      // Find the closest scrollable container based on display mode
      const scrollableContainer = displayMode === 'preview' 
        ? (document.getElementById('preview-scroll-container') || 
           document.getElementById('desktop-preview-scroll-container'))
        : window;
        
      if (scrollableContainer) {
        // For preview mode, check if scrollTop is greater than a small threshold
        const isScrolled = displayMode === 'preview'
          ? (scrollableContainer as Element).scrollTop > 10
          : window.scrollY > 10;
          
        setScrolled(isScrolled);
      }
    };

    // Call handleScroll on initial render to set the correct state
    setTimeout(() => {
      handleScroll();
    }, 100);

    // Add scroll event listener to the appropriate container
    if (displayMode === 'preview') {
      const mobileContainer = document.getElementById('preview-scroll-container');
      const desktopContainer = document.getElementById('desktop-preview-scroll-container');
      
      if (mobileContainer) {
        mobileContainer.addEventListener('scroll', handleScroll);
      }
      
      if (desktopContainer) {
        desktopContainer.addEventListener('scroll', handleScroll);
      }
      
      // Force a scroll event to ensure the navbar state is correct
      setTimeout(() => {
        handleScroll();
      }, 200);

      // Add periodic check for scroll position in preview mode
      const intervalId = setInterval(() => {
        handleScroll();
      }, 500); // Check every 500ms
      
      return () => {
        if (mobileContainer) {
          mobileContainer.removeEventListener('scroll', handleScroll);
        }
        
        if (desktopContainer) {
          desktopContainer.removeEventListener('scroll', handleScroll);
        }
        
        clearInterval(intervalId);
      };
    } else {
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [displayMode]);

  // Navigation links
  const navLinks = [
    { href: `/${subdomain}/menu`, label: 'Menu' },
    { href: `#schedule-section`, label: 'Locations' },
    { href: `#contact-section`, label: 'Contact' },
  ];

  // Handle link click in preview mode
  const handleLinkClick = (e: React.MouseEvent) => {
    if (displayMode === 'preview') {
      e.preventDefault();
      // Maybe show a toast: "This link is disabled in preview mode"
    }
  };

  // Render link based on display mode
  const renderLink = (href: string, children: React.ReactNode, className: string) => {
    if (displayMode === 'live') {
      return (
        <Link href={href} className={className} prefetch={true}>
          {children}
        </Link>
      );
    } else {
      return (
        <a href="#" onClick={handleLinkClick} className={className}>
          {children}
        </a>
      );
    }
  };

  return (
    <>
      <header 
        className={cn(
          `${displayMode === 'preview' ? (forceViewMode === 'mobile' ? 'absolute mt-6' : 'absolute mt-8') : 'fixed'} top-0 left-0 right-0 z-50 transition-all duration-300`,
          scrolled || isNonHeroPage
            ? 'bg-background/95 backdrop-blur-sm shadow-sm py-2' 
            : 'bg-transparent py-4'
        )}
        style={{
          width: displayMode === 'preview' ? '100%' : 'auto',
        }}
      >
        <div className="w-full lg:w-[90%] mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo and Name */}
            <div className={isMobileView ? "flex-1 flex justify-center" : ""}>
              {renderLink(`/${subdomain}`, (
                <div className="flex items-center gap-2">
                  {logo ? (
                    <div className="h-10 w-10 relative">
                      <Image 
                        src={logo} 
                        alt={name} 
                        fill 
                        className="object-contain" 
                        sizes="60px"
                      />
                    </div>
                  ) : (
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {name.charAt(0)}
                    </div>
                  )}
                  <span 
                    className="text-2xl font-bold transition-all duration-300" 
                    style={{ 
                      ...(scrolled || isNonHeroPage 
                        ? {
                            color: '#000000',
                            opacity: 0.8
                          }
                        : {
                            color: heroFont
                          }
                      )
                    }}
                  >
                    {name}
                  </span>
                </div>
              ), "flex items-center gap-2")}
            </div>

            {/* Cart Button - only show on desktop */}
            {!isMobileView && (
              <div className="flex justify-end">
                {displayMode === 'live' ? (
                  <Link 
                    href={`/${subdomain}/order`}
                    className={cn(
                      "flex items-center justify-center p-2 rounded-full transition-colors relative",
                      scrolled || isNonHeroPage 
                        ? "hover:bg-muted" 
                        : "hover:bg-white/10"
                    )}
                    aria-label="View Cart"
                    style={{
                      color: scrolled || isNonHeroPage 
                        ? "#000000" 
                        : heroFont
                    }}
                  >
                    <ShoppingCart size={24} />
                    {itemCount > 0 && (
                      <span 
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      >
                        {itemCount}
                      </span>
                    )}
                  </Link>
                ) : (
                  <Button 
                    variant="ghost"
                    size="sm" 
                    className={cn(
                      "flex items-center justify-center p-2 rounded-full transition-colors relative",
                      scrolled || isNonHeroPage 
                        ? "hover:bg-muted" 
                        : "hover:bg-white/10"
                    )}
                    style={{
                      color: scrolled || isNonHeroPage 
                        ? "#000000" 
                        : heroFont
                    }}
                    onClick={handleLinkClick}
                  >
                    <ShoppingCart size={24} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
} 