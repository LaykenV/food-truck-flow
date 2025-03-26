"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from "react";

interface ScheduleDay {
  day: string;
  location?: string;
  address?: string;
  hours?: string;
  openTime?: string;
  closeTime?: string;
  isClosed?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  closureTimestamp?: string;
}

interface OpenStatusContextType {
  isOpen: boolean;
  todaySchedule: ScheduleDay | undefined;
  refreshStatus: () => Promise<void>;
}

const OpenStatusContext = createContext<OpenStatusContextType | null>(null);

export function OpenStatusProvider({ 
  children, 
  initialStatus,
  initialSchedule,
  foodTruckId 
}: { 
  children: ReactNode; 
  initialStatus: boolean;
  initialSchedule: ScheduleDay | undefined;
  foodTruckId: string;
}) {
  const [isOpen, setIsOpen] = useState(initialStatus);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleDay | undefined>(initialSchedule);
  
  const refreshStatus = async () => {
    try {
      const response = await fetch(`/api/check-open?foodTruckId=${foodTruckId}`);
      if (!response.ok) {
        console.error('Error refreshing status:', await response.text());
        return;
      }
      
      const data = await response.json();
      setIsOpen(data.isOpen);
      setTodaySchedule(data.todaySchedule);
    } catch (error) {
      console.error("Failed to refresh open status:", error);
    }
  };
  
  // Refresh status every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [foodTruckId]);
  
  return (
    <OpenStatusContext.Provider value={{ isOpen, todaySchedule, refreshStatus }}>
      {children}
    </OpenStatusContext.Provider>
  );
}

export const useOpenStatus = () => {
  const context = useContext(OpenStatusContext);
  if (!context) {
    throw new Error("useOpenStatus must be used within an OpenStatusProvider");
  }
  return context;
}; 