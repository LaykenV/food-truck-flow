# Food Truck Flow Template System

This document explains how the template and configuration system works in Food Truck Flow, providing guidance for developers working with the codebase.

## Current Implementation

### Configuration Model

The `FoodTruckConfig` type defines all customizable aspects of a food truck website:

```typescript
export type FoodTruckConfig = {
  hero?: {
    image?: string;
    title?: string;
    subtitle?: string;
  };
  logo?: string;
  name?: string;
  about?: {
    image?: string;
    title?: string;
    content?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
  };
  socials?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  schedule?: {
    title?: string;
    description?: string;
    days?: {
      day: string;
      location?: string;
      address?: string;
      hours?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    }[];
  };
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
  heroFont?: string;
};
```

This configuration is stored as a JSON object in the `configuration` field of the `FoodTrucks` table in the database.

### Template Components

The template system is built around modular components that render different sections of a food truck website based on the provided configuration.

#### Main Template Component

The main template component (`FoodTruckTemplate/index.tsx`) serves as the container for all section components:

```typescript
export interface FoodTruckTemplateProps {
  config: FoodTruckConfig;
  displayMode: DisplayMode;
  subdomain?: string;
}

export default function FoodTruckTemplate({ 
  config, 
  displayMode, 
  subdomain = 'preview' 
}: FoodTruckTemplateProps) {
  // Client-side state to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // ... rendering logic
}
```

The template handles client-side hydration to prevent mismatches between server and client rendering.

#### Section Components

The template is divided into modular section components:

1. **FoodTruckHero**: The hero section with background image, title, and subtitle
2. **FoodTruckAbout**: The about section with content and image
3. **FoodTruckSchedule**: The schedule section with weekly locations and hours
4. **FoodTruckContact**: The contact section with contact information and social links

Each section component follows a similar pattern, accepting the configuration and display mode as props.

### Display Modes

The template system supports two display modes:

```typescript
export type DisplayMode = 'live' | 'preview';
```

- **Live Mode**: Used when the website is served to actual visitors
- **Preview Mode**: Used in the admin dashboard and landing page demo for real-time editing

### Preview System

The `UnifiedLivePreview` component provides a real-time preview of the food truck website:

```typescript
interface UnifiedLivePreviewProps {
  mode: 'admin' | 'client';
  config?: FoodTruckConfig;
}
```

Key features of the preview system:

1. **Dual View Modes**: Toggle between mobile and desktop views
2. **Real-time Updates**: Changes to the configuration are reflected immediately
3. **Browser Chrome Simulation**: Mimics browser UI for realistic preview
4. **Admin vs Client Mode**: Different behaviors based on the context

The preview system is used in two main contexts:
- On the landing page as a demo for potential customers
- In the admin dashboard for food truck owners to edit their websites

### Subdomain Routing

The application uses Next.js dynamic routing to serve different food truck websites based on subdomains:

```typescript
// app/[subdomain]/page.tsx
export default async function FoodTruckPage({ params }: { params: { subdomain: string } }) {
  const { subdomain } = params;
  
  // Fetch the food truck configuration from the database
  // Render the template with the configuration
}
```

The system supports:
- Subdomains (e.g., `bobs-tacos.foodtruckflow.com`) for all users
- Custom domains with automatic SSL for Pro plan users

## Configuration Workflow

### Creating a New Food Truck Website

1. User signs up and provides basic information
2. System generates a default configuration
3. User customizes the configuration through the admin interface
4. Changes are saved to the database
5. The website is immediately available at the assigned subdomain

### Editing an Existing Website

1. User logs in to the admin dashboard
2. User makes changes to the configuration
3. Live preview shows changes in real-time
4. User saves changes
5. Changes are immediately reflected on the live website

## Integration with Other Systems

### Menu System

The template system will integrate with the menu system:

1. Menu items are stored in the `Menus` table in the database
2. The menu section will be added to the template in the future
3. Menu items are filtered by `food_truck_id`

### Schedule System

The template system includes a comprehensive schedule management system:

1. **Data Structure**: Schedule information is stored in the `schedule` field of the configuration
   - Title and description for the schedule section
   - Days array with detailed time and location information:
     - `day`: Day of the week
     - `location`: Name of the location
     - `address`: Physical address
     - `hours`: Display format of hours (e.g., "11:00 AM - 2:00 PM")
     - `openTime`: Structured opening time in 24h format (e.g., "11:00")
     - `closeTime`: Structured closing time in 24h format (e.g., "14:00")
     - `isClosed`: Override flag to manually mark a day as closed
     - `coordinates`: Latitude/longitude for map display

