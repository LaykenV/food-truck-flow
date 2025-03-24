'use client';

import { useState, useEffect } from 'react';
import { AdminConfigWrapper } from '@/app/components/UnifiedConfigWrapper';
import { FoodTruckConfig } from '@/components/FoodTruckTemplate';
import { UnifiedConfigProvider } from '@/app/components/UnifiedConfigProvider';
import { toast } from 'sonner';
import { saveConfiguration, subscribeToConfigChanges } from '@/utils/config-utils';

interface AdminConfigClientProps {
  initialConfig: FoodTruckConfig;
  userId: string;
}

export function AdminConfigClient({ initialConfig, userId }: AdminConfigClientProps) {
  const [config, setConfig] = useState<FoodTruckConfig>(initialConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Update local config when initialConfig changes
  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  // Set up real-time subscription to configuration changes
  useEffect(() => {
    // Subscribe to configuration changes
    const unsubscribe = subscribeToConfigChanges(userId, (newConfig) => {
      // Only update if the config is different from the current one
      if (JSON.stringify(newConfig) !== JSON.stringify(config)) {
        setConfig(newConfig);
        toast.info('Configuration updated from another session');
      }
    });

    // Clean up subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, [userId, config]);

  // Function to save the configuration to Supabase
  const handleSaveConfig = async (newConfig: FoodTruckConfig) => {
    // Validate the configuration before saving
    if (!newConfig.name || !newConfig.name.trim()) {
      toast.error('Food truck name is required');
      return;
    }

    setIsLoading(true);
    
    // Ensure all config properties are properly set with defaults if missing
    const completeConfig: FoodTruckConfig = {
      name: newConfig.name || '',
      tagline: newConfig.tagline || '',
      logo: newConfig.logo || '',
      primaryColor: newConfig.primaryColor || '#FF6B35',
      secondaryColor: newConfig.secondaryColor || '#4CB944',
      heroFont: newConfig.heroFont || '#FFFFFF',
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
        phone: newConfig.contact?.phone || ''
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
    
    // Optimistic update - update the UI immediately
    setConfig(completeConfig);
    
    try {
      // Save the configuration using the utility function
      const { timestamp } = await saveConfiguration(userId, completeConfig);
      
      // Update last saved timestamp
      setLastSaved(timestamp);
      toast.success('Configuration saved successfully!');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error(error instanceof Error ? error.message : 'Error saving configuration. Please try again.');
      
      // Revert to the previous config if the update fails
      setConfig(config);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UnifiedConfigProvider initialConfig={config} mode="admin" onSave={handleSaveConfig}>
      <AdminConfigWrapper 
        initialConfig={config} 
        onSave={handleSaveConfig} 
        isSaving={isLoading}
        lastSaved={lastSaved}
        userId={userId}
      />
    </UnifiedConfigProvider>
  );
} 