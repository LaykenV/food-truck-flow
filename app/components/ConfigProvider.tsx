'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { FoodTruckConfig } from '@/components/food-truck-website';

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
  about: {
    title: "About Our Food Truck",
    content: "Tell your story here...",
    image: "/images/placeholder-about.jpg"
  },
  contact: {
    email: "",
    phone: "",
    address: ""
  },
  socials: {
    twitter: "",
    instagram: "",
    facebook: ""
  }
};

// Define the type for our config
export type Config = FoodTruckConfig;

// Create the context
type ConfigContextType = {
  config: Config;
  setConfig: (config: Config) => void;
  jsonError: string;
  setJsonError: (error: string) => void;
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Provider component
interface ConfigProviderProps {
  children: ReactNode;
  initialConfig?: FoodTruckConfig;
}

export function ConfigProvider({ children, initialConfig }: ConfigProviderProps) {
  // Start with provided initialConfig or default config to avoid hydration mismatch
  const [config, setConfigState] = useState<Config>(initialConfig || defaultConfig);
  const [jsonError, setJsonError] = useState('');
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
  // Only if initialConfig is not provided
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialConfig) {
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
  }, [initialConfig]);

  // Save config to localStorage whenever it changes, but only after initialization
  const setConfig = (newConfig: Config) => {
    setConfigState(newConfig);
    if (isInitialized && typeof window !== 'undefined') {
      try {
        localStorage.setItem('foodTruckConfig', JSON.stringify(newConfig));
      } catch (error) {
        console.error('Failed to save config to localStorage:', error);
      }
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