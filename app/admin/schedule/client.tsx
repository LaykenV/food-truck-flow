'use client';

import { createClient } from '@/utils/supabase/client'
import { useState, useRef, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Edit, Trash2, Plus, Calendar, MapPin, Clock, XCircle, X, Settings, PlusCircle, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { formatTimeRange } from '@/lib/schedule-utils';
import type { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';
import AddressAutofillInput from '@/components/AddressAutofillInput';
import { ScheduleCard, ScheduleDayGroup } from '@/components/ui/schedule-card';
import { updateSchedule } from './actions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFoodTruck, getScheduleFromFoodTruck } from '@/app/admin/clientQueries';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AdminScheduleCard } from '@/components/ui/admin-schedule-card';

// List of common IANA timezones (can be expanded or loaded dynamically)
const commonTimezones = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Asia/Tokyo', 'Asia/Dubai', 'Asia/Kolkata', 'Australia/Sydney'
];

interface ScheduleDay {
  day: string;
  location?: string;
  address?: string;
  openTime?: string; // Format: "HH:MM" in 24h format 
  closeTime?: string; // Format: "HH:MM" in 24h format
  isClosed?: boolean; // Override to mark as closed regardless of time
  closureTimestamp?: string; // Timestamp when isClosed was set to true
  coordinates?: {
    lat: number;
    lng: number;
  };
  timezone?: string; // Added timezone field
}

// Custom Modal component that's compatible with AddressAutofill
function ScheduleModal({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode 
}) {
  // Handle ESC key press to close the modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal content */}
      <div className="relative w-full max-w-lg max-h-[90vh] m-4 sm:m-6 overflow-auto bg-admin-card rounded-lg shadow-lg animate-in fade-in duration-200 border border-admin-border z-50">
        <div className="sticky top-0 flex items-center justify-between bg-admin-card border-b border-admin-border p-4 z-10">
          <h2 className="text-lg font-medium text-admin-foreground">{title}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 text-admin-muted-foreground hover:text-admin-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ScheduleClient() {
  const queryClient = useQueryClient();
  const [editingDay, setEditingDay] = useState<ScheduleDay | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Days of the week for display order
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // React Query hook for food truck data
  const { data: foodTruck, isLoading: isFoodTruckLoading, error: foodTruckError } = useQuery({
    queryKey: ['foodTruck'],
    queryFn: getFoodTruck
  });

  // Extract schedule data from food truck
  const scheduleData = getScheduleFromFoodTruck(foodTruck);
  const schedule = scheduleData.days || [];
  
  // State for schedule metadata (including primaryTimezone)
  const [scheduleTitle, setScheduleTitle] = useState(scheduleData.title || 'Weekly Schedule');
  const [scheduleDescription, setScheduleDescription] = useState(scheduleData.description || 'Find us at these locations throughout the week');
  const [primaryTimezone, setPrimaryTimezone] = useState((scheduleData as any)?.primaryTimezone || 'America/New_York');
  
  // Update local state when fetched data changes
  useEffect(() => {
      setScheduleTitle(scheduleData.title || 'Weekly Schedule');
      setScheduleDescription(scheduleData.description || 'Find us at these locations throughout the week');
      setPrimaryTimezone((scheduleData as any)?.primaryTimezone || 'America/New_York');
  }, [scheduleData.title, scheduleData.description, (scheduleData as any)?.primaryTimezone]);

  const primaryColor = scheduleData.primaryColor || '#FF6B35';

  // Create a map of days that have schedules for quick lookup
  const scheduledDaysMap = new Map(schedule.map((day: ScheduleDay) => [day.day, day]));

  // Update schedule mutation (add primaryTimezone to parameters)
  const updateScheduleMutation = useMutation({
    mutationFn: ({
      scheduleData, 
      scheduleTitle, 
      scheduleDescription,
      primaryTimezone // Add primaryTimezone parameter
    }: {
      scheduleData: ScheduleDay[],
      scheduleTitle?: string,
      scheduleDescription?: string,
      primaryTimezone?: string // Add primaryTimezone type
    }) => updateSchedule(scheduleData, scheduleTitle, scheduleDescription, primaryTimezone), // Pass to action
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodTruck'] });
      toast.success('Schedule updated successfully');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Error updating schedule: ${error.message || 'Unknown error'}`);
      setError(error.message || 'An unknown error occurred');
    }
  });

  // Handle saving the schedule metadata (title, description, primaryTimezone)
  const handleSaveMetadata = async () => {
    updateScheduleMutation.mutate({
      scheduleData: schedule,
      scheduleTitle,
      scheduleDescription,
      primaryTimezone // Include primaryTimezone
    });
  };

  // Effect to set default timezone when modal opens
  useEffect(() => {
    if (isModalOpen && editingDay) {
      let defaultTimezone = '';
      
      // Priority 1: Existing timezone for the day being edited
      if (editingDay.timezone) {
        defaultTimezone = editingDay.timezone;
      } 
      // Priority 2: For new entries, check other existing schedule days
      else if (editingIndex === null && schedule && schedule.length > 0) {
        const firstExistingTimezone = schedule.find((day: ScheduleDay) => day.timezone)?.timezone;
        if (firstExistingTimezone) {
          defaultTimezone = firstExistingTimezone;
        }
      }
      
      // Priority 3: Browser's timezone (if needed and not already set)
      if (!defaultTimezone) {
        try {
          defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          // Ensure the browser timezone is one of the common ones, otherwise fallback
          if (!commonTimezones.includes(defaultTimezone)) {
            defaultTimezone = 'America/New_York'; // Fallback or leave empty? Let's fallback for now.
          }
        } catch (e) {
          console.error("Could not detect browser timezone:", e);
          defaultTimezone = 'America/New_York'; // Fallback on error
        }
      }
      
      // Set the default timezone in the editing state if it wasn't already set
      if (!editingDay.timezone) {
        setEditingDay(prev => prev ? { ...prev, timezone: defaultTimezone } : null);
      }
    }
  }, [isModalOpen, editingDay, editingIndex, schedule]); // Dependencies for default timezone logic

  const handleAddDay = () => {
    setEditingDay({
      day: daysOfWeek.find(day => !scheduledDaysMap.has(day)) || 'Monday',
      location: '',
      address: '',
      openTime: '11:00',
      closeTime: '14:00',
      isClosed: false,
      timezone: undefined // Initialize timezone as undefined
    });
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleEditDay = (group: ScheduleDay[], groupIndex: number) => {
    // When editing a group, we edit the first day in the group
    setEditingDay({ ...group[0] });
    // Store the index of the first day in the original schedule
    const originalIndex = schedule.findIndex((day: ScheduleDay) => day.day === group[0].day);
    setEditingIndex(originalIndex);
    setIsModalOpen(true);
  };

  const handleDeleteDay = async (group: ScheduleDay[]) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      const updatedSchedule = schedule.filter((day: ScheduleDay) => !group.some((groupDay: ScheduleDay) => groupDay.day === day.day));
      
      // Ensure metadata is passed correctly when deleting
      updateScheduleMutation.mutate({
        scheduleData: updatedSchedule,
        scheduleTitle, 
        scheduleDescription,
        primaryTimezone
      });
    }
  };

  const handleSaveDay = async () => {
    if (!editingDay) return;
    
    // Basic validation (ensure timezone is selected)
    if (!editingDay.timezone) {
      toast.error('Please select a timezone.');
      return; 
    }

    let updatedSchedule: ScheduleDay[];
    
    if (editingIndex !== null) {
      // Update existing day
      updatedSchedule = [...schedule];
      updatedSchedule[editingIndex] = editingDay;
    } else {
      // Add new day
      updatedSchedule = [...schedule, editingDay];
    }
    
    // Ensure metadata is passed correctly when saving a day
    updateScheduleMutation.mutate({
      scheduleData: updatedSchedule,
      scheduleTitle, 
      scheduleDescription,
      primaryTimezone
    });
  };

  const handleInputChange = (field: keyof ScheduleDay, value: string | boolean | undefined) => { // Allow undefined for timezone potentially
    if (!editingDay) return;
    setEditingDay({ ...editingDay, [field]: value });
  };

  // Handle timezone selection
  const handleTimezoneChange = (value: string) => {
    handleInputChange('timezone', value);
  };

  // Handle address selection from Mapbox AddressAutofill
  const handleAddressRetrieve = (res: AddressAutofillRetrieveResponse) => {
    if (!editingDay || !res.features || res.features.length === 0) return;
    
    const feature = res.features[0];
    const coordinates = feature.geometry.coordinates;
    
    // Mapbox returns coordinates as [longitude, latitude]
    const longitude = coordinates[0];
    const latitude = coordinates[1];
    
    // Update the editing day with address and coordinates
    setEditingDay({
      ...editingDay,
      address: feature.properties.place_name,
      coordinates: {
        lat: latitude,
        lng: longitude
      }
    });
  };

  // Group consecutive days at the same location
  const groupedScheduleDays: ScheduleDayGroup[] = (() => {
    const days = [...schedule];
    
    // Sort days by day of week
    days.sort((a, b) => {
      return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
    });
    
    // Group consecutive days at the same location
    const groups: ScheduleDayGroup[] = [];
    let currentGroup: ScheduleDay[] = [];
    
    days.forEach((day: ScheduleDay, index) => {
      if (index === 0) {
        currentGroup.push(day);
      } else {
        const prevDay = days[index - 1];
        const prevDayIndex = daysOfWeek.indexOf(prevDay.day);
        const currentDayIndex = daysOfWeek.indexOf(day.day);
        
        // Check if days are consecutive and at the same location
        const isConsecutive = (currentDayIndex === prevDayIndex + 1) || 
                             (prevDayIndex === 6 && currentDayIndex === 0); // Sunday to Monday
        const isSameLocation = day.location === prevDay.location && 
                              day.address === prevDay.address &&
                              day.openTime === prevDay.openTime &&
                              day.closeTime === prevDay.closeTime &&
                              day.isClosed === prevDay.isClosed;
        
        if (isConsecutive && isSameLocation) {
          currentGroup.push(day);
        } else {
          const firstDay = currentGroup[0];
          const lastDay = currentGroup[currentGroup.length - 1];
          const dayRange = currentGroup.length === 1 
            ? firstDay.day 
            : `${firstDay.day} - ${lastDay.day}`;
            
          groups.push({
            days: [...currentGroup],
            dayRange
          });
          currentGroup = [day];
        }
      }
    });
    
    if (currentGroup.length > 0) {
      const firstDay = currentGroup[0];
      const lastDay = currentGroup[currentGroup.length - 1];
      const dayRange = currentGroup.length === 1 
        ? firstDay.day 
        : `${firstDay.day} - ${lastDay.day}`;
        
      groups.push({
        days: [...currentGroup],
        dayRange
      });
    }
    
    return groups;
  })();

  const today = format(new Date(), 'EEEE');
  const todaySchedule = schedule.find((day: ScheduleDay) => day.day === today);

  // Generate the current week dates
  const currentWeekDates = useMemo(() => {
    // Get the current date
    const today = new Date();
    // Find the Monday of the current week (startOfWeek uses Sunday as first day by default, so we offset by 1)
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    
    // Create an array for all days of the week with their dates
    return daysOfWeek.map((dayName, index) => {
      const date = addDays(weekStart, index);
      return {
        dayName,
        date,
        dateString: format(date, 'MMM d')
      };
    });
  }, []);

  // Create a map for quickly finding schedules by day
  const scheduleByDay = useMemo(() => {
    const map = new Map();
    schedule.forEach((day: ScheduleDay) => {
      map.set(day.day, day);
    });
    return map;
  }, [schedule]);

  const handleAddNewSchedule = (dayName: string) => {
    setEditingDay({
      day: dayName,
      location: '',
      address: '',
      openTime: '11:00',
      closeTime: '14:00',
      isClosed: false
    });
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  // Show error when no data can be loaded
  if (!isFoodTruckLoading && foodTruckError) {
    return (
      <div className="space-y-6">
        <div className="bg-destructive/10 border border-destructive text-destructive-foreground px-4 py-3 rounded-md">
          <p className="font-semibold">Error loading schedule data</p>
          <p>{foodTruckError.message || 'Please try again later.'}</p>
        </div>
      </div>
    );
  }

  // Show loading spinner while initializing
  if (isFoodTruckLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive-foreground px-4 py-3 rounded-md relative flex items-center justify-between">
          <span className="block">{error}</span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setError(null)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="schedule-config" className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200 rounded-lg border-b-0">
          <AccordionTrigger className="px-6 py-4 rounded-t-lg text-admin-foreground hover:no-underline hover:bg-admin-accent/40">
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-2 text-admin-muted-foreground" />
              <span>Schedule Configuration</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="scheduleTitle" className="text-admin-foreground">Schedule Section Title</Label>
                <Input
                  id="scheduleTitle"
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  placeholder="Title for your schedule section"
                  className="mt-1 border-admin-input bg-admin-background text-admin-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="scheduleDescription" className="text-admin-foreground">Schedule Description</Label>
                <Textarea
                  id="scheduleDescription"
                  value={scheduleDescription}
                  onChange={(e) => setScheduleDescription(e.target.value)}
                  placeholder="Description for your schedule section"
                  className="mt-1 border-admin-input bg-admin-background text-admin-foreground"
                />
              </div>

              <div>
                <Label htmlFor="primaryTimezone" className="text-admin-foreground">Primary Operating Timezone</Label>
                <Select
                  value={primaryTimezone}
                  onValueChange={setPrimaryTimezone}
                >
                  <SelectTrigger id="primaryTimezone" className="mt-1 border-admin-input bg-admin-background text-admin-foreground">
                    <SelectValue placeholder="Select primary timezone..." />
                  </SelectTrigger>
                  <SelectContent className="bg-admin-popover text-admin-popover-foreground border-admin-border">
                    {commonTimezones.map(tz => (
                      <SelectItem key={tz} value={tz} className="text-admin-foreground focus:bg-admin-accent focus:text-admin-accent-foreground">
                        {tz.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-admin-muted-foreground mt-1">
                  Used to determine "Today" for status updates and as a default for new entries.
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveMetadata}
                  disabled={updateScheduleMutation.isPending}
                  size="sm"
                  className="bg-admin-primary text-admin-primary-foreground hover:bg-admin-primary/90"
                >
                  {updateScheduleMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Schedule Management UI */}
      <Card className="border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
          <div>
            <CardTitle className="text-admin-card-foreground text-xl mb-1">Weekly Schedule</CardTitle>
            <CardDescription className="text-admin-muted-foreground max-w-[280px] sm:max-w-none">
              {todaySchedule 
                ? todaySchedule.isClosed
                  ? `Today (${today}): ${todaySchedule.location} - Manually Closed`
                  : `Today (${today}): ${todaySchedule.location} - ${
                      (todaySchedule.openTime && todaySchedule.closeTime) 
                        ? formatTimeRange(todaySchedule.openTime, todaySchedule.closeTime)
                        : 'No hours set'
                    }`
                : `No schedule for today (${today})`}
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            onClick={handleAddDay} 
            className="flex items-center gap-1 bg-gradient-to-r from-admin-primary to-[hsl(var(--admin-gradient-end))] text-white hover:opacity-90 mt-2 sm:mt-0 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Schedule</span>
          </Button>
        </CardHeader>
        <CardContent>
          {isFoodTruckLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary"></div>
            </div>
          ) : (
            <>
              {/* Mobile view - vertical layout */}
              <div className="md:hidden grid grid-cols-1 gap-4">
                {currentWeekDates.map((dayInfo, index) => {
                  const scheduleForDay = scheduleByDay.get(dayInfo.dayName);
                  return (
                    <AdminScheduleCard
                      key={index}
                      dayInfo={dayInfo}
                      scheduleForDay={scheduleForDay}
                      onEdit={handleEditDay}
                      onDelete={handleDeleteDay}
                      onAddNew={handleAddNewSchedule}
                      isCompact
                    />
                  );
                })}
              </div>

              {/* Desktop view - grid layout */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentWeekDates.map((dayInfo, index) => {
                  const scheduleForDay = scheduleByDay.get(dayInfo.dayName);
                  return (
                    <AdminScheduleCard
                      key={index}
                      dayInfo={dayInfo}
                      scheduleForDay={scheduleForDay}
                      onEdit={handleEditDay}
                      onDelete={handleDeleteDay}
                      onAddNew={handleAddNewSchedule}
                    />
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Schedule Form Modal */}
      <ScheduleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingIndex !== null ? 'Edit Schedule' : 'Add Schedule'}
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="day" className="text-admin-foreground">Day</Label>
            <Select
              value={editingDay?.day || ''}
              onValueChange={(value) => handleInputChange('day', value)}
            >
              <SelectTrigger className="border-admin-input bg-admin-background text-admin-foreground">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent className="bg-admin-popover text-admin-popover-foreground border-admin-border">
                {daysOfWeek.map((day: string) => (
                  <SelectItem key={day} value={day} className="text-admin-foreground focus:bg-admin-accent focus:text-admin-accent-foreground">{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="location" className="text-admin-foreground">Location</Label>
            <Input
              id="location"
              value={editingDay?.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Downtown, Food Truck Park, etc."
              className="border-admin-input bg-admin-background text-admin-foreground"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="address" className="text-admin-foreground">Address</Label>
            <AddressAutofillInput
              id="address"
              value={editingDay?.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              onRetrieve={handleAddressRetrieve}
              placeholder="Enter address"
            />
            {editingDay?.coordinates && (
              <p className="text-xs text-admin-muted-foreground">
                Coordinates saved: {editingDay.coordinates.lat.toFixed(6)}, {editingDay.coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="openTime" className="text-admin-foreground">Open Time</Label>
              <Input
                id="openTime"
                type="time"
                value={editingDay?.openTime || ''}
                onChange={(e) => handleInputChange('openTime', e.target.value)}
                className="border-admin-input bg-admin-background text-admin-foreground"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="closeTime" className="text-admin-foreground">Close Time</Label>
              <Input
                id="closeTime"
                type="time"
                value={editingDay?.closeTime || ''}
                onChange={(e) => handleInputChange('closeTime', e.target.value)}
                className="border-admin-input bg-admin-background text-admin-foreground"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="timezone"><Globe className="inline-block h-4 w-4 mr-1 mb-0.5 text-admin-muted-foreground"/> Timezone</Label>
            <Select
              value={editingDay?.timezone || ''}
              onValueChange={handleTimezoneChange}
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone..." />
              </SelectTrigger>
              <SelectContent>
                {commonTimezones.map(tz => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')} 
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={() => setIsModalOpen(false)}
            className="border-admin-border text-admin-foreground hover:bg-admin-accent/50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveDay} 
            disabled={updateScheduleMutation.isPending}
            className="bg-gradient-to-r from-admin-primary to-[hsl(var(--admin-gradient-end))] text-white hover:opacity-90"
          >
            {updateScheduleMutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </ScheduleModal>
    </div>
  );
} 