'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, XCircle, Edit, Trash2, PlusCircle } from 'lucide-react';
import { formatTimeRange } from '@/lib/schedule-utils';
import { isSameDay } from 'date-fns';

interface ScheduleDay {
  day: string;
  location?: string;
  address?: string;
  openTime?: string;
  closeTime?: string;
  isClosed?: boolean;
  timezone?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface DayInfo {
  dayName: string;
  date: Date;
  dateString: string;
}

interface AdminScheduleCardProps {
  dayInfo: DayInfo;
  scheduleForDay: ScheduleDay | undefined;
  onEdit: (schedule: ScheduleDay[], groupIndex: number) => void;
  onDelete: (schedule: ScheduleDay[]) => void;
  onAddNew: (dayName: string) => void;
  isCompact?: boolean;
}

export function AdminScheduleCard({
  dayInfo,
  scheduleForDay,
  onEdit,
  onDelete,
  onAddNew,
  isCompact = false
}: AdminScheduleCardProps) {
  const isToday = isSameDay(dayInfo.date, new Date());
  
  return (
    <Card 
      className={`h-full border ${isToday ? 'border-admin-primary border-2' : 'border-admin-border'} bg-admin-card hover:shadow-md transition-all duration-200 rounded-lg`}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <CardTitle className={`text-base sm:text-lg font-medium ${isToday ? 'text-admin-primary' : 'text-admin-foreground'} break-words`}>
              {dayInfo.dayName}
            </CardTitle>
            <CardDescription className="text-admin-muted-foreground text-xs sm:text-sm">
              {dayInfo.dateString} {isToday && '(Today)'}
            </CardDescription>
          </div>
          {scheduleForDay && (
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onEdit([scheduleForDay], 0)}
                className="h-8 w-8 bg-admin-background/80 backdrop-blur-sm hover:bg-admin-primary/20 text-admin-foreground"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDelete([scheduleForDay])}
                className="h-8 w-8 text-destructive bg-admin-background/80 backdrop-blur-sm hover:bg-destructive/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={`p-4 ${isCompact ? 'pt-2' : ''}`}>
        {scheduleForDay ? (
          <div>
            {scheduleForDay.isClosed ? (
              <div className="flex items-center text-destructive">
                <XCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="font-medium">Closed</span>
              </div>
            ) : (
              <>
                <div className="flex items-start mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-admin-primary mt-0.5 flex-shrink-0" />
                  <span className="font-medium break-words">{scheduleForDay.location || 'Location TBD'}</span>
                </div>
                {(scheduleForDay.openTime && scheduleForDay.closeTime) && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-admin-muted-foreground flex-shrink-0" />
                    <span className="text-admin-muted-foreground">
                      {formatTimeRange(scheduleForDay.openTime, scheduleForDay.closeTime)}
                    </span>
                  </div>
                )}
                {scheduleForDay.address && (
                  <p className="mt-2 text-sm text-admin-muted-foreground break-words">
                    {scheduleForDay.address}
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[120px] text-admin-muted-foreground">
            <Calendar className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">No schedule set</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddNew(dayInfo.dayName)}
              className="mt-2 h-8 hover:bg-admin-primary/20 text-admin-primary"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Add Schedule</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 