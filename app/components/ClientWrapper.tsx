'use client';

import { ConfigForm } from './ConfigForm';
import { LivePreview } from './LivePreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Smartphone } from 'lucide-react';

export function ClientWrapper() {
  return (
    <ClientContent />
  );
}

// Separate component to access the ConfigProvider context
function ClientContent() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Mobile View - Tabs for switching between Config and Preview */}
      <div className="md:hidden">
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Configure</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Preview Your Food Truck Website
            </h2>
            <LivePreview />
          </TabsContent>
          
          <TabsContent value="config" className="space-y-4">
            <ConfigForm />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Desktop View - Side by side */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <ConfigForm />
        </div>
        <div className="md:col-span-7">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Preview Your Food Truck Website
          </h2>
          <LivePreview />
        </div>
      </div>
    </div>
  );
} 