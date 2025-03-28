'use client';

import { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { FoodTruckConfig } from '@/components/FoodTruckTemplate';
import { getDefaultConfig } from '@/utils/config-utils';

// Define the type for our config
export type Config = FoodTruckConfig;

// Create the context
type ConfigContextType = {
  config: Config;
  setConfig: (config: Config) => void;
  saveConfig?: () => Promise<boolean>;
  isSaving?: boolean;
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Provider component
interface ConfigProviderProps {
  children: ReactNode;
  initialConfig?: FoodTruckConfig;
  onSave?: (config: FoodTruckConfig) => Promise<void>;
}

export function ConfigProvider({ 
  children, 
  initialConfig, 
  onSave
}: ConfigProviderProps) {
  // Start with provided initialConfig or default config to avoid hydration mismatch
  const [config, setConfigState] = useState<Config>(initialConfig || getDefaultConfig());
  const [isSaving, setIsSaving] = useState(false);

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

  // Function to save the configuration
  const saveConfig = async () => {
    if (!onSave) return false;
    
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

  // Memoized setConfig function to prevent unnecessary re-renders
  const setConfig = useCallback((newConfig: Config) => {
    setConfigState(prevConfig => {
      // Perform a deep comparison to avoid unnecessary state updates
      if (JSON.stringify(prevConfig) === JSON.stringify(newConfig)) {
        return prevConfig;
      }
      return newConfig;
    });
  }, []);

  // Create context value
  const contextValue: ConfigContextType = {
    config,
    setConfig,
    saveConfig,
    isSaving
  };

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
}

// Hook to use the config context
export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

// For backward compatibility - can be removed later
export { ConfigProvider as UnifiedConfigProvider, useConfig as useUnifiedConfig };
export const useAdminConfig = useConfig; 