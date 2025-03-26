"use client";

import { useState, useEffect } from "react";
import { Cart } from "@/components/Cart";
import { OrderForm } from "@/components/OrderForm";
import { ShoppingCartDrawer } from "@/components/ShoppingCartDrawer";
import { ClosedStatus } from "./closed-status";
import { useOpenStatus } from "./open-status-provider";
import { format, parseISO } from "date-fns";

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

interface ClientOrderFormProps {
  foodTruck: any;
  subdomain: string;
}

export function ClientOrderForm({ foodTruck, subdomain }: ClientOrderFormProps) {
  const { isOpen, todaySchedule } = useOpenStatus();
  
  // Extract configuration data
  const config = foodTruck.configuration || {};
  const primaryColor = config.primaryColor || '#FF6B35';
  const secondaryColor = config.secondaryColor || '#2EC4B6';
  
  // Create dynamic styles for the page
  const sectionBgStyle = { backgroundColor: `${secondaryColor}10` };
  
  // Get today's closing time if available
  const getClosingTimeISO = () => {
    if (!todaySchedule || !todaySchedule.closeTime) return null;
    
    // Create a date with today's date and the closing time
    const now = new Date();
    const [hours, minutes] = todaySchedule.closeTime.split(':').map(Number);
    
    const closeTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );
    
    // If the closing time has already passed for today, return null
    if (closeTime < now) return null;
    
    return closeTime.toISOString();
  };
  
  const closingTimeISO = getClosingTimeISO();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Order Form or Closed Status */}
      <div>
        <div 
          className="rounded-xl overflow-hidden shadow-md"
          style={{ 
            boxShadow: `0 4px 20px rgba(0, 0, 0, 0.08)`,
            border: `1px solid rgba(${parseInt(secondaryColor.slice(1, 3), 16)}, ${parseInt(secondaryColor.slice(3, 5), 16)}, ${parseInt(secondaryColor.slice(5, 7), 16)}, 0.2)`
          }}
        >
          <div className="p-6 border-b" style={sectionBgStyle}>
            <h2 className="text-xl font-bold" style={{ color: primaryColor }}>
              {isOpen ? "Delivery Information" : "Food Truck Status"}
            </h2>
          </div>
          <div className="p-6">
            {isOpen ? (
              <OrderForm 
                foodTruckId={foodTruck.id} 
                subdomain={subdomain}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                closingTime={closingTimeISO}
              />
            ) : (
              <ClosedStatus 
                todaySchedule={todaySchedule} 
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Order Summary - Hidden on mobile (since we use drawer) and when closed */}
      {isOpen && (
        <div className="hidden lg:block">
          <div 
            className="rounded-xl overflow-hidden shadow-md"
            style={{ 
              boxShadow: `0 4px 20px rgba(0, 0, 0, 0.08)`,
              border: `1px solid rgba(${parseInt(secondaryColor.slice(1, 3), 16)}, ${parseInt(secondaryColor.slice(3, 5), 16)}, ${parseInt(secondaryColor.slice(5, 7), 16)}, 0.2)`
            }}
          >
            <div className="p-6 border-b" style={sectionBgStyle}>
              <h2 className="text-xl font-bold" style={{ color: primaryColor }}>Order Summary</h2>
            </div>
            <div className="p-0">
              <Cart 
                foodTruckId={foodTruck.id} 
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                hideCheckoutButton={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 