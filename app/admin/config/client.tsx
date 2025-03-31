'use client';

import { useState } from 'react';
import { AdminConfigWrapper } from '@/app/components/UnifiedConfigWrapper';
import { FoodTruckConfig } from '@/components/FoodTruckTemplate';
import { ConfigProvider } from '@/app/components/UnifiedConfigProvider';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFoodTruck } from '@/app/admin/clientQueries';
import { saveConfiguration } from '@/app/admin/config/actions';
import { getDefaultConfig } from '@/utils/config-utils';

export function AdminConfigClient() {
  const queryClient = useQueryClient();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Fetch food truck data using React Query
  const { 
    data: foodTruck, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['foodTruck'],
    queryFn: getFoodTruck
  });

  // Extract configuration from food truck data or use default config
  const config = foodTruck?.configuration ? 
    mapDatabaseConfigToFoodTruckConfig(foodTruck.configuration) : 
    getDefaultConfig();

  // Use mutation for saving configuration
  const saveConfigMutation = useMutation({
    mutationFn: (newConfig: FoodTruckConfig) => saveConfiguration(newConfig),
    onSuccess: (data) => {
      // Update last saved timestamp
      setLastSaved(data.timestamp);
      // Invalidate the foodTruck query to refetch with new data
      queryClient.invalidateQueries({ queryKey: ['foodTruck'] });
      toast.success('Configuration saved successfully!');
    },
    onError: (error: any) => {
      console.error('Error saving configuration:', error);
      toast.error(error instanceof Error ? error.message : 'Error saving configuration. Please try again.');
    }
  });

  // Function to save the configuration
  const handleSaveConfig = async (newConfig: FoodTruckConfig) => {
    // Validate the configuration before saving
    if (!newConfig.name || !newConfig.name.trim()) {
      toast.error('Food truck name is required');
      return;
    }

    // Save configuration using mutation
    saveConfigMutation.mutate(newConfig);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error loading configuration: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <ConfigProvider initialConfig={config} onSave={handleSaveConfig}>
      <AdminConfigWrapper 
        initialConfig={config} 
        onSave={handleSaveConfig} 
        isSaving={saveConfigMutation.isPending}
        lastSaved={lastSaved}
        userId={foodTruck?.user_id || ''}
      />
    </ConfigProvider>
  );
}

// Helper function to map database configuration to FoodTruckConfig format
function mapDatabaseConfigToFoodTruckConfig(dbConfig: any) {
  // Detect legacy format and migrate it
  const defaultConfig = getDefaultConfig();
  
  // Check for legacy social property and migrate it
  if (dbConfig.social && !dbConfig.socials) {
    dbConfig.socials = dbConfig.social;
  }
  
  return {
    name: dbConfig.truckName || dbConfig.name || defaultConfig.name,
    tagline: dbConfig.tagline || defaultConfig.tagline,
    logo: dbConfig.logo || defaultConfig.logo,
    primaryColor: dbConfig.primaryColor || defaultConfig.primaryColor,
    secondaryColor: dbConfig.secondaryColor || defaultConfig.secondaryColor,
    heroFont: dbConfig.heroFont || defaultConfig.heroFont,
    hero: {
      image: dbConfig.heroImage || dbConfig.hero?.image || defaultConfig.hero?.image,
      title: dbConfig.heroTitle || dbConfig.hero?.title || defaultConfig.hero?.title,
      subtitle: dbConfig.heroSubtitle || dbConfig.hero?.subtitle || defaultConfig.hero?.subtitle
    },
    about: {
      title: dbConfig.aboutTitle || dbConfig.about?.title || defaultConfig.about?.title,
      content: dbConfig.aboutContent || dbConfig.about?.content || dbConfig.description || defaultConfig.about?.content,
      image: dbConfig.aboutImage || dbConfig.about?.image || defaultConfig.about?.image
    },
    contact: {
      email: dbConfig.contactEmail || dbConfig.contact?.email || defaultConfig.contact?.email,
      phone: dbConfig.contactPhone || dbConfig.contact?.phone || defaultConfig.contact?.phone
    },
    socials: {
      twitter: dbConfig.socialTwitter || dbConfig.socials?.twitter || defaultConfig.socials?.twitter,
      instagram: dbConfig.socialInstagram || dbConfig.socials?.instagram || defaultConfig.socials?.instagram,
      facebook: dbConfig.socialFacebook || dbConfig.socials?.facebook || defaultConfig.socials?.facebook
    },
    schedule: {
      title: dbConfig.scheduleTitle || dbConfig.schedule?.title || defaultConfig.schedule?.title,
      description: dbConfig.scheduleDescription || dbConfig.schedule?.description || defaultConfig.schedule?.description,
      days: dbConfig.scheduleDays || dbConfig.schedule?.days || defaultConfig.schedule?.days
    }
  };
} 