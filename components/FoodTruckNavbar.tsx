'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import { DisplayMode } from '@/components/FoodTruckTemplate';

export interface FoodTruckNavbarProps {
  config: {
    name?: string;
    logo?: string;
    primaryColor?: string;
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
  } = config;

  // Check if current page is a page without hero section
  const isNonHeroPage = pathname.includes('/menu') || pathname.includes('/order');

  // Determine if we should show mobile view based on forceViewMode or screen size
  const [isMobileView, setIsMobileView] = useState(forceViewMode === 'mobile');

  useEffect(() => {
    if (forceViewMode) {
      setIsMobileView(forceViewMode === 'mobile');
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
        // For preview mode, check if scrollTop is exactly 0 to ensure transparency at the top
        const isScrolled = displayMode === 'preview'
          ? (scrollableContainer as Element).scrollTop > 0
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
    } else {
      window.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (displayMode === 'preview') {
        const mobileContainer = document.getElementById('preview-scroll-container');
        const desktopContainer = document.getElementById('desktop-preview-scroll-container');
        
        if (mobileContainer) {
          mobileContainer.removeEventListener('scroll', handleScroll);
        }
        
        if (desktopContainer) {
          desktopContainer.removeEventListener('scroll', handleScroll);
        }
      } else {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [displayMode]);

  // Navigation links
  const navLinks = [
    { href: `/${subdomain}`, label: 'Home' },
    { href: `/${subdomain}/menu`, label: 'Menu' },
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
        <Link href={href} className={className}>
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
        className={`${displayMode === 'preview' ? 'sticky' : 'fixed'} top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || isNonHeroPage
            ? 'bg-white shadow-md py-2' 
            : 'bg-transparent py-4'
        }`}
        style={{
          width: displayMode === 'preview' ? '100%' : 'auto',
          backgroundColor: scrolled || isNonHeroPage ? 'white' : 'transparent'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo and Name */}
            {renderLink(`/${subdomain}`, (
              <div className="flex items-center gap-2">
                {logo ? (
                  <div className="h-10 w-10 relative">
                    <Image 
                      src={logo} 
                      alt={name} 
                      fill 
                      className="object-contain" 
                      sizes="40px"
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
                <span className={`font-bold text-lg ${scrolled || isNonHeroPage ? 'text-gray-900' : 'text-white'}`}>
                  {name}
                </span>
              </div>
            ), "flex items-center gap-2")}

            {/* Desktop Navigation - Only show if not in mobile view */}
            {!isMobileView && (
              <nav className="flex items-center space-x-6">
                {navLinks.map((link) => (
                  <div key={link.href}>
                    {renderLink(
                      link.href,
                      link.label,
                      `font-medium transition-colors ${
                        pathname === link.href 
                          ? `border-b-2 ${scrolled || isNonHeroPage ? 'text-gray-900' : 'text-white'}`
                          : `${scrolled || isNonHeroPage ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`
                      }`
                    )}
                  </div>
                ))}
                
                {/* Cart Button with Item Count */}
                {displayMode === 'live' ? (
                  <Link href={`/${subdomain}/order`}>
                    <Button 
                      variant={scrolled || isNonHeroPage ? "outline" : "secondary"}
                      size="sm"
                      className="relative"
                      style={{ 
                        ...(scrolled || isNonHeroPage ? { borderColor: primaryColor, color: primaryColor } : {})
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Cart
                      {itemCount > 0 && (
                        <span 
                          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                        >
                          {itemCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant={scrolled || isNonHeroPage ? "outline" : "secondary"}
                    size="sm"
                    className="relative"
                    style={{ 
                      ...(scrolled || isNonHeroPage ? { borderColor: primaryColor, color: primaryColor } : {})
                    }}
                    onClick={handleLinkClick}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Cart
                    {itemCount > 0 && (
                      <span 
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      >
                        {itemCount}
                      </span>
                    )}
                  </Button>
                )}
              </nav>
            )}

            {/* Mobile Cart Button - Only show in mobile view */}
            {isMobileView && (
              <div className="flex items-center">
                {displayMode === 'live' ? (
                  <Link href={`/${subdomain}/order`}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`${scrolled || isNonHeroPage ? 'text-gray-900' : 'text-white'} hover:bg-white/10 relative`}
                    >
                      <ShoppingCart className="h-6 w-6" />
                      {itemCount > 0 && (
                        <span 
                          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                        >
                          {itemCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`${scrolled || isNonHeroPage ? 'text-gray-900' : 'text-white'} hover:bg-white/10 relative`}
                    onClick={handleLinkClick}
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {itemCount > 0 && (
                      <span 
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      >
                        {itemCount}
                      </span>
                    )}
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