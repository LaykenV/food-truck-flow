'use client';

import Link from 'next/link';
import { HeroSection } from './components/HeroSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FeaturesSection } from './components/FeaturesSection';
import { PricingSection } from './components/PricingSection';
import { Button } from '@/components/ui/button';
import { Header } from './components/Header';
import { Check } from 'lucide-react';
import { AuthModals } from "@/components/auth-modals";
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

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[hsl(var(--admin-gradient-start))] to-[hsl(var(--admin-gradient-end))] text-[hsl(var(--admin-primary-foreground))]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 sm:text-4xl">Ready to Grow Your Food Truck Business?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of food truck owners who are expanding their reach and increasing their revenue with FoodTruckFlow.
          </p>
          <AuthModals 
            initialView="sign-up"
            trigger={
              <Button size="lg" className="bg-white text-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-background))]">
                Get Started Today
              </Button>
            }
          />
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="bg-[hsl(var(--admin-background))] text-[hsl(var(--admin-foreground))] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">FoodTruckFlow</h3>
            <p className="text-[hsl(var(--admin-foreground)/0.7)]">
              The all-in-one platform for food truck owners to manage their online presence and grow their business.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-[hsl(var(--admin-foreground)/0.7)]">
              <li><Link href="#features" className="hover:text-[hsl(var(--admin-primary))] transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-[hsl(var(--admin-primary))] transition-colors">Pricing</Link></li>
              <li><Link href="#testimonials" className="hover:text-[hsl(var(--admin-primary))] transition-colors">Testimonials</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-[hsl(var(--admin-foreground)/0.7)]">
              <li><Link href="/privacy" className="hover:text-[hsl(var(--admin-primary))] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[hsl(var(--admin-primary))] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[hsl(var(--admin-border))] text-center text-[hsl(var(--admin-foreground)/0.7)]">
          <p>&copy; {new Date().getFullYear()} FoodTruckFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
