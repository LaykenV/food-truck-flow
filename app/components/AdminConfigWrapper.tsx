'use client';

import { useState, useEffect } from 'react';
import { AdminConfigForm } from './AdminConfigForm';
import { AdminLivePreview } from './AdminLivePreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { FoodTruckConfig } from '@/components/food-truck-website';
import { toast } from 'sonner';
import { useConfig } from './ConfigProvider';

interface AdminConfigWrapperProps {
  initialConfig: FoodTruckConfig;
  onSave: (config: FoodTruckConfig) => Promise<void>;
  isSaving?: boolean;
  lastSaved?: Date | null;
  userId?: string;
}

export function AdminConfigWrapper({ 
  initialConfig, 
  onSave, 
  isSaving = false, 
  lastSaved = null,
  userId 
}: AdminConfigWrapperProps) {
  const { setConfig } = useConfig();
  const [localConfig, setLocalConfig] = useState<FoodTruckConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<string>("preview");

  // Update local config when initialConfig changes
  useEffect(() => {
    setLocalConfig(initialConfig);
    setConfig(initialConfig);
  }, [initialConfig, setConfig]);

  // Handle saving the configuration
  const handleSaveConfig = async (newConfig: FoodTruckConfig) => {
    try {
      // Ensure we're working with a complete config object
      const completeConfig: FoodTruckConfig = {
        name: newConfig.name || '',
        tagline: newConfig.tagline || '',
        logo: newConfig.logo || '',
        primaryColor: newConfig.primaryColor || '#FF6B35',
        secondaryColor: newConfig.secondaryColor || '#4CB944',
        hero: {
          image: newConfig.hero?.image || '',
          title: newConfig.hero?.title || '',
          subtitle: newConfig.hero?.subtitle || ''
        },
        about: {
          title: newConfig.about?.title || '',
          content: newConfig.about?.content || '',
          image: newConfig.about?.image || ''
        },
        contact: {
          email: newConfig.contact?.email || '',
          phone: newConfig.contact?.phone || '',
          address: newConfig.contact?.address || ''
        },
        socials: {
          twitter: newConfig.socials?.twitter || '',
          instagram: newConfig.socials?.instagram || '',
          facebook: newConfig.socials?.facebook || ''
        }
      };
      
      setLocalConfig(completeConfig);
      setConfig(completeConfig);
      await onSave(completeConfig);
      // The toast notification will be handled by the parent component
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Mobile View - Tabs for switching between Config and Preview */}
      <div className="md:hidden">
        <Tabs 
          defaultValue="preview" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
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
            <AdminLivePreview config={localConfig} />
          </TabsContent>
          
          <TabsContent value="config" className="space-y-4 pb-8">
            <AdminConfigForm 
              initialConfig={localConfig} 
              onSave={handleSaveConfig} 
              isSaving={isSaving} 
              lastSaved={lastSaved}
              userId={userId}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Desktop View - Side by side with equal heights */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5 lg:col-span-4">
          {/* Fixed height container to match preview height */}
          <div className="h-full">
            <AdminConfigForm 
              initialConfig={localConfig} 
              onSave={handleSaveConfig} 
              isSaving={isSaving} 
              lastSaved={lastSaved}
              userId={userId}
            />
          </div>
        </div>
        <div className="md:col-span-7 lg:col-span-8">
          <Card className="p-6 bg-gray-50 border-0 shadow-none">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
              Preview Your Food Truck Website
            </h2>
            <AdminLivePreview config={localConfig} />
          </Card>
        </div>
      </div>
    </div>
  );
} 