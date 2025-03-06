'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Define the configuration type
export type FoodTruckConfig = {
  hero?: {
    image?: string;
    title?: string;
    subtitle?: string;
  };
  logo?: string;
  name?: string;
  about?: {
    image?: string;
    title?: string;
    content?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  socials?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

// Define the display mode type
export type DisplayMode = 'preview' | 'live';

// Props for the FoodTruckWebsite component
export interface FoodTruckWebsiteProps {
  config: FoodTruckConfig;
  displayMode: DisplayMode;
  subdomain?: string;
}

export default function FoodTruckWebsite({ config, displayMode, subdomain }: FoodTruckWebsiteProps) {
  // Client-side state to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);
  
  // Use useEffect to set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Extract configuration data with defaults
  const {
    hero,
    name = 'Food Truck',
    logo,
    about,
    contact,
    socials,
    tagline = 'Delicious food on wheels',
    primaryColor = '#FF6B35',
    secondaryColor = '#4CB944'
  } = config;

  const heroTitle = hero?.title || name;
  const heroSubtitle = hero?.subtitle || tagline;
  const heroImage = hero?.image || '/placeholder-hero.jpg';
  
  // Determine if routing should be enabled
  const enableRouting = displayMode === 'live';
  
  // Determine if order functionality should be enabled
  const enableOrdering = displayMode === 'live';

  // Function to handle navigation links based on display mode
  const getNavigationLink = (path: string) => {
    if (!enableRouting) return '#';
    return `/${subdomain}${path}`;
  };

  // Function to handle button clicks when routing is disabled
  const handleButtonClick = (e: React.MouseEvent) => {
    if (!enableRouting) {
      e.preventDefault();
      // Could show a toast notification here explaining why navigation is disabled
    }
  };

  // Function to handle scroll to section
  const scrollToSection = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    // Only execute client-side
    if (typeof window !== 'undefined') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // If not yet client-side, render a simplified version to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-full mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <span className="text-xl font-bold">{name}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-grow">
          <div className="relative max-w-full mx-auto py-16 px-4 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
              {heroTitle}
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              {heroSubtitle}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 max-w-full overflow-x-hidden ${displayMode === 'preview' ? 'mobile-preview' : ''}`}>
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                {logo ? (
                  <div className="h-8 w-8 relative">
                    <Image 
                      src={logo} 
                      alt={name} 
                      fill 
                      className="object-contain" 
                      sizes="32px"
                    />
                  </div>
                ) : (
                  <span className="text-lg font-bold truncate max-w-[120px]">{name}</span>
                )}
              </div>
              <nav className={`${displayMode === 'preview' ? 'hidden' : 'hidden sm:ml-6 sm:flex sm:space-x-4'}`}>
                <Link 
                  href={getNavigationLink('')} 
                  onClick={handleButtonClick}
                  className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  style={{ borderColor: primaryColor }}
                >
                  Home
                </Link>
                <Link 
                  href={getNavigationLink('/menu')} 
                  onClick={handleButtonClick}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Menu
                </Link>
                <Link 
                  href="#about-section" 
                  onClick={(e) => scrollToSection('about-section', e)}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  About
                </Link>
                <Link 
                  href="#contact-section" 
                  onClick={(e) => scrollToSection('contact-section', e)}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Contact
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              {displayMode === 'preview' && (
                <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 mr-2">
                  <span className="sr-only">Open menu</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <Button
                asChild
                size="sm"
                style={{ backgroundColor: primaryColor }}
                className="hover:opacity-90 text-xs sm:text-sm"
                disabled={!enableOrdering}
              >
                <Link 
                  href={getNavigationLink('/order')} 
                  onClick={handleButtonClick}
                >
                  Order Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <div style={{ backgroundColor: primaryColor }} className="relative">
          {heroImage && (
            <div className="absolute inset-0 opacity-20">
              <div className="relative w-full h-full">
                <Image 
                  src={heroImage} 
                  alt={heroTitle} 
                  fill 
                  className="object-cover" 
                  sizes="100vw"
                  priority
                />
              </div>
            </div>
          )}
          <div className="relative max-w-full mx-auto py-12 px-4 sm:py-16 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {heroTitle}
            </h1>
            <p className="mt-4 text-lg text-white opacity-90 max-w-3xl mx-auto">
              {heroSubtitle}
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="px-4 py-2 text-sm font-medium rounded-md"
                style={{ color: primaryColor }}
              >
                <Link 
                  href={getNavigationLink('/menu')} 
                  onClick={handleButtonClick}
                >
                  View Menu
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Featured Menu Items */}
        <div className="max-w-full mx-auto py-12 px-4 sm:py-16">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-8">
            Featured Menu Items
          </h2>
          <div className={`grid grid-cols-1 ${displayMode === 'preview' ? '' : 'sm:grid-cols-2 md:grid-cols-3'} gap-4`}>
            <Card className="overflow-hidden">
              <div className="h-32 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <h3 className="text-base font-medium text-gray-900">Menu Item 1</h3>
                <p className="mt-1 text-sm text-gray-500">Description of this delicious menu item.</p>
                <p className="mt-2 text-base font-medium text-gray-900">$10.99</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <div className="h-32 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <h3 className="text-base font-medium text-gray-900">Menu Item 2</h3>
                <p className="mt-1 text-sm text-gray-500">Description of this delicious menu item.</p>
                <p className="mt-2 text-base font-medium text-gray-900">$12.99</p>
              </CardContent>
            </Card>
            <Card className={`overflow-hidden ${displayMode === 'preview' ? '' : 'sm:col-span-2 md:col-span-1'}`}>
              <div className="h-32 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <h3 className="text-base font-medium text-gray-900">Menu Item 3</h3>
                <p className="mt-1 text-sm text-gray-500">Description of this delicious menu item.</p>
                <p className="mt-2 text-base font-medium text-gray-900">$9.99</p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <Link 
              href={getNavigationLink('/menu')} 
              onClick={handleButtonClick}
              className="text-sm font-medium hover:underline"
              style={{ color: primaryColor }}
            >
              View Full Menu <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
        
        {/* About Section */}
        <div id="about-section" className="bg-gray-50">
          <div className="max-w-full mx-auto py-12 px-4 sm:py-16">
            <div className={`${displayMode === 'preview' ? '' : 'lg:grid lg:grid-cols-2 lg:gap-8'}`}>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  {about?.title || "About Our Food Truck"}
                </h2>
                <p className="mt-4 text-sm sm:text-base text-gray-500">
                  {about?.content || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
                </p>
              </div>
              <div className={`mt-8 ${displayMode === 'preview' ? '' : 'lg:mt-0'}`}>
                <div className="bg-gray-200 rounded-lg h-48 sm:h-64 relative">
                  {about?.image && (
                    <Image 
                      src={about.image} 
                      alt={about.title || "About Us"} 
                      fill 
                      className="object-cover rounded-lg" 
                      sizes={displayMode === 'preview' ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Location/Contact Section */}
        <div id="contact-section" className="max-w-full mx-auto py-12 px-4 sm:py-16">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-8">
            Find Us
          </h2>
          <div className="bg-gray-200 rounded-lg h-48 sm:h-64"></div>
          <div className="mt-6 text-center">
            <h3 className="text-lg font-medium text-gray-900">Current Location</h3>
            <p className="mt-2 text-sm text-gray-500">{contact?.address || "123 Main Street, City, State 12345"}</p>
            <p className="mt-1 text-sm text-gray-500">Monday - Friday: 11am - 8pm</p>
            <p className="mt-1 text-sm text-gray-500">Saturday - Sunday: 12pm - 9pm</p>
            {contact?.phone && (
              <p className="mt-4 text-sm text-gray-500">Phone: {contact.phone}</p>
            )}
            {contact?.email && (
              <p className="mt-1 text-sm text-gray-500">Email: {contact.email}</p>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-full mx-auto py-8 px-4 overflow-hidden">
          <nav className="flex flex-wrap justify-center">
            <div className="px-3 py-2">
              <Link 
                href={getNavigationLink('')} 
                onClick={handleButtonClick}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Home
              </Link>
            </div>
            <div className="px-3 py-2">
              <Link 
                href={getNavigationLink('/menu')} 
                onClick={handleButtonClick}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Menu
              </Link>
            </div>
            <div className="px-3 py-2">
              <Link 
                href="#about-section" 
                onClick={(e) => scrollToSection('about-section', e)}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                About
              </Link>
            </div>
            <div className="px-3 py-2">
              <Link 
                href="#contact-section" 
                onClick={(e) => scrollToSection('contact-section', e)}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Contact
              </Link>
            </div>
          </nav>
          <div className="mt-6 flex justify-center space-x-6">
            {socials?.facebook && (
              <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
            )}
            {socials?.instagram && (
              <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            )}
            {socials?.twitter && (
              <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            )}
          </div>
          <p className="mt-6 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          
          {displayMode !== 'live' && (
            <div className="mt-4 text-center">
              <Separator className="my-2" />
              <p className="text-xs text-amber-600 font-medium">
                Preview Mode - Navigation and Ordering Disabled
              </p>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
} 