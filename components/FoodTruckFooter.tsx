'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export interface FoodTruckFooterProps {
  config: {
    name?: string;
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
    primaryColor?: string;
  };
  subdomain: string;
}

export default function FoodTruckFooter({ config, subdomain }: FoodTruckFooterProps) {
  // Extract configuration data with defaults
  const {
    name = 'Food Truck',
    contact = {},
    socials = {},
    primaryColor = '#FF6B35',
  } = config;

  const { email, phone, address } = contact;
  const { twitter, instagram, facebook } = socials;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">{name}</h3>
            <p className="text-gray-400 mb-4">
              Delicious food served with passion. Visit us today and experience our amazing menu.
            </p>
            <div className="flex space-x-4">
              {facebook && (
                <a 
                  href={facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {instagram && (
                <a 
                  href={instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {twitter && (
                <a 
                  href={twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${subdomain}`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${subdomain}/menu`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${subdomain}/order`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              {address && (
                <li className="flex items-start">
                  <span className="mr-2">📍</span>
                  <span>{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-start">
                  <span className="mr-2">📞</span>
                  <a 
                    href={`tel:${phone}`}
                    className="hover:text-white transition-colors"
                  >
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li className="flex items-start">
                  <span className="mr-2">✉️</span>
                  <a 
                    href={`mailto:${email}`}
                    className="hover:text-white transition-colors"
                  >
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 mt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>© {currentYear} {name}. All rights reserved.</p>
          <p className="mt-2">
            Powered by <a 
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
              style={{ color: primaryColor }}
            >
              FoodTruckFlow
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
} 