2. **Admin Interface**: Schedule management is handled through dedicated components
   - Dedicated `/admin/schedule` page for comprehensive schedule management
   - Focused "Today's Schedule" card on the dashboard showing current day's information
   - Real-time open/closed status indicator based on current time and configured hours
   - One-click "Close for Today" button on dashboard to quickly mark the current day as closed
   - Ability to reopen a manually closed day

3. **Schedule Management Features**:
   - Add, edit, and delete schedule days
   - Time pickers for structured time input
   - Toggle for manually marking days as closed
   - Batch edit multiple days with the same location/hours
   - Visual calendar-style view of the week
   - Group consecutive days at the same location for better organization
   - Metadata management (title and description)

4. **Status Indication**:
   - Visual indicator shows if the food truck is currently open or closed
   - Different visual styling for manually closed days vs. naturally closed due to hours
   - Structured time parsing for accurate open/closed determination
   - Handling of overnight hours (when close time is earlier than open time)
   - Priority given to manual closure over time-based determination
   - Messaging about order acceptance status based on open/closed state
   - Warning when no schedule is configured for the current day

5. **Public-Facing Display**:
   - Weekly schedule displayed on the food truck's public website
   - Clear visual indication when a day is manually marked as closed
   - Responsive grid/list layout for different screen sizes
   - Highlighting of current day for better user experience

6. **Server/Client Compatibility**:
   - Separate utility functions for server and client components
   - Client-side: `isScheduledOpen` and `getTodaySchedule` in `schedule-utils.ts`
   - Server-side: `isScheduledOpenServer` and `getTodayScheduleServer` in `schedule-utils-server.ts`
   - Consistent behavior between server and client rendering

### Order System

The template system will integrate with the order system:

1. Online ordering will be enabled through the configuration
2. Orders will be processed through the order system as documented in `order-system.md`
3. Real-time order status updates will be provided via Supabase subscriptions

## Database Schema

The template system relies on the following database tables:

### FoodTrucks Table

```sql
CREATE TABLE FoodTrucks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subdomain TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  configuration JSONB NOT NULL,
  subscription_plan TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_api_key TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

The `configuration` field stores the JSON representation of the `FoodTruckConfig` type.

### Row-Level Security (RLS)

The system uses Supabase RLS policies to ensure data isolation:

```sql
-- FoodTrucks table policies
CREATE POLICY "Users can view their own food trucks" ON "public"."FoodTrucks"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food trucks" ON "public"."FoodTrucks"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food trucks" ON "public"."FoodTrucks"
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food trucks" ON "public"."FoodTrucks"
  FOR DELETE USING (auth.uid() = user_id);
```

## Future Enhancements

According to the project plan, the following enhancements are planned for the template system:

1. **Menu-centric design** with interactive cards (e.g., flip/expand on hover/tap)
2. **Additional sections**:
   - Gallery
   - Events
   - Reviews (with star ratings)
   - Locations (Google Maps)
3. **Online ordering** with Stripe and Apple Pay support
4. **Real-time order status component** using Supabase subscriptions
5. **SEO Management** with basic meta tag fields
6. **Custom domain support** for Pro plan users
7. **Google Maps integration** for the schedule section to visualize locations
8. **Enhanced schedule status**:
   - Automatic timezone detection and adjustment
   - Manual override for open/closed status
   - Special holiday/closure announcements

## Best Practices

### Adding New Configuration Options

1. Update the `FoodTruckConfig` type in `FoodTruckTemplate/index.tsx`
2. Add default values to the default configuration
3. Update the admin interface to include the new options
4. Update the relevant template components to use the new options

### Creating New Section Components

1. Create a new component in the `FoodTruckTemplate` directory
2. Follow the existing pattern for props and structure
3. Import and add the component to the main `FoodTruckTemplate` component
4. Update the admin interface to allow configuration of the new section

### Performance Considerations

1. Use Next.js Image component for optimized image loading
2. Implement lazy loading for sections below the fold
3. Minimize client-side JavaScript for better performance
4. Use server components where possible for faster initial load

## Security Considerations

1. **Input Validation**: Validate all user input before saving to the database
2. **Content Security Policy**: Implement CSP to prevent XSS attacks
3. **Custom Code Sandboxing**: If allowing custom CSS/JS, implement proper sandboxing
4. **Access Control**: Ensure only authorized users can modify configurations
5. **Data Isolation**: Use RLS policies to restrict users to their own data

## Accessibility Considerations

1. Ensure all template components meet WCAG 2.1 AA standards
2. Provide proper contrast options in the color picker
3. Ensure all interactive elements are keyboard accessible
4. Include proper ARIA attributes for screen readers

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web)