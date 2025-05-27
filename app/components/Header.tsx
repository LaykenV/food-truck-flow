'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AuthModals } from '@/components/auth-modals';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[hsl(var(--admin-background)/0.95)] backdrop-blur-md shadow-lg border-b border-[hsl(var(--admin-border))] py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="w-full lg:w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className={`text-2xl font-bold transition-colors ${
              isScrolled 
                ? 'text-[hsl(var(--admin-foreground))]' 
                : 'text-[hsl(var(--admin-primary-foreground))]'
            } group-hover:text-[hsl(var(--admin-primary))]`}>
              FoodTruckFlow
            </span>
          </Link>

          {/* Centered Desktop Navigation Links */}
          <nav className="hidden md:flex flex-1 justify-center items-center space-x-12 mx-8">
            <Link 
              href="#features" 
              onClick={(e) => handleSmoothScroll(e, 'features')}
              className={`text-sm font-medium transition-colors relative group ${
                isScrolled 
                  ? 'text-[hsl(var(--admin-foreground))] hover:text-[hsl(var(--admin-primary))]' 
                  : 'text-[hsl(var(--admin-primary-foreground))] hover:text-[hsl(var(--admin-primary))]'
              }`}
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[hsl(var(--admin-primary))] transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="#pricing" 
              onClick={(e) => handleSmoothScroll(e, 'pricing')}
              className={`text-sm font-medium transition-colors relative group ${
                isScrolled 
                  ? 'text-[hsl(var(--admin-foreground))] hover:text-[hsl(var(--admin-primary))]' 
                  : 'text-[hsl(var(--admin-primary-foreground))] hover:text-[hsl(var(--admin-primary))]'
              }`}
            >
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[hsl(var(--admin-primary))] transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="https://demo.foodtruckflow.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-medium transition-colors relative group ${
                isScrolled 
                  ? 'text-[hsl(var(--admin-foreground))] hover:text-[hsl(var(--admin-primary))]' 
                  : 'text-[hsl(var(--admin-primary-foreground))] hover:text-[hsl(var(--admin-primary))]'
              }`}
            >
              Demo
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[hsl(var(--admin-primary))] transition-all group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <AuthModals 
              initialView="sign-in"
              trigger={
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`transition-all ${
                    isScrolled
                      ? 'border-[hsl(var(--admin-border))] text-[hsl(var(--admin-foreground))] hover:bg-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent-foreground))]'
                      : 'border-[hsl(var(--admin-primary-foreground))] text-[hsl(var(--admin-primary-foreground))] hover:bg-[hsl(var(--admin-primary-foreground)/0.1)]'
                  }`}
                >
                  Sign In
                </Button>
              }
            />
            <AuthModals 
              initialView="sign-up"
              trigger={
                <Button 
                  size="sm"
                  className="bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-primary-foreground))] hover:bg-[hsl(var(--admin-primary)/0.9)] shadow-md hover:shadow-lg transition-all"
                >
                  Get Started
                </Button>
              }
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-md transition-colors ${
              isScrolled
                ? 'text-[hsl(var(--admin-foreground))] hover:bg-[hsl(var(--admin-accent))]'
                : 'text-[hsl(var(--admin-primary-foreground))] hover:bg-[hsl(var(--admin-primary-foreground)/0.1)]'
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="bg-[hsl(var(--admin-card))] rounded-xl shadow-xl border border-[hsl(var(--admin-border))] overflow-hidden">
              <nav className="flex flex-col">
                <Link 
                  href="#features" 
                  onClick={(e) => handleSmoothScroll(e, 'features')}
                  className="px-6 py-4 text-[hsl(var(--admin-foreground))] hover:bg-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent-foreground))] border-b border-[hsl(var(--admin-border))] transition-colors font-medium"
                >
                  Features
                </Link>
                <Link 
                  href="#pricing" 
                  onClick={(e) => handleSmoothScroll(e, 'pricing')}
                  className="px-6 py-4 text-[hsl(var(--admin-foreground))] hover:bg-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent-foreground))] border-b border-[hsl(var(--admin-border))] transition-colors font-medium"
                >
                  Pricing
                </Link>
                <Link 
                  href="https://demo.foodtruckflow.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 text-[hsl(var(--admin-foreground))] hover:bg-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent-foreground))] border-b border-[hsl(var(--admin-border))] transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Demo Website
                </Link>
              </nav>
              
              {/* Mobile Auth Buttons */}
              <div className="p-4 space-y-3 bg-[hsl(var(--admin-background)/0.5)]">
                <AuthModals 
                  initialView="sign-in"
                  trigger={
                    <Button 
                      variant="outline" 
                      className="w-full border-[hsl(var(--admin-border))] text-[hsl(var(--admin-foreground))] hover:bg-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent-foreground))]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Button>
                  }
                />
                <AuthModals 
                  initialView="sign-up"
                  trigger={
                    <Button 
                      className="w-full bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-primary-foreground))] hover:bg-[hsl(var(--admin-primary)/0.9)]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started Free
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 