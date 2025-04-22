'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AuthModals } from '@/components/auth-modals';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[hsl(var(--admin-background))] shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="w-full lg:w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className={`text-2xl font-bold ${isScrolled ? 'text-[hsl(var(--admin-foreground))]' : 'text-white'}`}>
              FoodTruckFlow
            </span>
          </Link>

          {/* Centered Desktop Navigation Links */}
          <nav className="hidden md:flex flex-1 justify-center items-center space-x-16 mx-8">
            <Link 
              href="#features" 
              onClick={(e) => handleSmoothScroll(e, 'features')}
              className={`text-sm font-medium ${
                isScrolled ? 'text-[hsl(var(--admin-foreground))] hover:text-[hsl(var(--admin-foreground/0.8))]' : 'text-white hover:text-gray-200'
              }`}
            >
              Features Section
            </Link>
            <Link 
              href="#pricing" 
              onClick={(e) => handleSmoothScroll(e, 'pricing')}
              className={`text-sm font-medium ${
                isScrolled ? 'text-[hsl(var(--admin-foreground))] hover:text-[hsl(var(--admin-foreground/0.8))]' : 'text-white hover:text-gray-200'
              }`}
            >
              Pricing Section
            </Link>
            <Link 
              href="/demo"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-medium ${
                isScrolled ? 'text-[hsl(var(--admin-foreground))] hover:text-[hsl(var(--admin-foreground/0.8))]' : 'text-white hover:text-gray-200'
              }`}
            >
              Demo Website
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <AuthModals 
              initialView="sign-in" 
              trigger={
                <Button 
                  variant={isScrolled ? "outline" : "secondary"} 
                  className={isScrolled ? "border-[hsl(var(--admin-primary))] text-[hsl(var(--admin-primary))] bg-transparent" : "text-white bg-transparent border-white hover:bg-white hover:bg-opacity-10"}
                >
                  Sign In
                </Button>
              }
            />
            <AuthModals 
              initialView="sign-up" 
              trigger={
                <Button 
                  variant={isScrolled ? "default" : "secondary"}
                  className={isScrolled ? "bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-primary-foreground))]" : "bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-primary-foreground))] hover:bg-[hsl(var(--admin-primary)/0.9)] border-none"}
                >
                  Sign Up
                </Button>
              }
            />
          </div>

          {/* Mobile Demo Button */}
          <div className="md:hidden">
             <Link href="/demo" passHref target="_blank" rel="noopener noreferrer">
                 <Button
                     variant="default"
                     className="bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-primary-foreground))] hover:bg-[hsl(var(--admin-primary)/0.9)] flex items-center space-x-1.5"
                 >
                     <span>Demo</span>
                     <ExternalLink className="h-4 w-4" />
                 </Button>
             </Link>
         </div>

        </div>
      </div>
    </header>
  );
} 