'use client';

import Link from 'next/link';
import { HeroSection } from './components/HeroSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FeaturesSection } from './components/FeaturesSection';
import { PricingSection } from './components/PricingSection';
import { FAQSection } from './components/FAQSection';
import { Button } from '@/components/ui/button';
import { Header } from './components/Header';
import { Check } from 'lucide-react';
import { AuthModals } from "@/components/auth-modals";
import { ExternalLink } from 'lucide-react';
import { TestFeaturesSection } from '@/test';
export default function Home() {

  return (
      <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--admin-gradient-start)/0.7)] to-[hsl(var(--admin-gradient-end)/0.7)]">
        {/* Header */}
        <Header /> 
        
      {/* Hero Section with Background Image */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Pricing Section - Use the new component */}
      <PricingSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-center">Transform Your Food Truck Business Today</h2>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left w-full lg:w-1/2">
              <div className="space-y-4 mb-8">
                <p className="text-xl opacity-90">
                  Be among the first food truck owners to elevate your business with a professional online presence.
                </p>
                <ul className="space-y-3 mx-auto lg:mx-0 max-w-md">
                  {[
                    "Launch your custom website in minutes",
                    "Accept online orders with no setup",
                    "Keep customers updated on location"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 mr-3 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-left">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 max-w-md mx-auto">
              <div className="bg-[hsl(var(--admin-primary))] p-8 rounded-xl backdrop-blur-sm border border-white/10 shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-center">Early Access Available Now</h3>
                <p className="mb-6 text-center opacity-90">Limited spots available at launch pricing</p>
                <div className="flex flex-col space-y-4">
                  <AuthModals 
                    initialView="sign-up"
                    trigger={
                      <Button size="lg" className="w-full bg-white text-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-background))] font-semibold py-6">
                        Create Free Account
                      </Button>
                    }
                  />
                  <AuthModals 
                    initialView="sign-in"
                    trigger={
                      <Button size="lg" variant="outline" className="w-full border-white text-white hover:bg-white/10 font-medium">
                        Already have an account? Sign In
                      </Button>
                    }
                  />
                  <div className="text-center mt-4">
                    <Link href="/demo" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4 hover:text-[hsl(var(--admin-primary-foreground)/0.8)] flex items-center justify-center gap-1.5">
                      <span>See a demo website first</span>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="bg-[hsl(var(--admin-background))] border-t border-[hsl(var(--admin-primary))] text-[hsl(var(--admin-foreground))/0.7] py-4 px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} FoodTruckFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
