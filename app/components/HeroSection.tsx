'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AuthModals } from '@/components/auth-modals';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center pt-16">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <Image
            src="/images/food-truck-background.jpg"
            alt="Food Truck Background"
            fill
            priority
            className="object-cover"
            quality={100}
            onError={(e) => {
              // If image fails to load, apply a gradient background
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.style.background = 'linear-gradient(to bottom, #4F46E5, #7C3AED)';
              }
            }}
          />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="lg:max-w-2xl">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
              <span className="block">FoodTruckFlow</span>
              <span className="block text-yellow-400 mt-2 text-4xl sm:text-5xl">Elevate Your Food Truck Business</span>
            </h1>
            <p className="mt-6 text-xl text-gray-200">
              The ultimate platform for food truck owners to create stunning websites, manage online orders, and grow their business.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <AuthModals 
                initialView="sign-in" 
                trigger={
                  <Button className="px-8 py-4 bg-yellow-500 text-gray-900 rounded-md font-medium shadow-lg hover:bg-yellow-400 transition-colors text-center">
                    Login
                  </Button>
                }
              />
              <AuthModals 
                initialView="sign-up" 
                trigger={
                  <Button className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-md font-medium shadow-lg hover:bg-white hover:bg-opacity-10 transition-colors text-center">
                    Sign Up Free
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
} 