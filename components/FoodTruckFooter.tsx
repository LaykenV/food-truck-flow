'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { DisplayMode } from '@/components/FoodTruckTemplate';

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
  displayMode?: DisplayMode;
  forceViewMode?: 'mobile' | 'desktop';
}

export default function FoodTruckFooter({ 
  config, 
  subdomain,
  displayMode = 'live',
  forceViewMode
}: FoodTruckFooterProps) {
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

  // Handle link click in preview mode
  const handleLinkClick = (e: React.MouseEvent) => {
    if (displayMode === 'preview') {
      e.preventDefault();
      // Maybe show a toast: "This link is disabled in preview mode"
    }
  };

  // Render link based on display mode
  const renderLink = (href: string, children: React.ReactNode, className: string) => {
    if (displayMode === 'live') {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    } else {
      return (
        <a href="#" onClick={handleLinkClick} className={className}>
          {children}
        </a>
      );
    }
  };

  // Render external link based on display mode
  const renderExternalLink = (href: string, children: React.ReactNode, className: string) => {
    if (displayMode === 'live') {
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className={className}
        >
          {children}
        </a>
      );
    } else {
      return (
        <a 
          href="#" 
          onClick={handleLinkClick}
          className={className}
        >
          {children}
        </a>
      );
    }
  };

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
                renderExternalLink(
                  facebook,
                  <Facebook className="h-5 w-5" />,
                  "text-gray-400 hover:text-white transition-colors"
                )
              )}
              {instagram && (
                renderExternalLink(
                  instagram,
                  <Instagram className="h-5 w-5" />,
                  "text-gray-400 hover:text-white transition-colors"
                )
              )}
              {twitter && (
                renderExternalLink(
                  twitter,
                  <Twitter className="h-5 w-5" />,
                  "text-gray-400 hover:text-white transition-colors"
                )
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                {renderLink(
                  `/${subdomain}`,
                  "Home",
                  "text-gray-400 hover:text-white transition-colors"
                )}
              </li>
              <li>
                {renderLink(
                  `/${subdomain}/menu`,
                  "Menu",
                  "text-gray-400 hover:text-white transition-colors"
                )}
              </li>
              <li>
                {renderLink(
                  `/${subdomain}/order`,
                  "Order",
                  "text-gray-400 hover:text-white transition-colors"
                )}
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
                  {displayMode === 'live' ? (
                    <a 
                      href={`tel:${phone}`}
                      className="hover:text-white transition-colors"
                    >
                      {phone}
                    </a>
                  ) : (
                    <a 
                      href="#"
                      onClick={handleLinkClick}
                      className="hover:text-white transition-colors"
                    >
                      {phone}
                    </a>
                  )}
                </li>
              )}
              {email && (
                <li className="flex items-start">
                  <span className="mr-2">✉️</span>
                  {displayMode === 'live' ? (
                    <a 
                      href={`mailto:${email}`}
                      className="hover:text-white transition-colors"
                    >
                      {email}
                    </a>
                  ) : (
                    <a 
                      href="#"
                      onClick={handleLinkClick}
                      className="hover:text-white transition-colors"
                    >
                      {email}
                    </a>
                  )}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 mt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>© {currentYear} {name}. All rights reserved.</p>
          <p className="mt-2">
            Powered by {renderLink(
              "/",
              "FoodTruckFlow",
              "text-gray-400 hover:text-white transition-colors"
            )}
          </p>
        </div>
      </div>
    </footer>
  );
} 