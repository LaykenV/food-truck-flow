'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Default configuration for the live preview
const defaultConfig = {
  hero: {
    image: "/images/placeholder-hero.jpg",
    title: "Delicious Food Truck",
    subtitle: "Serving the best street food in town"
  },
  logo: "/images/placeholder-logo.jpg",
  name: "Food Truck Name",
  tagline: "Tasty meals on wheels",
  primaryColor: "#FF6B35", // Vibrant orange
  secondaryColor: "#4CB944" // Fresh green
};

// Define the type for our config
export type Config = typeof defaultConfig;

// Create the context
type ConfigContextType = {
  config: Config;
  setConfig: (config: Config) => void;
  jsonError: string;
  setJsonError: (error: string) => void;
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Provider component
export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<Config>(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Try to get config from localStorage
      const savedConfig = localStorage.getItem('foodTruckConfig');
      if (savedConfig) {
        try {
          // Parse the saved config
          const parsedConfig = JSON.parse(savedConfig);
          return parsedConfig;
        } catch (error) {
          console.error('Failed to parse saved config:', error);
        }
      }
    }
    // Fall back to default config if no valid saved config exists
    return defaultConfig;
  });
  const [jsonError, setJsonError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load config from localStorage on initial render
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('foodTruckConfig');
      if (savedConfig) {
        setConfigState(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Error loading config from localStorage:', error);
    }
    setIsInitialized(true);
  }, []);

  // Save config to localStorage whenever it changes
  const setConfig = (newConfig: Config) => {
    setConfigState(newConfig);
    try {
      // Save to localStorage whenever config changes
      localStorage.setItem('foodTruckConfig', JSON.stringify(newConfig));
    } catch (error) {
      console.error('Failed to save config to localStorage:', error);
    }
  };

  return (
    <ConfigContext.Provider value={{ config, setConfig, jsonError, setJsonError }}>
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