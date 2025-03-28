'use client';

import { useState, useEffect, useCallback } from 'react';
import { UnifiedConfigForm } from './UnifiedConfigForm';
import { AdminLivePreview } from './UnifiedLivePreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { FoodTruckConfig } from '@/components/FoodTruckTemplate';
import { toast } from 'sonner';
import { useConfig } from './UnifiedConfigProvider';

// Props for the ConfigWrapper
interface ConfigWrapperProps {
  initialConfig?: FoodTruckConfig;
  onSave?: (config: FoodTruckConfig) => Promise<void>;
  isSaving?: boolean;
  lastSaved?: Date | null;
  userId?: string;
}

export function ConfigWrapper({ 
  initialConfig, 
  onSave, 
  isSaving = false, 
  lastSaved = null,
  userId 
}: ConfigWrapperProps) {
  const { config: contextConfig, setConfig } = useConfig();
  
  // Use a more structured approach to state management
  const [localConfig, setLocalConfig] = useState<FoodTruckConfig>(
    initialConfig || contextConfig
  );
  const [activeTab, setActiveTab] = useState<string>("config");
  
  // Update local config when initialConfig changes from parent
  useEffect(() => {
    if (initialConfig) {
      setLocalConfig(initialConfig);
      // Also update the context config to ensure the preview is updated
      setConfig(initialConfig);
    }
  }, [initialConfig, setConfig]);

  // Memoized function to handle config changes from the form
  const handleConfigUpdate = useCallback((updatedConfig: FoodTruckConfig) => {
    // Update both local state and context
    setLocalConfig(updatedConfig);
    setConfig(updatedConfig);
  }, [setConfig]);

  // Handle saving the configuration
  const handleSaveConfig = async (newConfig: FoodTruckConfig) => {
    // First update local and context state for immediate preview
    handleConfigUpdate(newConfig);
    
    // If no onSave provided, we're done (client-side only changes)
    if (!onSave) return;

    try {
      // Ensure we're working with a complete config object
      const completeConfig: FoodTruckConfig = {
        ...newConfig,
        // Default values for required fields
        name: newConfig.name || '',
        tagline: newConfig.tagline || '',
        logo: newConfig.logo || '',
        primaryColor: newConfig.primaryColor || '#FF6B35',
        secondaryColor: newConfig.secondaryColor || '#4CB944',
        heroFont: newConfig.heroFont || '#FFFFFF',
        hero: {
          ...newConfig.hero,
          image: newConfig.hero?.image || '',
          title: newConfig.hero?.title || '',
          subtitle: newConfig.hero?.subtitle || ''
        },
        about: {
          ...newConfig.about,
          title: newConfig.about?.title || '',
          content: newConfig.about?.content || '',
          image: newConfig.about?.image || ''
        },
        contact: {
          ...newConfig.contact,
          email: newConfig.contact?.email || '',
          phone: newConfig.contact?.phone || ''
        },
        socials: {
          ...newConfig.socials,
          twitter: newConfig.socials?.twitter || '',
          instagram: newConfig.socials?.instagram || '',
          facebook: newConfig.socials?.facebook || ''
        },
        schedule: {
          ...newConfig.schedule,
          title: newConfig.schedule?.title || 'Weekly Schedule',
          description: newConfig.schedule?.description || 'Find us at these locations throughout the week',
          days: newConfig.schedule?.days || []
        }
      };
      
      // Save to backend
      await onSave(completeConfig);
      
      // Update state with the complete config after successful save
      handleConfigUpdate(completeConfig);
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
            <UnifiedConfigForm
              initialConfig={localConfig}
              onSave={handleSaveConfig}
              isSaving={isSaving}
              lastSaved={lastSaved}
              userId={userId}
            />
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4 pb-8">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-4">
              Preview Your Food Truck Website
            </h2>
            <AdminLivePreview config={localConfig} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Desktop View - Stacked layout with config on top and preview below */}
      <div className="hidden md:flex md:flex-col md:gap-8">
        {/* Config Form Section */}
        <div className="w-full">
          <UnifiedConfigForm
            initialConfig={localConfig}
            onSave={handleSaveConfig}
            isSaving={isSaving}
            lastSaved={lastSaved}
            userId={userId}
          />
        </div>
        
        {/* Preview Section - Full Width */}
        <div className="w-full">
          <Card className="p-6 bg-gray-50 border-0 shadow-none">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
              Preview Your Food Truck Website
            </h2>
            <div className="flex justify-center w-full">
              <AdminLivePreview config={localConfig} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Backward compatibility components
export { ConfigWrapper as UnifiedConfigWrapper };
export function AdminConfigWrapper(props: ConfigWrapperProps) {
  return <ConfigWrapper {...props} />;
}
export function ClientWrapper() {
  return <ConfigWrapper />;
} 