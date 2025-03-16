'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Phone, Calendar } from 'lucide-react';

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
  schedule?: {
    title?: string;
    description?: string;
    days?: {
      day: string;
      location?: string;
      address?: string;
      hours?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    }[];
  };
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

// Define the display mode type - Now only 'preview' since this component is for preview only
export type DisplayMode = 'preview';

// Props for the FoodTruckWebsite component
export interface FoodTruckWebsiteProps {
  config: FoodTruckConfig;
  displayMode: DisplayMode;
  subdomain?: string;
}

export default function FoodTruckWebsite({ config, displayMode, subdomain }: FoodTruckWebsiteProps) {
  // Client-side state to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use useEffect to set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
    
    // Handle scroll effect for the parent container
    const handleScroll = () => {
      // Find the closest scrollable container
      const scrollableContainer = document.querySelector('.mobile-preview-container')?.parentElement;
      if (scrollableContainer) {
        const isScrolled = scrollableContainer.scrollTop > 10;
        setScrolled(isScrolled);
      }
    };

    // Call handleScroll on initial render to set the correct state
    handleScroll();

    // Add scroll event listener to the parent container
    const scrollableContainer = document.querySelector('.mobile-preview-container')?.parentElement;
    if (scrollableContainer) {
      scrollableContainer.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      const scrollableContainer = document.querySelector('.mobile-preview-container')?.parentElement;
      if (scrollableContainer) {
        scrollableContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isClient]);
  
  // Extract configuration data with defaults
  const {
    hero,
    name = 'Food Truck',
    logo,
    about,
    contact,
    socials,
    schedule,
    tagline = 'Delicious food on wheels',
    primaryColor = '#FF6B35',
    secondaryColor = '#4CB944'
  } = config;

  const heroTitle = hero?.title || name;
  const heroSubtitle = hero?.subtitle || tagline;
  const heroImage = hero?.image || '/images/food-truck-background.jpg';
  
  // In preview mode, all links are just '#' and all actions are disabled
  const getNavigationLink = () => '#';
  
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // No action in preview mode
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
      <div className="min-h-screen flex flex-col bg-gray-50 relative">
        <header className="absolute top-0 left-0 right-0 z-50">
          <div className="max-w-full mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <span className="text-xl font-bold text-white">{name}</span>
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
    <div className="min-h-screen flex flex-col bg-gray-50 max-w-full  mobile-preview-content">
      {/* Hero Section - Moved to the top to extend behind the header */}
      <div className="relative">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt={heroTitle}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div 
            className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30"
          ></div>
        </div>

        {/* Header - Updated to be absolute positioned over the hero */}
        <header 
          className={`sticky top-0 left-0 right-0 z-[100] transition-all duration-300 ${
            scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
          }`}
        >
          <div className="max-w-full mx-auto px-4">
            <div className="flex justify-between items-center h-16">
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
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {name.charAt(0)}
                    </div>
                  )}
                  <span className={`ml-2 font-bold text-lg ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                    {name}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                {/* Cart Button with Item Count - Replacing burger menu */}
                <button
                  onClick={handleButtonClick}
                  className={`p-2 rounded-md ${scrolled ? 'text-gray-900' : 'text-white'} hover:bg-white/10 relative`}
                >
                  <span className="sr-only">Cart</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span 
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    0
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Content - Adjusted padding to account for header */}
        <div className="container mx-auto px-4 relative z-10 py-16 pt-28 min-h-[70vh] flex items-center">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6">
              {heroSubtitle}
            </p>
            <div className="flex justify-center">
              <Button
                size="sm"
                className="bg-white hover:bg-gray-100 text-gray-900 font-medium px-6 py-2 shadow-lg"
                style={{ 
                  backgroundColor: 'white',
                  color: primaryColor
                }}
                onClick={handleButtonClick}
              >
                View Our Menu
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-grow">
        {/* About Section */}
        <section id="about-section" className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">{about?.title || 'About Us'}</h2>
              <p className="text-gray-600">
                {about?.content || 'We are passionate about serving delicious food from our food truck. Our mission is to bring joy through our culinary creations.'}
              </p>
            </div>
            
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {/* Location */}
              <Card>
                <CardContent className="pt-6 flex flex-col items-center text-center p-4">
                  <div className="p-3 rounded-full bg-orange-100 mb-4">
                    <MapPin className="h-5 w-5 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-base mb-2">Find Us</h3>
                  <p className="text-gray-600 text-sm">
                    {contact?.address || 'Visit our locations throughout the city'}
                  </p>
                </CardContent>
              </Card>
              
              {/* Hours */}
              <Card>
                <CardContent className="pt-6 flex flex-col items-center text-center p-4">
                  <div className="p-3 rounded-full bg-orange-100 mb-4">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-base mb-2">Hours</h3>
                  <p className="text-gray-600 text-sm">
                    Monday - Friday: 11am - 8pm<br />
                    Weekends: 10am - 9pm
                  </p>
                </CardContent>
              </Card>
              
              {/* Contact */}
              <Card>
                <CardContent className="pt-6 flex flex-col items-center text-center p-4">
                  <div className="p-3 rounded-full bg-orange-100 mb-4">
                    <Phone className="h-5 w-5 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-base mb-2">Contact</h3>
                  <p className="text-gray-600 text-sm">
                    {contact?.phone || 'Call us for more information'}<br />
                    {contact?.email || 'Email us anytime'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Schedule Section */}
        {schedule && schedule.days && schedule.days.length > 0 && (
          <section id="schedule-section" className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">{schedule.title || 'Our Schedule'}</h2>
                <p className="text-gray-600">
                  {schedule.description || 'Find us at these locations throughout the week.'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                  // Find the schedule for this day
                  const daySchedule = schedule.days?.find(
                    (d) => d.day.toLowerCase() === day.toLowerCase()
                  );
                  
                  return (
                    <Card key={day} className={daySchedule ? 'border-l-4' : ''} style={{ borderLeftColor: daySchedule ? primaryColor : 'transparent' }}>
                      <CardContent className="pt-4 p-4">
                        <div className="flex flex-col">
                          <div className="flex items-center mb-3">
                            <Calendar className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                            <h3 className="font-bold text-base">{day}</h3>
                          </div>
                          
                          {daySchedule ? (
                            <div className="space-y-2">
                              {daySchedule.location && (
                                <p className="font-medium text-sm">{daySchedule.location}</p>
                              )}
                              {daySchedule.address && (
                                <div className="flex items-start">
                                  <MapPin className="h-3 w-3 text-gray-400 mr-1 mt-1 flex-shrink-0" />
                                  <p className="text-gray-600 text-xs">{daySchedule.address}</p>
                                </div>
                              )}
                              {daySchedule.hours && (
                                <p className="text-gray-600 text-xs">Hours: {daySchedule.hours}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic text-xs">Not scheduled</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}
        
        {/* Contact Section */}
        <section id="contact-section" className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Get In Touch</h2>
              <p className="text-gray-600">
                Have questions or want to book our food truck for your event? Reach out to us!
              </p>
            </div>
            
            <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-4">
              <div className="space-y-3 text-center">
                <div>
                  <h3 className="font-semibold text-base">Phone</h3>
                  <p className="text-gray-600 text-sm">{contact?.phone || "Contact us to get our phone number"}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-base">Email</h3>
                  <p className="text-gray-600 text-sm">{contact?.email || "info@foodtruckname.com"}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-base">Address</h3>
                  <p className="text-gray-600 text-sm">{contact?.address || "Various locations - check our social media for updates"}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="font-semibold text-base mb-2">Follow Us</h3>
                  <div className="flex justify-center space-x-4">
                    {socials?.instagram && (
                      <a href="#" onClick={handleButtonClick} className="text-gray-600 hover:text-pink-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                    
                    {socials?.facebook && (
                      <a href="#" onClick={handleButtonClick} className="text-gray-600 hover:text-blue-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-white py-4">
        <div className="max-w-full mx-auto px-4">
          <p className="text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <div className="mt-2 text-center">
            <p className="text-xs text-amber-600 font-medium">
              Preview Mode - Navigation and Ordering Disabled
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 