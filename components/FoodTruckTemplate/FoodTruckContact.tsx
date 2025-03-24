'use client';

import { Card } from '@/components/ui/card';
import { Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';
import { DisplayMode } from '.';

export interface FoodTruckContactProps {
  config: {
    contact?: {
      email?: string;
      phone?: string;
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
          className="max-w-4xl mx-auto bg-background rounded-lg p-8 shadow-lg"
          style={{ 
            borderWidth: "1px",
            borderImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor}) 1`,
            boxShadow: `0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.08)`
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Phone */}
            <div className="flex flex-col items-center text-center group">
              <div 
                className="p-4 rounded-full mb-5 transition-all transform group-hover:scale-110 duration-300"
                style={{ 
                  backgroundColor: `color-mix(in srgb, ${primaryColor} 15%, white)`,
                  boxShadow: `0 4px 20px ${primaryColor}30`
                }}
              >
                <Phone 
                  className="h-8 w-8" 
                  style={{ color: primaryColor }}
                />
              </div>
              <h4 className="font-bold text-xl mb-3 text-foreground">{contact?.phone || "Contact us to get our phone number"}</h4>
              <p className="text-muted-foreground text-lg">Call us anytime</p>
            </div>
            
            {/* Email */}
            <div className="flex flex-col items-center text-center group">
              <div 
                className="p-4 rounded-full mb-5 transition-all transform group-hover:scale-110 duration-300"
                style={{ 
                  backgroundColor: `color-mix(in srgb, ${secondaryColor} 15%, white)`,
                  boxShadow: `0 4px 20px ${secondaryColor}30`
                }}
              >
                <Mail 
                  className="h-8 w-8" 
                  style={{ color: secondaryColor }}
                />
              </div>
              <h4 className="font-bold text-xl mb-3 text-foreground">{contact?.email || "info@foodtruckname.com"}</h4>
              <p className="text-muted-foreground text-lg">Email us anytime</p>
            </div>
          </div>
          
          <div 
            className="mt-16 text-center pt-10"
            style={{
              borderTop: `1px solid color-mix(in srgb, ${primaryColor} 30%, ${secondaryColor})20`
            }}
          >
            <h4 className="font-bold text-xl mb-6 text-foreground">Follow Us</h4>
            <div className="flex justify-center space-x-8">
              {instagramUrl ? (
                renderExternalLink(
                  instagramUrl,
                  <div 
                    className="p-3 rounded-full transition-all hover:scale-110 duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}10)`,
                      boxShadow: `0 4px 12px ${primaryColor}30`
                    }}
                  >
                    <Instagram 
                      size={28} 
                      style={{ color: primaryColor }} 
                    />
                  </div>,
                  "text-muted-foreground",
                  "Follow us on Instagram"
                )
              ) : null}
              
              {facebookUrl ? (
                renderExternalLink(
                  facebookUrl,
                  <div 
                    className="p-3 rounded-full transition-all hover:scale-110 duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${secondaryColor}20, ${secondaryColor}10)`,
                      boxShadow: `0 4px 12px ${secondaryColor}30`
                    }}
                  >
                    <Facebook 
                      size={28} 
                      style={{ color: secondaryColor }} 
                    />
                  </div>,
                  "text-muted-foreground",
                  "Follow us on Facebook"
                )
              ) : null}
              
              {twitterUrl ? (
                renderExternalLink(
                  twitterUrl,
                  <div 
                    className="p-3 rounded-full transition-all hover:scale-110 duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`,
                      boxShadow: `0 4px 12px ${primaryColor}20, 0 4px 12px ${secondaryColor}20`
                    }}
                  >
                    <Twitter 
                      size={28} 
                      style={{ color: `color-mix(in srgb, ${primaryColor} 50%, ${secondaryColor})` }} 
                    />
                  </div>,
                  "text-muted-foreground",
                  "Follow us on Twitter/X"
                )
              ) : null}
              
              {/* Show a message if no social links are available */}
              {!instagramUrl && !facebookUrl && !twitterUrl && (
                <div className="text-muted-foreground/70 text-sm italic mt-2 p-4 rounded-lg bg-muted/30">
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