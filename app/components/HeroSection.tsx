'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AuthModals } from '@/components/auth-modals';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative h-[80vh] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-l from-[hsl(var(--admin-gradient-end))] to-[hsl(var(--admin-gradient-start/45))]">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Mobile and desktop layout container */}
        <div className="flex flex-col items-center lg:flex-row lg:items-center lg:justify-between flex-1">
          {/* Image container - top on mobile, right on desktop */}
          <div className="w-full mb-6 lg:mb-0 lg:order-2 lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-3/4 sm:w-2/3 lg:w-5/6 aspect-square">
              <Image
                src="/images/foodtruckb.png"
                alt="Food Truck"
                fill
                priority
                className="object-contain drop-shadow-2xl"
                quality={100}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
          
          {/* Content - below image on mobile, left on desktop */}
          <div className="w-full lg:w-1/2 lg:order-1 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="block">FoodTruckFlow</span>
              <span className="block text-[hsl(var(--admin-primary-foreground))] mt-2 text-3xl sm:text-4xl">
                Bring Your Food Truck Online
              </span>
            </h1>
            <p className="mt-4 md:mt-6 text-lg text-[hsl(var(--admin-primary-foreground)/0.9)]">
              The ultimate platform for food truck owners to create stunning websites, manage online orders, and create an online presence.
            </p>
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <AuthModals 
                initialView="sign-in" 
                trigger={
                  <Button className="px-6 py-3 md:px-8 md:py-4 bg-[hsl(var(--admin-primary-foreground))] text-[hsl(var(--admin-primary))] rounded-md font-medium shadow-lg hover:bg-[hsl(var(--admin-primary-foreground)/0.9)] transition-colors text-center">
                    Login
                  </Button>
                }
              />
              <AuthModals 
                initialView="sign-up" 
                trigger={
                  <Button className="px-6 py-3 md:px-8 md:py-4 bg-transparent text-white border-2 border-white rounded-md font-medium shadow-lg hover:bg-white hover:bg-opacity-10 transition-colors text-center">
                    Sign Up Free
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      {/* <div className="absolute bottom-6 left-0 right-0 flex justify-center animate-bounce">
        <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div> */}
    </section>
  );
} 