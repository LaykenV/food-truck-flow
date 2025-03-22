'use client';

import Link from 'next/link';
import { DisplayMode } from './index';

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
    secondaryColor?: string;
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
    primaryColor = '#FF6B35',
    secondaryColor = '#2EC4B6',
  } = config;

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

  return (
    <footer className="bg-muted py-6">
      <div 
        className="h-1 mb-6"
        style={{ 
          background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` 
        }}
      ></div>
      <div className="container mx-auto px-4">
        <div className="text-center text-muted-foreground text-sm">
          <p>&copy; {currentYear} {name}. All rights reserved.</p>
          <p className="mt-1">
            Powered by {renderLink(
              "/",
              "FoodTruckFlow",
              "text-muted-foreground hover:text-foreground transition-colors"
            )}
          </p>
        </div>
      </div>
    </footer>
  );
} 