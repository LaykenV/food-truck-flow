# Supabase Interactions Guide

This document contains valuable information about interacting with Supabase in the FoodTruckFlow application, extracted from the starter template.

## Setting Up Supabase

1. Create a Supabase project at [database.new](https://app.supabase.com/project/_/settings/api)
2. Set up environment variables in `.env.local` with values from your Supabase project's API Settings
3. Required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

## Authentication

### Redirect URLs Configuration

For authentication to work properly, you need to configure redirect URLs in your Supabase project:

1. Go to [Supabase Auth Settings](https://supabase.com/dashboard/project/_/auth/url-configuration)
2. Add the following redirect URLs:
   - `http://localhost:3000/**` (for local development)
   - `https://your-production-domain.com/**` (for production)
   - For Vercel deployments, include preview URLs pattern

### Authentication Methods

The application supports:
- Email/password authentication
- OAuth providers (Google, Facebook)

## Data Fetching

### Server-Side Data Fetching

```typescript
import { createClient } from '@/utils/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: foodTrucks } = await supabase.from('FoodTrucks').select()

  return <pre>{JSON.stringify(foodTrucks, null, 2)}</pre>
}
```

### Client-Side Data Fetching

```typescript
'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function Page() {
  const [foodTrucks, setFoodTrucks] = useState<any[] | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase.from('FoodTrucks').select()
      setFoodTrucks(data)
    }
    getData()
  }, [])

  return <pre>{JSON.stringify(foodTrucks, null, 2)}</pre>
}
```

## Database Operations

### Creating Tables Example

```sql
create table FoodTrucks (
  id uuid primary key,
  user_id uuid references auth.users,
  subdomain text unique,
  custom_domain text unique,
  configuration jsonb,
  subscription_plan text,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_api_key text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

### Row-Level Security (RLS)

Remember to set up RLS policies for your tables to ensure data isolation:

```sql
-- Example RLS policy for FoodTrucks table
ALTER TABLE "FoodTrucks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own food trucks" 
ON "FoodTrucks" FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food trucks" 
ON "FoodTrucks" FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food trucks" 
ON "FoodTrucks" FOR UPDATE 
USING (auth.uid() = user_id);
```

## Real-Time Updates

For real-time order status updates and notifications, use Supabase subscriptions:

```typescript
const channel = supabase
  .channel('table-db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'Orders',
      filter: `food_truck_id=eq.${foodTruckId}`
    },
    (payload) => {
      // Handle the real-time update
      console.log('Change received!', payload)
      // Update UI accordingly
    }
  )
  .subscribe()

// Clean up subscription when component unmounts
return () => {
  supabase.removeChannel(channel)
}
```

## Utility Functions

The application uses utility functions for Supabase client creation:

- `createClient()` in `utils/supabase/server.ts` - For server components
- `createClient()` in `utils/supabase/client.ts` - For client components

These functions handle authentication state and provide the appropriate Supabase client instance. 