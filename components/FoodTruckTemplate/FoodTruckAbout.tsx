'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Phone } from 'lucide-react';
import { DisplayMode } from '.';

export interface FoodTruckAboutProps {
  config: {
    about?: {
      title?: string;
      content?: string;
    };
    contact?: {
      address?: string;
      phone?: string;
      email?: string;
    };
  };
  displayMode: DisplayMode;
}

export default function FoodTruckAbout({ config, displayMode }: FoodTruckAboutProps) {
  // Extract configuration data with defaults
  const {
    about,
    contact
  } = config;

  return (
    <section id="about-section" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{about?.title || 'About Us'}</h2>
          <p className="text-gray-600 text-lg">
            {about?.content || 'We are passionate about serving delicious food from our food truck. Our mission is to bring joy through our culinary creations.'}
          </p>
        </div>
        
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {/* Location */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-orange-100 mb-4">
                  <MapPin className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">Find Us</h3>
                <p className="text-gray-600">
                  {contact?.address || 'Visit our locations throughout the city'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Hours */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-orange-100 mb-4">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">Hours</h3>
                <p className="text-gray-600">
                  Monday - Friday: 11am - 8pm<br />
                  Weekends: 10am - 9pm
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Contact */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-orange-100 mb-4">
                  <Phone className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">Contact</h3>
                <p className="text-gray-600">
                  {contact?.phone || 'Call us for more information'}<br />
                  {contact?.email || 'Email us anytime'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
} 