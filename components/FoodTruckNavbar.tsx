'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cartContext';

export interface FoodTruckNavbarProps {
  config: {
    name?: string;
    logo?: string;
    primaryColor?: string;
  };
  subdomain: string;
}

export default function FoodTruckNavbar({ config, subdomain }: FoodTruckNavbarProps) {
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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    // Call handleScroll on initial render to set the correct state
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Navigation links
  const navLinks = [
    { href: `/${subdomain}`, label: 'Home' },
    { href: `/${subdomain}/menu`, label: 'Menu' },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || isNonHeroPage
            ? 'bg-white shadow-md py-2' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo and Name */}
            <Link href={`/${subdomain}`} className="flex items-center gap-2">
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
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`font-medium transition-colors ${
                    pathname === link.href 
                      ? `border-b-2 ${scrolled || isNonHeroPage ? 'text-gray-900' : 'text-white'}`
                      : `${scrolled || isNonHeroPage ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`
                  }`}
                  style={{ 
                    borderColor: pathname === link.href ? primaryColor : 'transparent' 
                  }}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Cart Button with Item Count */}
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
            </nav>

            {/* Mobile Cart Button */}
            <div className="md:hidden flex items-center">
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
            </div>
          </div>
        </div>
      </header>
    </>
  );
} 