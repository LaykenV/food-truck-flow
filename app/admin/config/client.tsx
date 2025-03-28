'use client';

import { useState, useEffect } from 'react';
import { AdminConfigWrapper } from '@/app/components/UnifiedConfigWrapper';
import { FoodTruckConfig } from '@/components/FoodTruckTemplate';
import { ConfigProvider } from '@/app/components/UnifiedConfigProvider';
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
    
    try {
      // Save the configuration using the utility function
      const { timestamp } = await saveConfiguration(userId, newConfig);
      
      // Update last saved timestamp
      setLastSaved(timestamp);
      toast.success('Configuration saved successfully!');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error(error instanceof Error ? error.message : 'Error saving configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfigProvider initialConfig={config} onSave={handleSaveConfig}>
      <AdminConfigWrapper 
        initialConfig={config} 
        onSave={handleSaveConfig} 
        isSaving={isLoading}
        lastSaved={lastSaved}
        userId={userId}
      />
    </ConfigProvider>
  );
} 