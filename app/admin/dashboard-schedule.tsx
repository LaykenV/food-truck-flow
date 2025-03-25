'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Plus, Edit, Trash2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Switch } from '../../components/ui/switch';
import { formatTimeRange } from '@/lib/schedule-utils';

interface ScheduleDay {
  day: string;
  location?: string;
  address?: string;
  hours?: string;
  openTime?: string; // Format: "HH:MM" in 24h format 
  closeTime?: string; // Format: "HH:MM" in 24h format
  isClosed?: boolean; // Override to mark as closed regardless of time
  closureTimestamp?: string; // Timestamp when isClosed was set to true
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface DashboardScheduleProps {
  initialSchedule: ScheduleDay[];
  onUpdateSchedule: (schedule: ScheduleDay[]) => Promise<any>;
  primaryColor?: string;
}

export function DashboardSchedule({ initialSchedule, onUpdateSchedule, primaryColor = '#FF6B35' }: DashboardScheduleProps) {
  const [schedule, setSchedule] = useState<ScheduleDay[]>(initialSchedule);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDay, setEditingDay] = useState<ScheduleDay | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Days of the week for display order
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Group consecutive days at the same location
  const groupedScheduleDays = (() => {
    const days = [...schedule];
    
    // Sort days by day of week
    days.sort((a, b) => {
      return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
    });
    
    // Group consecutive days at the same location
    const groups: ScheduleDay[][] = [];
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
          groups.push([...currentGroup]);
          currentGroup = [day];
        }
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  })();

  // Create a map of days that have schedules for quick lookup
  const scheduledDaysMap = new Map(schedule.map(day => [day.day, day]));

  const handleAddDay = () => {
    setEditingDay({
      day: daysOfWeek.find(day => !scheduledDaysMap.has(day)) || 'Monday',
      location: '',
      address: '',
      openTime: '11:00',
      closeTime: '14:00',
      isClosed: false // Always false by default
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
        await onUpdateSchedule(updatedSchedule);
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
      await onUpdateSchedule(updatedSchedule);
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
    // Always set isClosed to false regardless of attempted changes
    if (field === 'isClosed') {
      setEditingDay({ ...editingDay, isClosed: false });
    } else {
      setEditingDay({ ...editingDay, [field]: value });
    }
  };

  const today = format(new Date(), 'EEEE');
  const todaySchedule = schedule.find(day => day.day === today);

  return (
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
          <span className="hidden sm:inline">Add Schedule</span>
        </Button>
      </div>

      {/* Mobile view - horizontal scrolling */}
      <div className="md:hidden">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4 p-1">
            {groupedScheduleDays.map((group, groupIndex) => {
              const firstDay = group[0];
              const lastDay = group[group.length - 1];
              const dayRange = group.length === 1 
                ? firstDay.day 
                : `${firstDay.day} - ${lastDay.day}`;
                
              return (
                <Card key={groupIndex} className="min-w-[260px] border-l-4" style={{ borderLeftColor: primaryColor }}>
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                          <h3 className="font-medium text-sm">{dayRange}</h3>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditDay(group, groupIndex)} className="h-6 w-6">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteDay(group)} className="h-6 w-6 text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1 mt-1">
                        {firstDay.isClosed ? (
                          <div className="flex items-center text-destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            <p className="text-xs font-medium">Closed</p>
                          </div>
                        ) : (
                          <>
                            {firstDay.location && (
                              <p className="text-sm font-medium">{firstDay.location}</p>
                            )}
                            {firstDay.address && (
                              <div className="flex items-start">
                                <MapPin className="h-3 w-3 text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-600">{firstDay.address}</p>
                              </div>
                            )}
                            {(firstDay.openTime && firstDay.closeTime) && (
                              <div className="flex items-start">
                                <Clock className="h-3 w-3 text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-600">{formatTimeRange(firstDay.openTime, firstDay.closeTime)}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Desktop view - grid layout */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groupedScheduleDays.map((group, groupIndex) => {
          const firstDay = group[0];
          const lastDay = group[group.length - 1];
          const dayRange = group.length === 1 
            ? firstDay.day 
            : `${firstDay.day} - ${lastDay.day}`;
            
          return (
            <Card key={groupIndex} className="border-l-4" style={{ borderLeftColor: primaryColor }}>
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
                      <h3 className="font-medium">{dayRange}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditDay(group, groupIndex)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDay(group)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {firstDay.isClosed ? (
                      <div className="flex items-center text-destructive">
                        <XCircle className="h-4 w-4 mr-1" />
                        <p className="text-sm font-medium">Closed</p>
                      </div>
                    ) : (
                      <>
                        {firstDay.location && (
                          <p className="font-medium">{firstDay.location}</p>
                        )}
                        {firstDay.address && (
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1 mt-1 flex-shrink-0" />
                            <p className="text-sm text-gray-600">{firstDay.address}</p>
                          </div>
                        )}
                        {(firstDay.openTime && firstDay.closeTime) && (
                          <div className="flex items-start">
                            <Clock className="h-4 w-4 text-gray-400 mr-1 mt-1 flex-shrink-0" />
                            <p className="text-sm text-gray-600">{formatTimeRange(firstDay.openTime, firstDay.closeTime)}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit/Add Schedule Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit Schedule' : 'Add Schedule'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
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
              <Input
                id="address"
                value={editingDay?.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main St, City, State"
              />
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
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSaveDay} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 