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
  secondaryColor: "#4CB944" // Fresh green
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
export function ConfigProvider({ children }: { children: ReactNode }) {
  // Start with default config to avoid hydration mismatch
  const [config, setConfigState] = useState<Config>(defaultConfig);
  const [jsonError, setJsonError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load config from localStorage only on client side after initial render
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('foodTruckConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfigState(parsedConfig);
      }
    } catch (error) {
      console.error('Error loading config from localStorage:', error);
    }
    setIsInitialized(true);
  }, []);

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