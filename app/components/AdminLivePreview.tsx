'use client';

import { useState, useEffect } from 'react';
import { FoodTruckConfig } from '@/components/food-truck-website';
import { Card, CardContent } from '@/components/ui/card';
import FoodTruckWebsite from '@/components/food-truck-website';
import { useConfig } from './ConfigProvider';

interface AdminLivePreviewProps {
  config: FoodTruckConfig;
}

export function AdminLivePreview({ config }: AdminLivePreviewProps) {
  const { setConfig } = useConfig();
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state on client-side only
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update the config in the ConfigProvider when it changes
  useEffect(() => {
    if (isMounted && config) {
      setConfig(config);
    }
  }, [config, setConfig, isMounted]);

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
          <div className="h-[600px] overflow-y-auto overflow-x-hidden">
            {/* Wrapper to constrain width and prevent horizontal scrolling */}
            <div className="w-full max-w-[375px] mx-auto mobile-preview-container">
              <FoodTruckWebsite 
                config={config} 
                displayMode="preview" 
                subdomain="admin-preview"
              />
            </div>
          </div>
          
          {/* Home Indicator */}
          <div className="h-1 w-1/3 mx-auto bg-black rounded-full my-2"></div>
        </div>
      </CardContent>
    </Card>
  );
} 