"use client";

import { createContext, useState, useEffect, useContext, ReactNode, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { isScheduledOpenServer, getTodayScheduleServer } from "@/lib/schedule-utils-server";

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
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  useEffect(() => {
    if (!foodTruckId) return;
    
    const supabase = createClient();
    
    // Clean up previous channel if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    // Create a unique channel name with a timestamp to avoid conflicts
    const channelName = `open-status-${foodTruckId}-${Date.now()}`;
    console.log('Creating realtime channel for open status:', channelName);
    
    // Create and configure the channel
    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: false }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'FoodTrucks',
          filter: `id=eq.${foodTruckId}`,
        },
        async (payload) => {
          console.log('Realtime FoodTrucks UPDATE received:', payload);
          
          if (!payload.new) {
            console.error('Missing new data in payload');
            return;
          }
          
          // Extract the schedule data from the payload
          const scheduleData = payload.new.configuration?.schedule?.days || [];
          const updatedTodaySchedule = getTodayScheduleServer(scheduleData);
          const updatedIsOpen = isScheduledOpenServer(updatedTodaySchedule);
          
          console.log('Updating open status:', updatedIsOpen, 'Schedule:', updatedTodaySchedule);
          
          // Update the state
          setIsOpen(updatedIsOpen);
          setTodaySchedule(updatedTodaySchedule);
        }
      );
    
    // Subscribe and handle connection status
    channel.subscribe((status, err) => {
      if (err) {
        console.error(`Subscription error for open status ${foodTruckId}:`, err);
        // Could implement a reconnection strategy here
      } else {
        console.log(`Subscription status for open status ${foodTruckId}:`, status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to FoodTrucks real-time updates');
        }
      }
    });
    
    channelRef.current = channel;
    console.log('Realtime open status subscription setup for:', foodTruckId);
    
    // Cleanup function
    return () => {
      console.log('Cleaning up realtime open status subscription for:', foodTruckId);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [foodTruckId]);
  
  return (
    <OpenStatusContext.Provider value={{ isOpen, todaySchedule }}>
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