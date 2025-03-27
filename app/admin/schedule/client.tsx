'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Edit, Trash2, Plus, Calendar, MapPin, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import FoodTruckSchedule from '@/components/FoodTruckTemplate/FoodTruckSchedule';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { formatTimeRange } from '@/lib/schedule-utils';
import type { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';
import AddressAutofillInput from '@/components/AddressAutofillInput';
import { ScheduleCard, ScheduleDayGroup } from '@/components/ui/schedule-card';

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

interface ScheduleClientProps {
  initialSchedule: ScheduleDay[];
  onUpdateSchedule: (schedule: ScheduleDay[], title?: string, description?: string) => Promise<any>;
  primaryColor?: string;
  scheduleTitle?: string;
  scheduleDescription?: string;
}

export function ScheduleClient({
  initialSchedule,
  onUpdateSchedule,
  primaryColor = '#FF6B35',
  scheduleTitle = 'Weekly Schedule',
  scheduleDescription = 'Find us at these locations throughout the week'
}: ScheduleClientProps) {
  const [title, setTitle] = useState(scheduleTitle);
  const [description, setDescription] = useState(scheduleDescription);
  const [isSaving, setIsSaving] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleDay[]>(initialSchedule);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDay, setEditingDay] = useState<ScheduleDay | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Days of the week for display order
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Create a map of days that have schedules for quick lookup
  const scheduledDaysMap = new Map(schedule.map(day => [day.day, day]));

  // Handle saving the schedule metadata (title and description)
  const handleSaveMetadata = async () => {
    try {
      setIsSaving(true);
      await onUpdateSchedule(schedule, title, description);
      toast.success('Schedule metadata updated successfully');
    } catch (error) {
      console.error('Error updating schedule metadata:', error);
      toast.error('Failed to update schedule metadata');
    } finally {
      setIsSaving(false);
    }
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
    const originalIndex = schedule.findIndex(day => day.day === group[0].day);
    setEditingIndex(originalIndex);
    setIsEditing(true);
  };

  const handleDeleteDay = async (group: ScheduleDay[]) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      const updatedSchedule = schedule.filter(day => !group.some(groupDay => groupDay.day === day.day));
      setSchedule(updatedSchedule);
      try {
        setIsLoading(true);
        await onUpdateSchedule(updatedSchedule, title, description);
      } catch (error) {
        console.error('Error updating schedule:', error);
      } finally {
        setIsLoading(false);
      }
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
    
    try {
      setIsLoading(true);
      await onUpdateSchedule(updatedSchedule, title, description);
      setSchedule(updatedSchedule);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating schedule:', error);
    } finally {
      setIsLoading(false);
    }
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
    
    days.forEach((day, index) => {
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

  // Create config object for FoodTruckSchedule
  const scheduleConfig = {
    schedule: {
      title,
      description,
      days: schedule
    },
    primaryColor,
    secondaryColor: primaryColor // We can derive secondaryColor from primaryColor
  };

  const today = format(new Date(), 'EEEE');
  const todaySchedule = schedule.find(day => day.day === today);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="scheduleTitle">Schedule Section Title</Label>
          <Input
            id="scheduleTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title for your schedule section"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="scheduleDescription">Schedule Description</Label>
          <Textarea
            id="scheduleDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description for your schedule section"
            className="mt-1"
          />
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={handleSaveMetadata}
            disabled={isSaving}
            size="sm"
          >
            {isSaving ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Metadata
              </>
            )}
          </Button>
        </div>
      </div>
      
      <Separator />

      {/* Schedule Management UI */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Weekly Schedule</h2>
            <p className="text-sm text-muted-foreground">
              {todaySchedule 
                ? todaySchedule.isClosed
                  ? `Today (${today}): ${todaySchedule.location} - Manually Closed`
                  : `Today (${today}): ${todaySchedule.location} - ${
                      (todaySchedule.openTime && todaySchedule.closeTime) 
                        ? formatTimeRange(todaySchedule.openTime, todaySchedule.closeTime)
                        : 'No hours set'
                    }`
                : `No schedule for today (${today})`}
            </p>
          </div>
          <Button size="sm" onClick={handleAddDay} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>Add Schedule</span>
          </Button>
        </div>

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
                        {daysOfWeek.map((day) => (
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
                  <Button onClick={handleSaveDay} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
      </div>
    </div>
  );
} 