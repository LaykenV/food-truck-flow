'use client';

import { createContext, useState, useContext, ReactNode } from 'react';

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
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [jsonError, setJsonError] = useState('');

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