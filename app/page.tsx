'use client';

import Link from 'next/link';
import { HeroSection } from './components/HeroSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Button } from '@/components/ui/button';
import { Header } from './components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { AuthModals } from "@/components/auth-modals";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[hsl(var(--admin-gradient-start)/0.45)] to-[hsl(var(--admin-gradient-end)/0.45)]">
      {/* Header */}
      <Header /> 
      
      {/* Hero Section with Background Image */}
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[hsl(var(--admin-gradient-start)/0.15)] to-[hsl(var(--admin-gradient-end)/0.15)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[hsl(var(--admin-foreground))] sm:text-4xl">Powerful Features for Food Truck Owners</h2>
            <p className="mt-4 text-lg text-[hsl(var(--admin-foreground)/0.8)] max-w-3xl mx-auto">
              Everything you need to establish your online presence and streamline your operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            <div className="bg-[hsl(var(--admin-card))] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-[hsl(var(--admin-border))]">
              <div className="w-12 h-12 bg-[hsl(var(--admin-primary)/0.2)] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[hsl(var(--admin-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[hsl(var(--admin-foreground))] mb-2">Beautiful Website</h3>
              <p className="text-[hsl(var(--admin-foreground)/0.8)]">
                Create a stunning website for your food truck with our easy-to-use customization tools.
              </p>
            </div>
            
            <div className="bg-[hsl(var(--admin-card))] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-[hsl(var(--admin-border))]">
              <div className="w-12 h-12 bg-[hsl(var(--admin-primary)/0.2)] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[hsl(var(--admin-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[hsl(var(--admin-foreground))] mb-2">Online Ordering</h3>
              <p className="text-[hsl(var(--admin-foreground)/0.8)]">
                Accept orders online and streamline your operations with our integrated ordering system.
              </p>
            </div>
            
            <div className="bg-[hsl(var(--admin-card))] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-[hsl(var(--admin-border))]">
              <div className="w-12 h-12 bg-[hsl(var(--admin-primary)/0.2)] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[hsl(var(--admin-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[hsl(var(--admin-foreground))] mb-2">Analytics Dashboard</h3>
              <p className="text-[hsl(var(--admin-foreground)/0.8)]">
                Track your sales, customer behavior, and business growth with our powerful analytics tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[hsl(var(--admin-gradient-start)/0.15)] to-[hsl(var(--admin-gradient-end)/0.15)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[hsl(var(--admin-foreground))] sm:text-4xl">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-[hsl(var(--admin-foreground)/0.8)] max-w-3xl mx-auto">
              Choose the plan that fits your food truck business needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <Card className="border-2 border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-primary))] hover:shadow-md transition-all bg-[hsl(var(--admin-card))]">
              <CardHeader>
                <CardTitle className="text-2xl text-[hsl(var(--admin-foreground))]">Basic Plan</CardTitle>
                <CardDescription className="text-[hsl(var(--admin-foreground)/0.7)]">Perfect for getting started</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[hsl(var(--admin-foreground))]">$29</span>
                  <span className="text-[hsl(var(--admin-foreground)/0.7)] ml-2">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[hsl(var(--admin-primary))] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-[hsl(var(--admin-foreground)/0.9)]">Custom website template</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[hsl(var(--admin-primary))] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-[hsl(var(--admin-foreground)/0.9)]">Online ordering system</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[hsl(var(--admin-primary))] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-[hsl(var(--admin-foreground)/0.9)]">Basic analytics</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[hsl(var(--admin-primary))] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-[hsl(var(--admin-foreground)/0.9)]">Subdomain hosting</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[hsl(var(--admin-primary))] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-[hsl(var(--admin-foreground)/0.9)]">Email support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Pro Plan */}
            <Card className="border-2 border-[hsl(var(--admin-primary))] bg-gradient-to-r from-[hsl(var(--admin-gradient-start)/0.05)] to-[hsl(var(--admin-gradient-end)/0.05)] hover:shadow-md transition-all">
              <CardHeader>
                <div className="bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-primary-foreground))] text-xs font-semibold px-3 py-1 rounded-full w-fit mb-2">RECOMMENDED</div>
                <CardTitle className="text-2xl text-[hsl(var(--admin-foreground))]">Pro Plan</CardTitle>
                <CardDescription className="text-[hsl(var(--admin-foreground)/0.7)]">For growing food truck businesses</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[hsl(var(--admin-foreground))]">$49</span>
                  <span className="text-[hsl(var(--admin-foreground)/0.7)] ml-2">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[hsl(var(--admin-primary))] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-[hsl(var(--admin-foreground)/0.9)]">Everything in Basic</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[hsl(var(--admin-primary))] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-[hsl(var(--admin-foreground)/0.9)]">Custom domain support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[hsl(var(--admin-primary))] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-[hsl(var(--admin-foreground)/0.9)]">Advanced analytics</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[hsl(var(--admin-primary))] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-[hsl(var(--admin-foreground)/0.9)]">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[hsl(var(--admin-primary))] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-[hsl(var(--admin-foreground)/0.9)]">Unlimited menu items</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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
