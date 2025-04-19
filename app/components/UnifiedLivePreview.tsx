'use client';

import { useState, useEffect, useMemo } from 'react';
import { FoodTruckConfig } from '../../components/FoodTruckTemplate';
import { Card, CardContent } from '@/components/ui/card';
import FoodTruckTemplate from '../../components/FoodTruckTemplate';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Smartphone, Monitor } from 'lucide-react';
import { AuthModals } from '@/components/auth-modals';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FoodTruckNavbar from '@/components/FoodTruckTemplate/FoodTruckNavbar';

// Props for the LivePreview
interface LivePreviewProps {
  config: FoodTruckConfig;
  showSignUpButton?: boolean;
}

export function UnifiedLivePreview({ 
  config,
  showSignUpButton = false
}: LivePreviewProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  // Create a unique key for the template that changes when config changes
  // This forces a re-render of the template component when config changes
  const templateKey = useMemo(() => JSON.stringify(config), [config]);
  
  // Set mounted state and detect mobile device on client-side only
  useEffect(() => {
    setIsMounted(true);
    
    // Check if the user is on a mobile device
    const checkMobileDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobile = mobileRegex.test(userAgent) || window.innerWidth < 768;
      setIsMobileDevice(isMobile);
      
      // If on mobile device, force mobile view
      if (isMobile && viewMode === 'desktop') {
        setViewMode('mobile');
      }
    };
    
    checkMobileDevice();
    
    // Add resize listener to update mobile detection on window resize
    window.addEventListener('resize', checkMobileDevice);
    
    return () => {
      window.removeEventListener('resize', checkMobileDevice);
    };
  }, [viewMode]);

  // Return a placeholder during server-side rendering
  if (!isMounted) {
    return (
      <Card className="w-full overflow-hidden border border-admin-border bg-admin-card shadow-sm">
        <CardContent className="p-0">
          <div className="relative mx-auto max-w-[375px] bg-admin-card rounded-t-xl overflow-hidden shadow-md border-4 border-admin-border">
            <div className="h-6 bg-black text-white text-xs flex items-center justify-between px-4">
              <span>9:41</span>
              <div className="flex items-center space-x-1">
                <span>100%</span>
              </div>
            </div>
            <div className="h-[600px] flex items-center justify-center">
              <p className="text-admin-muted-foreground">Loading preview...</p>
            </div>
            <div className="h-1 w-1/3 mx-auto bg-black rounded-full my-2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use a consistent preview subdomain
  const subdomain = 'preview';

  // Mobile preview component
  const MobilePreview = () => (
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
      <div className="h-[600px] overflow-y-auto overflow-x-hidden" id="preview-scroll-container">
        {/* Wrapper to constrain width and prevent horizontal scrolling */}
        <div className="w-full max-w-[375px] mx-auto mobile-preview-container">
          <style jsx global>{`
            .mobile-preview-container .mobile-view,
            .mobile-preview-container .forced-mobile-view,
            .mobile-preview-container {
              /* Force mobile styling */
              --container-width: 375px;
              max-width: var(--container-width);
            }
            
            /* Force desktop styles to render as mobile when in the mobile preview */
            .mobile-preview-container .desktop-view {
              max-width: var(--container-width) !important;
            }
            
            /* Override responsive classes to force mobile layout */
            .mobile-preview-container .md\\:hidden {
              display: block !important;
            }
            
            .mobile-preview-container .md\\:block {
              display: none !important;
            }
            
            .mobile-preview-container .md\\:flex,
            .mobile-preview-container .lg\\:flex {
              display: none !important;
            }
            
            .mobile-preview-container .forced-desktop-view {
              /* Force desktop view to render as mobile inside mobile container */
              max-width: var(--container-width) !important;
            }
            
            .mobile-preview-container h1 {
              font-size: 1.5rem !important;
            }
            
            .mobile-preview-container h2 {
              font-size: 1.25rem !important;
            }
            
            .mobile-preview-container p {
              font-size: 0.875rem !important;
            }
            
            .mobile-preview-container .grid {
              grid-template-columns: 1fr !important;
            }
            
            .mobile-preview-container .md\\:grid-cols-2,
            .mobile-preview-container .md\\:grid-cols-3,
            .mobile-preview-container .lg\\:grid-cols-2,
            .mobile-preview-container .lg\\:grid-cols-3 {
              grid-template-columns: 1fr !important;
            }
            
            .mobile-preview-container .md\\:flex-row {
              flex-direction: column !important;
            }
            
            .mobile-preview-container .md\\:col-span-2 {
              grid-column: span 1 !important;
            }
            
            .mobile-preview-container .hidden.md\\:block,
            .mobile-preview-container .hidden.md\\:flex,
            .mobile-preview-container .hidden.lg\\:block,
            .mobile-preview-container .hidden.lg\\:flex {
              display: none !important;
            }
            
            .mobile-preview-container .md\\:hidden {
              display: block !important;
            }
            
            .mobile-preview-container .md\\:flex {
              display: flex !important;
            }
            
            .mobile-preview-container .hidden.sm\\:block {
              display: none !important;
            }
            
            .mobile-preview-container .md\\:w-1\\/2,
            .mobile-preview-container .lg\\:w-1\\/2,
            .mobile-preview-container .md\\:w-1\\/3,
            .mobile-preview-container .lg\\:w-1\\/3,
            .mobile-preview-container .md\\:w-2\\/3,
            .mobile-preview-container .lg\\:w-2\\/3 {
              width: 100% !important;
            }
            
            .mobile-preview-container .md\\:px-6,
            .mobile-preview-container .lg\\:px-8 {
              padding-left: 1rem !important;
              padding-right: 1rem !important;
            }
          `}</style>
          <div className="flex flex-col" style={{ minHeight: '600px' }}>
            <main className="flex-grow">
              <FoodTruckNavbar
                config={config}
                subdomain={subdomain}
                displayMode="preview"
                forceViewMode="mobile"
              />
              <FoodTruckTemplate 
                key={`mobile-${templateKey}`}
                config={config} 
                displayMode="preview" 
                subdomain={subdomain}
                forceViewMode="mobile"
              />
            </main>
          </div>
        </div>
      </div>
      
      {/* Home Indicator */}
      <div className="h-1 w-1/3 mx-auto bg-black rounded-full my-2"></div>
    </div>
  );

  // Desktop preview component
  const DesktopPreview = () => (
    <div className="relative w-full bg-white rounded-t-md overflow-hidden shadow-md border border-gray-200">
      {/* Browser Chrome */}
      <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-4">
        <div className="flex space-x-2 items-center">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="mx-auto flex items-center px-4 py-1 rounded-md bg-white border border-gray-200 text-xs text-gray-500 max-w-md">
          {`https://${subdomain}.foodtruckflow.com`}
        </div>
      </div>
      
      {/* Preview Container */}
      <div className="h-[600px] overflow-y-auto overflow-x-hidden" id="desktop-preview-scroll-container">
        <div className="desktop-preview-container">
          <div className="flex flex-col" style={{ minHeight: '600px' }}>
            <main className="flex-grow">
              <FoodTruckNavbar
                config={config}
                subdomain={subdomain}
                displayMode="preview"
                forceViewMode="desktop"
              />
              <FoodTruckTemplate 
                key={`desktop-${templateKey}`}
                config={config} 
                displayMode="preview" 
                subdomain={subdomain}
                forceViewMode="desktop"
              />
            </main>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <Card className="w-full overflow-hidden border border-admin-border bg-admin-card shadow-sm">
        <CardContent className="p-0">
          {/* View Mode Selector - Inside the card */}
          <div className="bg-admin-secondary/30 border-b border-admin-border p-2 flex justify-center">
            <Tabs 
              value={viewMode} 
              onValueChange={(value) => setViewMode(value as 'mobile' | 'desktop')}
              className="w-full max-w-xs"
            >
              <TabsList className={`grid w-full ${isMobileDevice ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <TabsTrigger value="mobile" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile</span>
                </TabsTrigger>
                {!isMobileDevice && (
                  <TabsTrigger value="desktop" className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>Desktop</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
          
          {/* Force mobile view on mobile devices, otherwise use selected view */}
          {isMobileDevice || viewMode === 'mobile' ? <MobilePreview /> : <DesktopPreview />}
          
          {/* CTA Button - Only show if requested */}
          {showSignUpButton && (
            <div className="p-4 flex justify-center">
              <AuthModals 
                initialView="sign-up" 
                trigger={
                  <Button 
                    className="w-full max-w-xs flex items-center justify-center gap-2 bg-gradient-to-r from-admin-primary to-[hsl(var(--admin-gradient-end))] text-admin-primary-foreground hover:opacity-90"
                  >
                    Sign Up With This Configuration
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// For backward compatibility
export { UnifiedLivePreview as LivePreview };
export function AdminLivePreview({ config }: { config: FoodTruckConfig }) {
  return <UnifiedLivePreview config={config} />;
} 