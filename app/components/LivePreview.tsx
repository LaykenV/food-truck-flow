'use client';

import { useConfig } from './ConfigProvider';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowUpRight, ShoppingBag, Clock, MapPin, ChevronRight } from 'lucide-react';

export function LivePreview() {
  const { config } = useConfig();

  return (
    <Card className="w-full overflow-hidden border shadow-lg">
      <CardContent className="p-0">
        {/* Device Frame */}
        <div className="relative mx-auto max-w-[375px] bg-white rounded-t-xl overflow-hidden shadow-md border-4 border-gray-200">
          {/* Status Bar */}
          <div className="h-6 bg-black text-white text-xs flex items-center justify-between px-4">
            <span>9:41</span>
            <div className="flex items-center space-x-1">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 20.9994C16.4183 20.9994 20 17.4177 20 12.9994C20 8.58107 16.4183 4.99939 12 4.99939C7.58172 4.99939 4 8.58107 4 12.9994C4 17.4177 7.58172 20.9994 12 20.9994Z"></path>
                </svg>
              </span>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1.33333 19.3334H22.6667V4.66675H1.33333V19.3334ZM4.66667 8.00008H19.3333V16.0001H4.66667V8.00008Z"></path>
                </svg>
              </span>
              <span>100%</span>
            </div>
          </div>
          
          {/* Preview Container with fixed height and scrolling */}
          <div className="h-[600px] overflow-y-auto">
            {/* Header */}
            <div className="bg-white shadow sticky top-0 z-10">
              <div className="px-4 py-3 flex justify-between items-center">
                <div className="flex items-center">
                  {config.logo ? (
                    <div className="relative w-8 h-8 mr-2">
                      <Image 
                        src={config.logo} 
                        alt="Logo" 
                        fill
                        className="object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : null}
                  <span className="text-lg font-bold">{config.name}</span>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Hero Section */}
            <div className="relative">
              <div className="h-64 w-full relative">
                {config.hero.image && (
                  <div className="absolute inset-0">
                    <Image 
                      src={config.hero.image} 
                      alt="Hero" 
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                  </div>
                )}
                <div className="relative h-full flex items-center justify-center px-4 z-10">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      {config.hero.title}
                    </h1>
                    <p className="mt-2 text-sm text-white sm:text-base">
                      {config.hero.subtitle}
                    </p>
                    <div className="mt-4">
                      <button 
                        className="px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg"
                        style={{ backgroundColor: config.primaryColor }}
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Info */}
            <div className="px-4 py-3 bg-white">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center p-2">
                  <Clock className="h-5 w-5 mb-1" style={{ color: config.primaryColor }} />
                  <span className="text-xs font-medium">11am - 8pm</span>
                </div>
                <div className="flex flex-col items-center p-2">
                  <MapPin className="h-5 w-5 mb-1" style={{ color: config.primaryColor }} />
                  <span className="text-xs font-medium">Find Us</span>
                </div>
                <div className="flex flex-col items-center p-2">
                  <ShoppingBag className="h-5 w-5 mb-1" style={{ color: config.primaryColor }} />
                  <span className="text-xs font-medium">Order Online</span>
                </div>
              </div>
            </div>
            
            {/* Featured Menu Items */}
            <div className="px-4 py-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Featured Menu
              </h2>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-white rounded-lg shadow-sm overflow-hidden flex">
                    <div className="w-24 h-24 bg-gray-200 flex-shrink-0"></div>
                    <div className="p-3 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">Menu Item {item}</h3>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">Description of this delicious menu item that everyone will love.</p>
                      <div className="mt-1 flex justify-between items-center">
                        <p className="text-sm font-medium" style={{ color: config.primaryColor }}>$9.99</p>
                        <button 
                          className="text-xs px-2 py-1 rounded-full text-white"
                          style={{ backgroundColor: config.primaryColor }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full text-center py-2 text-sm font-medium flex items-center justify-center" style={{ color: config.primaryColor }}>
                  View Full Menu <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            
            {/* About Section */}
            <div className="px-4 py-6 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                About Us
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="bg-gray-200 rounded-lg h-40 mb-4"></div>
              <button className="text-sm font-medium flex items-center" style={{ color: config.primaryColor }}>
                Learn More <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            {/* Location Section */}
            <div className="px-4 py-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Find Us
              </h2>
              <div className="bg-gray-200 rounded-lg h-40 mb-3"></div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-900">Current Location</h3>
                <p className="mt-1 text-xs text-gray-500">123 Main Street, City, State 12345</p>
                <p className="mt-1 text-xs text-gray-500">Monday - Friday: 11am - 8pm</p>
                <p className="mt-1 text-xs text-gray-500">Saturday - Sunday: 12pm - 9pm</p>
              </div>
            </div>
            
            {/* Footer */}
            <footer className="bg-gray-50 px-4 py-6">
              <div className="flex justify-center space-x-6 mb-4">
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
              <p className="text-center text-xs text-gray-400">
                &copy; {new Date().getFullYear()} {config.name}. All rights reserved.
              </p>
            </footer>
          </div>
          
          {/* Home Indicator */}
          <div className="h-1 w-1/3 mx-auto bg-black rounded-full my-2"></div>
        </div>
        
        {/* CTA Button */}
        <div className="p-4 flex justify-center">
          <Button 
            className="w-full max-w-xs flex items-center justify-center gap-2 text-white"
            style={{ backgroundColor: config.primaryColor }}
          >
            Sign Up With This Configuration
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 