'use client';

import { useState, useEffect } from 'react';
import { UnifiedConfigForm } from './UnifiedConfigForm';
import { UnifiedLivePreview } from './UnifiedLivePreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { FoodTruckConfig } from '@/components/food-truck-website';
import { toast } from 'sonner';
import { useUnifiedConfig, useConfig } from './UnifiedConfigProvider';

// Define the type for the wrapper mode
export type WrapperMode = 'admin' | 'client';

// Props for the UnifiedConfigWrapper
interface UnifiedConfigWrapperProps {
  mode: WrapperMode;
  initialConfig?: FoodTruckConfig;
  onSave?: (config: FoodTruckConfig) => Promise<void>;
  isSaving?: boolean;
  lastSaved?: Date | null;
  userId?: string;
}

export function UnifiedConfigWrapper({ 
  mode,
  initialConfig, 
  onSave, 
  isSaving = false, 
  lastSaved = null,
  userId 
}: UnifiedConfigWrapperProps) {
  const context = useUnifiedConfig();
  const { setConfig } = useConfig();
  const [localConfig, setLocalConfig] = useState<FoodTruckConfig>(
    initialConfig || context.config
  );
  const [activeTab, setActiveTab] = useState<string>("config");

  // Update local config when initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      setLocalConfig(initialConfig);
      setConfig(initialConfig);
    }
  }, [initialConfig, setConfig]);

  // Handle saving the configuration (admin mode only)
  const handleSaveConfig = async (newConfig: FoodTruckConfig) => {
    if (mode !== 'admin' || !onSave) {
      // In client mode, just update the config
      setLocalConfig(newConfig);
      setConfig(newConfig);
      return;
    }

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
        },
        schedule: {
          title: newConfig.schedule?.title || 'Weekly Schedule',
          description: newConfig.schedule?.description || 'Find us at these locations throughout the week',
          days: newConfig.schedule?.days || []
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

  // Render the appropriate form and preview based on mode
  const renderForm = () => {
    return (
      <UnifiedConfigForm
        mode={mode}
        initialConfig={localConfig}
        onSave={handleSaveConfig}
        isSaving={isSaving}
        lastSaved={lastSaved}
        userId={userId}
      />
    );
  };

  // Render the appropriate preview based on mode
  const renderPreview = () => {
    return (
      <UnifiedLivePreview
        mode={mode}
        config={mode === 'admin' ? localConfig : undefined}
      />
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Mobile View - Tabs for switching between Config and Preview */}
      <div className="md:hidden">
        <Tabs 
          defaultValue="config" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6 sticky top-0 z-10 bg-background">
            <TabsTrigger value="config" className="flex items-center gap-2 py-3">
              <Settings className="h-4 w-4" />
              <span>Configure</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2 py-3">
              <Smartphone className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="space-y-4 pb-8">
            {renderForm()}
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4 pb-8">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-4">
              Preview Your Food Truck Website
            </h2>
            {renderPreview()}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Desktop View - Stacked layout with config on top and preview below */}
      <div className="hidden md:flex md:flex-col md:gap-8">
        {/* Config Form Section */}
        <div className="w-full">
          {renderForm()}
        </div>
        
        {/* Preview Section - Full Width */}
        <div className="w-full">
          <Card className="p-6 bg-gray-50 border-0 shadow-none">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
              Preview Your Food Truck Website
            </h2>
            <div className="flex justify-center w-full">
              {renderPreview()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Backward compatibility components
export function AdminConfigWrapper(props: Omit<UnifiedConfigWrapperProps, 'mode'>) {
  return <UnifiedConfigWrapper mode="admin" {...props} />;
}

export function ClientWrapper() {
  return <UnifiedConfigWrapper mode="client" />;
} 