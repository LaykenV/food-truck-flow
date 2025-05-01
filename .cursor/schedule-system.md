# Food Truck Flow Schedule System

This document explains how the schedule management system works in Food Truck Flow, providing guidance for developers working with the schedule-related components and functionality.

## Overview

The schedule system in Food Truck Flow allows food truck owners to manage when and where their food truck will be operating. It includes both admin management interfaces and public-facing display components.

## Data Structure

Schedule information is stored in the `schedule` field of the food truck configuration as a JSON object:

```typescript
schedule?: {
  title?: string;
  description?: string;
  days?: {
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
  }[];
}
```

Key fields:
- `title`: Title for the schedule section (default: "Find Our Truck")
- `description`: Description text for the schedule section (default: "Check out our weekly schedule and locations")
- `days`: Array of schedule day objects with the following properties:
  - `day`: Day of the week (e.g., "Monday", "Tuesday", etc.)
  - `location`: Name of the location (e.g., "Downtown", "Food Truck Park")
  - `address`: Physical address for mapping
  - `openTime`: Opening time in 24-hour format (e.g., "11:00")
  - `closeTime`: Closing time in 24-hour format (e.g., "20:00")
  - `isClosed`: Boolean flag to manually mark a day as closed
  - `coordinates`: Latitude/longitude object for precise mapping
  - `closureTimestamp`: Timestamp when day was manually closed (for tracking purposes)

## Admin Interface Components

### Dashboard Schedule Card

Located on the admin dashboard, this card shows today's schedule information and provides quick actions:

```typescript
// Located in app/admin/page.tsx
<Card>
  <CardHeader>
    <CardTitle>Today's Schedule</CardTitle>
    <CardDescription>Your location and hours for {today}</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Schedule display and action buttons */}
  </CardContent>
</Card>
```

Features:
- Shows today's location and hours
- Real-time open/closed status indicator
- Quick actions to close or reopen for the day
- Link to full schedule management

### Schedule Management Page

A dedicated page for comprehensive schedule management:

```typescript
// Located in app/admin/schedule/page.tsx
export default function SchedulePage() {
  // Schedule management interface
}
```

Features:
- Full week view of schedule
- Add, edit, and delete schedule entries
- Set location, address, and hours for each day
- Batch edit functionality for multiple days
- Manual closure controls

### Helper Components

Several components handle specific aspects of schedule display and interaction:

- `FormattedTimeDisplay`: Formats opening and closing times in a user-friendly way
- `TimeAvailabilityDisplay`: Shows when the truck will open or close based on current time
- `StatusIndicator`: Visual indicator of current operating status (open/closed)
- `CloseForTodayDialog`: Confirmation dialog for manually closing operations

## Server Actions

The system includes server actions to handle schedule operations:

```typescript
// Example server action to reopen a day
export async function reopenToday() {
  'use server'
  // Implementation details
}

// Example server action to reset outdated closures
export async function resetOutdatedClosures(foodTruck: any) {
  'use server'
  // Implementation details
}
```

Key actions:
- `reopenToday`: Removes the manual closure for the current day
- `resetOutdatedClosures`: Automatically removes closure flags from past days

## Public-Facing Display

The public food truck website displays the schedule in a user-friendly format:

```typescript
// Located in components/FoodTruckTemplate/FoodTruckSchedule.tsx
export default function FoodTruckSchedule({ config, displayMode }: FoodTruckScheduleProps) {
  // Schedule display implementation
}
```

Features:
- Responsive layout for all device sizes
- Mobile-optimized side-scrolling interface with snap points
- Automatic grouping of consecutive days at the same location
- Map integration for location visualization
- Clear indicators for closed days
- Sorted by day of week for intuitive navigation

## Utility Functions

The system includes utility functions for schedule-related operations:

### Client-Side Utilities

```typescript
// Located in lib/schedule-utils.ts
export function isScheduledOpen(scheduleDay: ScheduleDay | undefined): boolean {
  // Implementation details
}

export function getTodaySchedule(scheduleDays: ScheduleDay[]): ScheduleDay | undefined {
  // Implementation details
}

export function formatTimeRange(openTime: string, closeTime: string): string {
  // Implementation details
}
```

### Server-Side Utilities

```typescript
// Located in lib/schedule-utils-server.ts
export function isScheduledOpenServer(scheduleDay: ScheduleDay | undefined): boolean {
  // Implementation details
}

export function getTodayScheduleServer(scheduleDays: ScheduleDay[]): ScheduleDay | undefined {
  // Implementation details
}
```

These utilities handle:
- Determining if a food truck is currently open based on schedule
- Finding today's schedule from the array of schedule days
- Formatting time ranges in a user-friendly way
- Ensuring consistent behavior between server and client rendering

## Time Handling

The system handles various time-related scenarios:

1. **Regular Hours**: When closing time is after opening time on the same day
2. **Overnight Hours**: When closing time is earlier than opening time (e.g., 8:00 PM to 2:00 AM)
3. **Manual Closures**: Overriding normal hours with the `isClosed` flag
4. **Missing Schedule**: Handling days without schedule information

## Schedule Status Flow

The logic for determining if a food truck is currently open follows this process:

1. Check if today's schedule exists
2. Check if today is manually marked as closed (`isClosed: true`)
3. If not manually closed, check if current time falls within operating hours
4. Handle special case for overnight hours (when close time is earlier than open time)
5. Return appropriate open/closed status

## Integration with Other Systems

The schedule system integrates with:

1. **Map System**: Displaying location information on interactive maps
2. **Order System**: Determining if orders can be accepted based on operating status
3. **Dashboard Analytics**: Providing context for sales and traffic data

## Best Practices

### Adding New Schedule Features

1. Update the schedule data structure in the food truck configuration type
2. Modify the schedule management interface to include the new features
3. Update the public-facing display component to show the new information
4. Ensure both server and client utilities handle the new data correctly

### Performance Considerations

1. Group consecutive days with the same location to reduce visual clutter
2. Use efficient time comparisons for status determination
3. Implement automatic cleanup of outdated closures
4. Optimize map loading to reduce layout shifts

## Troubleshooting

Common issues and their solutions:

1. **Incorrect Open/Closed Status**: Ensure time formats are consistent (24-hour format required)
2. **Map Not Showing**: Verify address format and coordinates
3. **Manual Closure Not Working**: Check closureTimestamp format and reset routine
4. **Timezone Issues**: Verify server and client timezone handling is consistent