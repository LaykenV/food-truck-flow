# Implementation Plan for Structured Schedule Time Fields

## Current Implementation
- Schedule uses a string-based `hours` field (e.g., "11:00 AM - 2:00 PM")
- Manual string parsing in `page.tsx` to determine open/closed status
- Simple text display in `FoodTruckSchedule.tsx`

## Proposed Changes

### 1. Update FoodTruckConfig Type
```typescript
schedule?: {
  title?: string;
  description?: string;
  days?: {
    day: string;
    location?: string;
    address?: string;
    openTime?: string; // Format: "HH:MM" in 24h format 
    closeTime?: string; // Format: "HH:MM" in 24h format
    isClosed?: boolean; // Override to mark as closed regardless of time
    coordinates?: {
      lat: number;
      lng: number;
    };
  }[];
}
```

### 2. Update Default Configuration
Modify the default configuration generator to include new structured time fields with reasonable defaults.

### 3. Update Schedule Admin UI (admin/schedule/client.tsx)
- Replace text input with time pickers for openTime and closeTime
- Add a toggle for the isClosed override
- Ensure proper validation and intuitive UI

### 4. Update Dashboard (admin/page.tsx)
- Revise open/closed logic to use structured time fields
- Add a prominent "Close for Today" button that:
  - Only appears when the truck is currently open
  - Sets isClosed to true for today's schedule entry
  - Includes a confirmation dialog
  - Provides visual feedback when activated
- Add ability to "Reopen" if manually closed

### 5. Update FoodTruckSchedule Component
- Display formatted open/close times from structured data
- Add clear visual indication when a day is manually marked as closed
- Handle time formatting in a user-friendly way

### 6. Improve Open/Closed Status Logic
- Create a utility function to determine open/closed status
- Handle edge cases like overnight hours (when close time is earlier than open time)
- Prioritize the isClosed flag over time-based determination

## Implementation Priority
1. Update FoodTruckConfig type definition
2. Update default configurations
3. Implement admin schedule editing UI
4. Create utility functions for time handling
5. Update dashboard with close/reopen functionality
6. Update public-facing schedule component
