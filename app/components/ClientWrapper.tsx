'use client';

import { ConfigForm } from './ConfigForm';
import { LivePreview } from './LivePreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ClientWrapper() {
  return (
    <ClientContent />
  );
}

// Separate component to access the ConfigProvider context
function ClientContent() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Mobile View - Tabs for switching between Config and Preview */}
      <div className="md:hidden">
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 sticky top-0 z-10 bg-background">
            <TabsTrigger value="preview" className="flex items-center gap-2 py-3">
              <Smartphone className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2 py-3">
              <Settings className="h-4 w-4" />
              <span>Configure</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="space-y-4 pb-8">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-4">
              Preview Your Food Truck Website
            </h2>
            <LivePreview />
          </TabsContent>
          
          <TabsContent value="config" className="space-y-4 pb-8">
            <ConfigForm />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Desktop View - Side by side with sticky config form */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5 lg:col-span-4 relative">
          {/* Sticky container with proper padding and offset */}
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pb-8">
            <ConfigForm />
          </div>
        </div>
        <div className="md:col-span-7 lg:col-span-8">
          <Card className="p-6 bg-gray-50 border-0 shadow-none">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
              Preview Your Food Truck Website
            </h2>
            <LivePreview />
          </Card>
        </div>
      </div>
    </div>
  );
} 