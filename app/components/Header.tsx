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
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className={`text-xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
              FoodTruckFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="#features" 
              className={`text-sm font-medium ${
                isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-gray-200 hover:text-white'
              }`}
            >
              Features
            </Link>
            <Link 
              href="#pricing" 
              className={`text-sm font-medium ${
                isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-gray-200 hover:text-white'
              }`}
            >
              Pricing
            </Link>
            <Link 
              href="#testimonials" 
              className={`text-sm font-medium ${
                isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-gray-200 hover:text-white'
              }`}
            >
              Testimonials
            </Link>
            <Link 
              href="#demo" 
              className={`text-sm font-medium ${
                isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-gray-200 hover:text-white'
              }`}
            >
              Demo
            </Link>
            <div className="flex items-center space-x-4">
              <AuthModals 
                initialView="sign-in" 
                trigger={
                  <Button 
                    variant={isScrolled ? "outline" : "secondary"} 
                    className={isScrolled ? "" : "text-white bg-transparent border-white hover:bg-white hover:bg-opacity-10"}
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
                    className={isScrolled ? "" : "bg-yellow-500 text-gray-900 hover:bg-yellow-400 border-none"}
                  >
                    Sign Up
                  </Button>
                }
              />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden rounded-md p-2 hover:bg-gray-100 hover:bg-opacity-20 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg 
              className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-lg overflow-hidden absolute w-full">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <Link 
              href="#features" 
              className="block py-2 text-gray-700 hover:text-gray-900 font-medium border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="#pricing" 
              className="block py-2 text-gray-700 hover:text-gray-900 font-medium border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="#testimonials" 
              className="block py-2 text-gray-700 hover:text-gray-900 font-medium border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Testimonials
            </Link>
            <Link 
              href="#demo" 
              className="block py-2 text-gray-700 hover:text-gray-900 font-medium border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Demo
            </Link>
            <div className="flex flex-col space-y-2 pt-2">
              <AuthModals 
                initialView="sign-in" 
                trigger={
                  <Button 
                    variant="outline" 
                    className="w-full justify-center"
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
                    className="w-full justify-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 