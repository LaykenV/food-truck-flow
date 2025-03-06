'use client';

import { createContext, useState, useContext, ReactNode } from 'react';
import { FoodTruckConfig } from '@/components/food-truck-website';

// Define the type for our admin config context
type AdminConfigContextType = {
  config: FoodTruckConfig;
  setConfig: (config: FoodTruckConfig) => void;
  saveConfig: () => Promise<boolean>;
  isSaving: boolean;
};

// Create the context
const AdminConfigContext = createContext<AdminConfigContextType | undefined>(undefined);

// Provider component
interface AdminConfigProviderProps {
  children: ReactNode;
  initialConfig: FoodTruckConfig;
  onSave: (config: FoodTruckConfig) => Promise<void>;
}

export function AdminConfigProvider({ 
  children, 
  initialConfig, 
  onSave 
}: AdminConfigProviderProps) {
  const [config, setConfig] = useState<FoodTruckConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);

  // Function to save the configuration
  const saveConfig = async () => {
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

  return (
    <AdminConfigContext.Provider value={{ config, setConfig, saveConfig, isSaving }}>
      {children}
    </AdminConfigContext.Provider>
  );
}

// Hook to use the admin config context
export function useAdminConfig() {
  const context = useContext(AdminConfigContext);
  if (context === undefined) {
    throw new Error('useAdminConfig must be used within an AdminConfigProvider');
  }
  return context;
} 