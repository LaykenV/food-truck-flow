'use client';

import { Card } from '@/components/ui/card';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { DisplayMode } from '.';

export interface FoodTruckContactProps {
  config: {
    contact?: {
      email?: string;
      phone?: string;
      address?: string;
    };
    socials?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
    };
    primaryColor?: string;
    secondaryColor?: string;
  };
  displayMode: DisplayMode;
  forceViewMode?: 'mobile' | 'desktop';
}

export default function FoodTruckContact({ config, displayMode }: FoodTruckContactProps) {
  // Extract configuration data
  const { 
    contact,
    primaryColor = '#FF6B35',
    secondaryColor = '#4CB944'
  } = config;
  
  // Get social links from socials property
  const socials = config.socials || {};
  
  // Helper function to check if URL is valid
  const isValidUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    
    // Check if URL has a valid protocol
    try {
      // Add https:// if no protocol is specified
      const urlToCheck = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : `https://${url}`;
      
      new URL(urlToCheck);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Format URL to ensure it includes protocol
  const formatUrl = (url: string | undefined): string => {
    if (!url) return '';
    
    return url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `https://${url}`;
  };
  
  // Get formatted, valid social URLs
  const instagramUrl = isValidUrl(socials.instagram) ? formatUrl(socials.instagram) : null;
  const facebookUrl = isValidUrl(socials.facebook) ? formatUrl(socials.facebook) : null;
  const twitterUrl = isValidUrl(socials.twitter) ? formatUrl(socials.twitter) : null;

  // Handle link clicks in preview mode
  const handleLinkClick = (e: React.MouseEvent) => {
    if (displayMode === 'preview') {
      e.preventDefault();
      // Maybe show a toast: "This link is disabled in preview mode"
    }
  };

  // Render external link based on display mode
  const renderExternalLink = (href: string, children: React.ReactNode, className: string, title: string) => {
    if (displayMode === 'live') {
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className={className}
          title={title}
          aria-label={title}
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
          title={`${title} (disabled in preview mode)`}
          aria-label={title}
        >
          {children}
        </a>
      );
    }
  };

  return (
    <section id="contact-section" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Decorative elements */}
        <div className="relative mb-16">
          <div 
            className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2"
            style={{ 
              background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor}, ${primaryColor})` 
            }}
          ></div>
          <div className="relative flex justify-center">
            <div className="bg-background px-8">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` 
                }}
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ 
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: secondaryColor }}
          >
            Get In Touch
          </h2>
          <div 
            className="w-16 h-1 mx-auto my-4"
            style={{ 
              background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` 
            }}
          ></div>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-muted-foreground">
            Have questions or want to book our food truck for your event? Reach out to us!
          </p>
        </div>
        
        <div 
          className="max-w-4xl mx-auto bg-background rounded-lg p-8 shadow-sm"
          style={{ 
            borderWidth: "1px",
            borderImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor}) 1` 
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Phone */}
            <div className="flex flex-col items-center text-center group">
              <div 
                className="p-3 rounded-full mb-4 transition-colors"
                style={{ 
                  backgroundColor: `color-mix(in srgb, ${primaryColor} 10%, white)` 
                }}
              >
                <Phone 
                  className="h-6 w-6" 
                  style={{ color: primaryColor }}
                />
              </div>
              <h4 className="font-bold text-lg mb-2 text-foreground">{contact?.phone || "Contact us to get our phone number"}</h4>
              <p className="text-muted-foreground">Call us anytime</p>
            </div>
            
            {/* Email */}
            <div className="flex flex-col items-center text-center group">
              <div 
                className="p-3 rounded-full mb-4 transition-colors"
                style={{ 
                  backgroundColor: `color-mix(in srgb, ${secondaryColor} 10%, white)` 
                }}
              >
                <Mail 
                  className="h-6 w-6" 
                  style={{ color: secondaryColor }}
                />
              </div>
              <h4 className="font-bold text-lg mb-2 text-foreground">{contact?.email || "info@foodtruckname.com"}</h4>
              <p className="text-muted-foreground">Email us anytime</p>
            </div>
            
            {/* Address */}
            <div className="flex flex-col items-center text-center group">
              <div 
                className="p-3 rounded-full mb-4 transition-colors"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)` 
                }}
              >
                <MapPin 
                  className="h-6 w-6" 
                  style={{ 
                    color: `color-mix(in srgb, ${primaryColor} 50%, ${secondaryColor})` 
                  }}
                />
              </div>
              <h4 className="font-bold text-lg mb-2 text-foreground">Location</h4>
              <p className="text-muted-foreground">{contact?.address || "Various locations - check our social media for updates"}</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <h4 className="font-bold text-lg mb-4 text-foreground">Follow Us</h4>
            <div className="flex justify-center space-x-6">
              {instagramUrl ? (
                renderExternalLink(
                  instagramUrl,
                  <Instagram size={24} style={{ color: primaryColor }} />,
                  "text-muted-foreground transition-all p-2 rounded-full hover:scale-110 hover:bg-primary/10",
                  "Follow us on Instagram"
                )
              ) : null}
              
              {facebookUrl ? (
                renderExternalLink(
                  facebookUrl,
                  <Facebook size={24} style={{ color: secondaryColor }} />,
                  "text-muted-foreground transition-all p-2 rounded-full hover:scale-110 hover:bg-secondary/10",
                  "Follow us on Facebook"
                )
              ) : null}
              
              {twitterUrl ? (
                renderExternalLink(
                  twitterUrl,
                  <Twitter size={24} style={{ color: `color-mix(in srgb, ${primaryColor} 50%, ${secondaryColor})` }} />,
                  "text-muted-foreground transition-all p-2 rounded-full hover:scale-110 hover:bg-primary/5 hover:bg-secondary/5",
                  "Follow us on Twitter/X"
                )
              ) : null}
              
              {/* Show a message if no social links are available */}
              {!instagramUrl && !facebookUrl && !twitterUrl && (
                <div className="text-muted-foreground/70 text-sm italic">
                  Social media links will appear here when added
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 