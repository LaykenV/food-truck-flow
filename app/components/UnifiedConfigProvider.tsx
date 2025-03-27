'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { FoodTruckConfig } from '@/components/FoodTruckTemplate';

// Default configuration for the live preview
const defaultConfig: FoodTruckConfig = {
  hero: {
    image: "/images/placeholder-hero.jpg",
    title: "Delicious Food Truck",
    subtitle: "Serving the best street food in town"
  },
  logo: "/images/placeholder-logo.jpg",
  name: "Food Truck Name",
  tagline: "Tasty meals on wheels",
  primaryColor: "#FF6B35", // Vibrant orange
  secondaryColor: "#4CB944", // Fresh green
  heroFont: "#FFFFFF", // White for hero text
  about: {
    title: "About Our Food Truck",
    content: "Tell your story here...",
    image: "/images/placeholder-about.jpg"
  },
  contact: {
    email: "",
    phone: ""
  },
  socials: {
    twitter: "",
    instagram: "",
    facebook: ""
  },
  schedule: {
    title: "Find Our Truck",
    description: "Check out our weekly schedule and locations",
    days: [
      {
        day: "Monday",
        location: "Downtown",
        address: "123 Main St",
        openTime: "11:00",
        closeTime: "14:00"
      },
      {
        day: "Wednesday",
        location: "Business District",
        address: "456 Market Ave",
        openTime: "11:00",
        closeTime: "14:00"
      },
      {
        day: "Friday",
        location: "Food Truck Friday",
        address: "789 Park Blvd",
        openTime: "17:00",
        closeTime: "21:00"
      },
      {
        day: "Saturday",
        location: "Farmers Market",
        address: "321 Harvest Lane",
        openTime: "09:00",
        closeTime: "13:00"
      }
    ]
  }
};

// Define the type for our config
export type Config = FoodTruckConfig;

// Define the mode for the provider
export type ConfigMode = 'admin' | 'client';

// Create the context
type UnifiedConfigContextType = {
  config: Config;
  setConfig: (config: Config) => void;
  saveConfig?: () => Promise<boolean>;
  isSaving?: boolean;
  jsonError?: string;
  setJsonError?: (error: string) => void;
  mode: ConfigMode;
  updateConfig?: (partialConfig: Partial<Config>) => void;
};

const UnifiedConfigContext = createContext<UnifiedConfigContextType | undefined>(undefined);

// Provider component
interface UnifiedConfigProviderProps {
  children: ReactNode;
  initialConfig?: FoodTruckConfig;
  onSave?: (config: FoodTruckConfig) => Promise<void>;
  mode: ConfigMode;
}

export function UnifiedConfigProvider({ 
  children, 
  initialConfig, 
  onSave,
  mode 
}: UnifiedConfigProviderProps) {
  // Start with provided initialConfig or default config to avoid hydration mismatch
  const [config, setConfigState] = useState<Config>(initialConfig || defaultConfig);
  const [jsonError, setJsonError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Update config when initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      setConfigState(prevConfig => {
        // Only update if the initialConfig is different from the current config
        if (JSON.stringify(prevConfig) !== JSON.stringify(initialConfig)) {
          return initialConfig;
        }
        return prevConfig;
      });
    }
  }, [initialConfig]);

  // Load config from localStorage only on client side after initial render
  // Only if in client mode and initialConfig is not provided
  useEffect(() => {
    if (typeof window !== 'undefined' && mode === 'client' && !initialConfig) {
      try {
        const savedConfig = localStorage.getItem('foodTruckConfig');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          setConfigState(parsedConfig);
        }
      } catch (error) {
        console.error('Error loading config from localStorage:', error);
      }
    }
    setIsInitialized(true);
  }, [initialConfig, mode]);

  // Function to save the configuration (admin mode)
  const saveConfig = async () => {
    if (mode !== 'admin' || !onSave) return false;
    
    setIsSaving(true);
    try {
      await onSave(config);
      return true;
    } catch (error) {
      console.error('Error saving configuration:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Set config function that handles both modes
  const setConfig = (newConfig: Config) => {
    setConfigState(newConfig);
    
    // In client mode, save to localStorage
    if (mode === 'client' && isInitialized && typeof window !== 'undefined') {
      try {
        localStorage.setItem('foodTruckConfig', JSON.stringify(newConfig));
      } catch (error) {
        console.error('Failed to save config to localStorage:', error);
      }
    }
  };

  // Function to update partial config (useful for real-time updates)
  const updateConfig = (partialConfig: Partial<Config>) => {
    setConfigState(prevConfig => {
      const updatedConfig = { ...prevConfig, ...partialConfig };
      
      // In client mode, save to localStorage
      if (mode === 'client' && isInitialized && typeof window !== 'undefined') {
        try {
          localStorage.setItem('foodTruckConfig', JSON.stringify(updatedConfig));
        } catch (error) {
          console.error('Failed to save config to localStorage:', error);
        }
      }
      
      return updatedConfig;
    });
  };

  // Create context value based on mode
  const contextValue: UnifiedConfigContextType = {
    config,
    setConfig,
    updateConfig,
    mode,
    ...(mode === 'admin' ? { saveConfig, isSaving } : {}),
    ...(mode === 'client' ? { jsonError, setJsonError } : {})
  };

  return (
    <UnifiedConfigContext.Provider value={contextValue}>
      {children}
    </UnifiedConfigContext.Provider>
  );
}

// Hook to use the unified config context
export function useUnifiedConfig() {
  const context = useContext(UnifiedConfigContext);
  if (context === undefined) {
    throw new Error('useUnifiedConfig must be used within a UnifiedConfigProvider');
  }
  return context;
}

// Backward compatibility hooks
export function useConfig() {
  const context = useUnifiedConfig();
  if (context.mode !== 'client') {
    console.warn('useConfig is being used with a provider in admin mode. This may cause unexpected behavior.');
  }
  return {
    config: context.config,
    setConfig: context.setConfig,
    updateConfig: context.updateConfig,
    jsonError: context.jsonError || '',
    setJsonError: context.setJsonError || (() => {})
  };
}

export function useAdminConfig() {
  const context = useUnifiedConfig();
  if (context.mode !== 'admin') {
    console.warn('useAdminConfig is being used with a provider in client mode. This may cause unexpected behavior.');
  }
  return {
    config: context.config,
    setConfig: context.setConfig,
    updateConfig: context.updateConfig,
    saveConfig: context.saveConfig || (async () => false),
    isSaving: context.isSaving || false
  };
} 