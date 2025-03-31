'use client';

import { createClient } from '@/utils/supabase/client'
import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Edit, Trash2, Plus, Calendar, MapPin, Clock, XCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { formatTimeRange } from '@/lib/schedule-utils';
import type { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';
import AddressAutofillInput from '@/components/AddressAutofillInput';
import { ScheduleCard, ScheduleDayGroup } from '@/components/ui/schedule-card';
import { updateSchedule } from './actions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFoodTruck, getScheduleFromFoodTruck } from '@/app/admin/clientQueries';

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
}

export default function ScheduleClient() {
  const queryClient = useQueryClient();
  const [editingDay, setEditingDay] = useState<ScheduleDay | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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
  const title = scheduleData.title || 'Weekly Schedule';
  const description = scheduleData.description || 'Find us at these locations throughout the week';
  const primaryColor = scheduleData.primaryColor || '#FF6B35';

  // Create a map of days that have schedules for quick lookup
  const scheduledDaysMap = new Map(schedule.map((day: ScheduleDay) => [day.day, day]));

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: ({
      scheduleData, 
      scheduleTitle, 
      scheduleDescription
    }: {
      scheduleData: ScheduleDay[],
      scheduleTitle?: string,
      scheduleDescription?: string
    }) => updateSchedule(scheduleData, scheduleTitle, scheduleDescription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodTruck'] });
      toast.success('Schedule updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating schedule: ${error.message || 'Unknown error'}`);
      setError(error.message || 'An unknown error occurred');
    }
  });

  // Handle saving the schedule metadata (title and description)
  const handleSaveMetadata = async () => {
    updateScheduleMutation.mutate({
      scheduleData: schedule,
      scheduleTitle: title,
      scheduleDescription: description
    });
  };

  const handleAddDay = () => {
    setEditingDay({
      day: daysOfWeek.find(day => !scheduledDaysMap.has(day)) || 'Monday',
      location: '',
      address: '',
      openTime: '11:00',
      closeTime: '14:00',
      isClosed: false
    });
    setEditingIndex(null);
    setIsEditing(true);
  };

  const handleEditDay = (group: ScheduleDay[], groupIndex: number) => {
    // When editing a group, we edit the first day in the group
    setEditingDay({ ...group[0] });
    // Store the index of the first day in the original schedule
    const originalIndex = schedule.findIndex((day: ScheduleDay) => day.day === group[0].day);
    setEditingIndex(originalIndex);
    setIsEditing(true);
  };

  const handleDeleteDay = async (group: ScheduleDay[]) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      const updatedSchedule = schedule.filter((day: ScheduleDay) => !group.some((groupDay: ScheduleDay) => groupDay.day === day.day));
      
      updateScheduleMutation.mutate({
        scheduleData: updatedSchedule,
        scheduleTitle: title,
        scheduleDescription: description
      });
    }
  };

  const handleSaveDay = async () => {
    if (!editingDay) return;
    
    let updatedSchedule: ScheduleDay[];
    
    if (editingIndex !== null) {
      // Update existing day
      updatedSchedule = [...schedule];
      updatedSchedule[editingIndex] = editingDay;
    } else {
      // Add new day
      updatedSchedule = [...schedule, editingDay];
    }
    
    updateScheduleMutation.mutate({
      scheduleData: updatedSchedule,
      scheduleTitle: title,
      scheduleDescription: description
    });

    setIsEditing(false);
  };

  const handleInputChange = (field: keyof ScheduleDay, value: string | boolean) => {
    if (!editingDay) return;
    setEditingDay({ ...editingDay, [field]: value });
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

  // Show error when no data can be loaded
  if (!isFoodTruckLoading && foodTruckError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center justify-between">
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
      
      <Card>
        <CardHeader>
          <CardTitle>Schedule Configuration</CardTitle>
          <CardDescription>
            Set the title and description for your schedule section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="scheduleTitle">Schedule Section Title</Label>
            <Input
              id="scheduleTitle"
              value={title}
              onChange={(e) => updateScheduleMutation.mutate({
                scheduleData: schedule,
                scheduleTitle: e.target.value,
                scheduleDescription: description
              })}
              placeholder="Title for your schedule section"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="scheduleDescription">Schedule Description</Label>
            <Textarea
              id="scheduleDescription"
              value={description}
              onChange={(e) => updateScheduleMutation.mutate({
                scheduleData: schedule,
                scheduleTitle: title,
                scheduleDescription: e.target.value
              })}
              placeholder="Description for your schedule section"
              className="mt-1"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleSaveMetadata}
            disabled={updateScheduleMutation.isPending}
            size="sm"
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
        </CardFooter>
      </Card>
      
      <Separator />

      {/* Schedule Management UI */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>
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
          <Button size="sm" onClick={handleAddDay} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>Add Schedule</span>
          </Button>
        </CardHeader>
        <CardContent>
          {/* Inline Edit Form - Only show when editing */}
          {isEditing && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{editingIndex !== null ? 'Edit Schedule' : 'Add Schedule'}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label htmlFor="day">Day</Label>
                      <Select
                        value={editingDay?.day || ''}
                        onValueChange={(value) => handleInputChange('day', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map((day: string) => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={editingDay?.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Downtown, Food Truck Park, etc."
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <AddressAutofillInput
                        id="address"
                        value={editingDay?.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        onRetrieve={handleAddressRetrieve}
                        placeholder="Enter address"
                      />
                      {editingDay?.coordinates && (
                        <p className="text-xs text-muted-foreground">
                          Coordinates saved: {editingDay.coordinates.lat.toFixed(6)}, {editingDay.coordinates.lng.toFixed(6)}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="openTime">Open Time</Label>
                        <Input
                          id="openTime"
                          type="time"
                          value={editingDay?.openTime || ''}
                          onChange={(e) => handleInputChange('openTime', e.target.value)}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="closeTime">Close Time</Label>
                        <Input
                          id="closeTime"
                          type="time"
                          value={editingDay?.closeTime || ''}
                          onChange={(e) => handleInputChange('closeTime', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button onClick={handleSaveDay} disabled={updateScheduleMutation.isPending}>
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
                </div>
              </CardContent>
            </Card>
          )}

          {isFoodTruckLoading && !isEditing ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : schedule.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-2">No schedule items yet</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleAddDay}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Schedule
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile view - horizontal scrolling */}
              <div className="md:hidden">
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex space-x-3 p-1">
                    {groupedScheduleDays.map((group, groupIndex) => (
                      <div key={groupIndex} className="relative min-w-[260px]">
                        <ScheduleCard 
                          group={group}
                          primaryColor={primaryColor}
                          secondaryColor={primaryColor}
                          className="border-l-4"
                        />
                        <div className="absolute top-2 right-2 flex space-x-1 z-10">
                          <Button variant="ghost" size="icon" onClick={() => handleEditDay(group.days, groupIndex)} className="h-6 w-6 bg-background/80 backdrop-blur-sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteDay(group.days)} className="h-6 w-6 text-destructive bg-background/80 backdrop-blur-sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>

              {/* Desktop view - grid layout */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedScheduleDays.map((group, groupIndex) => (
                  <div key={groupIndex} className="relative">
                    <ScheduleCard 
                      group={group}
                      primaryColor={primaryColor}
                      secondaryColor={primaryColor}
                      className="border-l-4"
                    />
                    <div className="absolute top-3 right-3 flex space-x-1 z-10">
                      <Button variant="ghost" size="icon" onClick={() => handleEditDay(group.days, groupIndex)} className="bg-background/80 backdrop-blur-sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDay(group.days)} className="text-destructive bg-background/80 backdrop-blur-sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 