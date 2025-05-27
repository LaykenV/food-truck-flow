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

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--admin-gradient-start))] via-[hsl(var(--admin-gradient-start)/0.8)] to-[hsl(var(--admin-gradient-end))] text-[hsl(var(--admin-foreground))]">
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

      {/* Enhanced CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--admin-primary)/0.1)] via-transparent to-[hsl(var(--admin-gradient-end)/0.1)]"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-[hsl(var(--admin-primary)/0.1)] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[hsl(var(--admin-gradient-end)/0.1)] rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[hsl(var(--admin-foreground))]">
              Transform Your Food Truck 
              <span className="block text-[hsl(var(--admin-primary))] mt-2">Business Today</span>
            </h2>
            <p className="text-xl md:text-2xl text-[hsl(var(--admin-foreground)/0.8)] max-w-3xl mx-auto leading-relaxed">
              Join the revolution of food truck owners who are taking their business online
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="text-center lg:text-left w-full lg:w-1/2">
              <div className="space-y-6 mb-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-[hsl(var(--admin-primary)/0.2)] text-[hsl(var(--admin-primary))] text-sm font-medium mb-4">
                  <span className="relative flex h-3 w-3 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--admin-primary))] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[hsl(var(--admin-primary))]"></span>
                  </span>
                  Limited Early Access Available
                </div>
                <ul className="space-y-4 mx-auto lg:mx-0 max-w-md">
                  {[
                    "Launch your custom website in minutes",
                    "Accept online orders with zero setup fees",
                    "Keep customers updated on your location",
                    "Professional 3D truck visualization",
                    "Real-time order management system"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[hsl(var(--admin-primary))] flex items-center justify-center mr-3 mt-0.5">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-[hsl(var(--admin-foreground)/0.9)] text-left">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 max-w-lg mx-auto">
              <div className="bg-[hsl(var(--admin-card))] p-8 rounded-2xl backdrop-blur-sm border border-[hsl(var(--admin-border))] shadow-2xl relative overflow-hidden">
                {/* Card background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--admin-primary)/0.1)] rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[hsl(var(--admin-gradient-end)/0.1)] rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2 text-center text-[hsl(var(--admin-foreground))]">
                    Early Access Available
                  </h3>
                  <p className="mb-6 text-center text-[hsl(var(--admin-foreground)/0.7)] text-lg">
                    Limited spots at launch pricing
                  </p>
                  
                  <div className="flex flex-col space-y-4">
                    <AuthModals 
                      initialView="sign-up"
                      trigger={
                        <Button size="lg" className="w-full bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-primary-foreground))] hover:bg-[hsl(var(--admin-primary)/0.9)] font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                          Create Free Account
                        </Button>
                      }
                    />
                    <AuthModals 
                      initialView="sign-in"
                      trigger={
                        <Button size="lg" variant="outline" className="w-full border-[hsl(var(--admin-border))] text-[hsl(var(--admin-foreground))] hover:bg-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent-foreground))] font-medium py-6 text-lg rounded-xl transition-all hover:scale-[1.02]">
                          Already have an account? Sign In
                        </Button>
                      }
                    />
                    <div className="text-center mt-6">
                      <Link href="https://demo.foodtruckflow.com" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--admin-primary))] hover:text-[hsl(var(--admin-primary)/0.8)] underline underline-offset-4 flex items-center justify-center gap-2 font-medium transition-colors">
                        <span>See a demo website first</span>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-[hsl(var(--admin-background)/0.8)] backdrop-blur-sm border-t border-[hsl(var(--admin-border))] text-[hsl(var(--admin-foreground)/0.7)] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-lg">&copy; {new Date().getFullYear()} FoodTruckFlow. All rights reserved.</p>
            <p className="mt-2 text-sm text-[hsl(var(--admin-foreground)/0.5)]">
              Empowering food truck owners to build their digital presence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
