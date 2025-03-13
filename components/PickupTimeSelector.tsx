'use client';

import { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addMinutes, isBefore, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export interface PickupTimeInfo {
  time: Date | null;
  isAsap: boolean;
}

interface PickupTimeSelectorProps {
  closingTime?: string; // ISO string for closing time
  onChange: (pickupTime: PickupTimeInfo) => void;
  className?: string;
}

export function PickupTimeSelector({ 
  closingTime, 
  onChange, 
  className 
}: PickupTimeSelectorProps) {
  const [isAsap, setIsAsap] = useState(true);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeOptions, setTimeOptions] = useState<Date[]>([]);
  
  // Generate time options in 5-minute intervals
  useEffect(() => {
    const options: Date[] = [];
    const now = new Date();
    const close = closingTime ? parseISO(closingTime) : addMinutes(now, 120); // Default to 2 hours from now
    
    // Start with the next 5-minute interval
    let currentTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      Math.ceil(now.getMinutes() / 5) * 5
    );
    
    // Add 15 minutes to the current time for the first option (minimum preparation time)
    currentTime = addMinutes(currentTime, 15);
    
    // Generate options until closing time or for 2 hours
    while (isBefore(currentTime, close) && options.length < 24) {
      options.push(new Date(currentTime));
      currentTime = addMinutes(currentTime, 5);
    }
    
    setTimeOptions(options);
    
    // Set the first time option as default for specific time
    if (options.length > 0 && !selectedTime) {
      setSelectedTime(options[0].toISOString());
    }
  }, [closingTime, selectedTime]);
  
  // Handle ASAP selection
  const handleAsapChange = (value: string) => {
    const asap = value === 'asap';
    setIsAsap(asap);
    onChange({ 
      time: asap ? null : (selectedTime ? new Date(selectedTime) : null),
      isAsap: asap
    });
  };
  
  // Handle specific time selection
  const handleTimeChange = (value: string) => {
    setSelectedTime(value);
    setIsAsap(false);
    onChange({ 
      time: new Date(value),
      isAsap: false
    });
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      <RadioGroup 
        defaultValue="asap" 
        value={isAsap ? 'asap' : 'specific'}
        onValueChange={handleAsapChange}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="asap" id="asap" />
          <Label htmlFor="asap" className="cursor-pointer">As soon as possible</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="specific" id="specific" />
          <Label htmlFor="specific" className="cursor-pointer">Choose a specific time</Label>
        </div>
      </RadioGroup>
      
      {!isAsap && (
        <div className="pl-6">
          <Select
            value={selectedTime || ''}
            onValueChange={handleTimeChange}
            disabled={timeOptions.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a pickup time" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {timeOptions.map((time) => (
                <SelectItem key={time.toISOString()} value={time.toISOString()}>
                  {format(time, 'h:mm a')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Please allow at least 15 minutes for preparation
          </p>
        </div>
      )}
    </div>
  );
} 