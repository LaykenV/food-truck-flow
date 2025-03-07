'use client';

import { useState, useEffect } from 'react';
import { FoodTruckConfig } from '../../components/FoodTruckTemplate';
import { Card, CardContent } from '@/components/ui/card';
import FoodTruckTemplate from '../../components/FoodTruckTemplate';
import FoodTruckNavbar from '../../components/FoodTruckNavbar';
import FoodTruckFooter from '../../components/FoodTruckFooter';
import { useConfig } from './UnifiedConfigProvider';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Smartphone, Monitor } from 'lucide-react';
import { AuthModalsWithConfig } from '@/components/auth-modals-with-config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the type for the preview mode
export type PreviewMode = 'admin' | 'client';

// Props for the UnifiedLivePreview
interface UnifiedLivePreviewProps {
  mode: PreviewMode;
  config?: FoodTruckConfig;
}

export function UnifiedLivePreview({ 
  mode = 'client',
  config: propConfig 
}: UnifiedLivePreviewProps) {
  const { config: contextConfig, setConfig } = useConfig();
  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  // Determine which config to use
  const configToUse = propConfig || contextConfig;

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

  // Update the config in the ConfigProvider when it changes (admin mode only)
  useEffect(() => {
    if (isMounted && propConfig && mode === 'admin') {
      setConfig(propConfig);
    }
  }, [propConfig, setConfig, isMounted, mode]);

  // Return a placeholder during server-side rendering
  if (!isMounted) {
    return (
      <Card className="w-full overflow-hidden border shadow-lg">
        <CardContent className="p-0">
          <div className="relative mx-auto max-w-[375px] bg-white rounded-t-xl overflow-hidden shadow-md border-4 border-gray-200">
            <div className="h-6 bg-black text-white text-xs flex items-center justify-between px-4">
              <span>9:41</span>
              <div className="flex items-center space-x-1">
                <span>100%</span>
              </div>
            </div>
            <div className="h-[600px] flex items-center justify-center">
              <p className="text-gray-500">Loading preview...</p>
            </div>
            <div className="h-1 w-1/3 mx-auto bg-black rounded-full my-2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine the subdomain based on mode
  const subdomain = mode === 'admin' ? 'admin-preview' : 'preview';

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
          <div className="flex flex-col" style={{ minHeight: '600px' }}>
            <FoodTruckNavbar 
              config={configToUse} 
              subdomain={subdomain}
              displayMode="preview"
              forceViewMode="mobile"
            />
            <main className="flex-grow">
              <FoodTruckTemplate 
                config={configToUse} 
                displayMode="preview" 
                subdomain={subdomain}
              />
            </main>
            <FoodTruckFooter 
              config={configToUse} 
              subdomain={subdomain}
              displayMode="preview"
            />
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
            <FoodTruckNavbar 
              config={configToUse} 
              subdomain={subdomain}
              displayMode="preview"
              forceViewMode="desktop"
            />
            <main className="flex-grow">
              <FoodTruckTemplate 
                config={configToUse} 
                displayMode="preview" 
                subdomain={subdomain}
              />
            </main>
            <FoodTruckFooter 
              config={configToUse} 
              subdomain={subdomain}
              displayMode="preview"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <Card className="w-full overflow-hidden border shadow-lg">
        <CardContent className="p-0">
          {/* View Mode Selector - Inside the card */}
          <div className="bg-gray-100 border-b border-gray-200 p-2 flex justify-center">
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
          
          {/* CTA Button - Only show in client mode */}
          {mode === 'client' && (
            <div className="p-4 flex justify-center">
              <AuthModalsWithConfig 
                initialView="sign-up" 
                trigger={
                  <Button 
                    className="w-full max-w-xs flex items-center justify-center gap-2 text-white"
                    style={{ backgroundColor: configToUse.primaryColor }}
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

// Backward compatibility components
export function LivePreview() {
  return <UnifiedLivePreview mode="client" />;
}

export function AdminLivePreview({ config }: { config: FoodTruckConfig }) {
  return <UnifiedLivePreview mode="admin" config={config} />;
} 