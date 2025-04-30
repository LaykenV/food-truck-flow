# React Query Implementation Guide

This document describes how React Query is implemented in the Food Truck Flow application to manage server state, data fetching, and mutations.

## Setup

React Query is set up at the layout level in `app/admin/layout.tsx` to ensure all admin components can access the same query client:

```tsx
"use client"
import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = React.useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      {/* Rest of the layout */}
    </QueryClientProvider>
  )
}
```

By using `React.useState` with a factory function, we ensure that a new `QueryClient` instance is created for each user session, preventing data leakage between users.

## Data Fetching with useQuery

### Client Query Functions

All data fetching functions are defined in `app/admin/clientQueries.ts`. These functions are pure JavaScript functions that fetch data from Supabase and return the results:

```tsx
// Example from clientQueries.ts
export async function getMenuItems() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get the food truck ID for the current user
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('id')
    .eq('user_id', user?.id)
    .single();
  
  if (!foodTruck) return [];
  
  // Fetch menu items for this food truck
  const { data, error } = await supabase
    .from('Menus')
    .select('*')
    .eq('food_truck_id', foodTruck.id)
    .order('name');
  
  if (error) throw error;
  
  return data || [];
}
```

### Using useQuery in Components

In components like `admin-sidebar.tsx` and `menus/client.tsx`, we use the `useQuery` hook to fetch data:

```tsx
// Example from admin-sidebar.tsx
const { data: foodTruck, isLoading, error } = useQuery({
  queryKey: ['foodTruck'],
  queryFn: getFoodTruck
});

// Example from menus/client.tsx with dependent queries
const { data: foodTruck, isLoading: isFoodTruckLoading } = useQuery({
  queryKey: ['foodTruck'],
  queryFn: getFoodTruck
});

const { 
  data: menuItems = [], 
  isLoading: isMenuLoading,
  error: menuError
} = useQuery({
  queryKey: ['menuItems'],
  queryFn: getMenuItems,
  enabled: !!foodTruck?.id  // Only runs when foodTruck is loaded
});
```

Key features to note:
1. Each query has a unique `queryKey` for caching and invalidation
2. We use the `enabled` option for dependent queries
3. Default values are provided for potentially undefined data (`data: menuItems = []`)
4. Loading and error states are destructured from the query result

## Mutations with useMutation

Server actions are defined in files like `app/admin/menus/actions.ts` and are used in client components with `useMutation`:

```tsx
// Example from menus/client.tsx
const addMenuItemMutation = useMutation({
  mutationFn: (menuData: {
    name: string,
    description: string,
    price: number,
    category: string,
    image_url: string
  }) => addMenuItem(menuData),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['menuItems'] })
    queryClient.invalidateQueries({ queryKey: ['menuCategories'] })
    toast.success('Menu item added successfully')
    resetForm()
  },
  onError: (error: any) => {
    toast.error(`Error adding menu item: ${error.message || 'Unknown error'}`)
    setError(error.message || 'An unknown error occurred')
  }
});
```

Key features:
1. The `mutationFn` calls the server action
2. `onSuccess` and `onError` callbacks handle side effects
3. `queryClient.invalidateQueries()` is used to refresh data after mutations

### Using Mutations

Mutations are triggered in event handlers:

```tsx
// Example from menus/client.tsx
const handleAddMenuItem = async (e: React.FormEvent) => {
  e.preventDefault()
  
  try {
    // Validate form
    if (!menuForm.name || !menuForm.price || !menuForm.category) {
      setError('Name, price, and category are required')
      return
    }
    
    // Upload image if selected
    let imageUrl = menuForm.image_url
    if (selectedFile) {
      imageUrl = await uploadImage(selectedFile)
    }
    
    // Call the mutation
    addMenuItemMutation.mutate({
      name: menuForm.name,
      description: menuForm.description,
      price: parseFloat(menuForm.price),
      category: menuForm.category,
      image_url: imageUrl
    })
  } catch (err: any) {
    console.error('Error adding menu item:', err)
    setError(err.message || 'An unknown error occurred')
  }
}
```

## Cache Invalidation

We use two layers of cache invalidation:

### 1. Client-side (React Query)

After mutations, we invalidate related query keys:

```tsx
queryClient.invalidateQueries({ queryKey: ['menuItems'] })
queryClient.invalidateQueries({ queryKey: ['menuCategories'] })
```

### 2. Server-side (Next.js)

In server actions, we use Next.js `revalidateTag` to invalidate server-side cache:

```tsx
// Example from actions.ts
revalidateTag(`foodTruck:${foodTrucks.subdomain}`)
```

## Loading and Error States

We handle loading and error states from queries:

```tsx
// Loading state
{isLoading ? (
  <div className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
) : null}

// Error state
{error && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    <p>{error.message}</p>
  </div>
)}
```

## Mutation States

We track mutation states for UI feedback:

```tsx
// Disable buttons during mutations
<Button 
  type="submit" 
  disabled={addMenuItemMutation.isPending}
>
  {addMenuItemMutation.isPending ? 'Adding...' : 'Add Item'}
</Button>
```

## Query Keys

We use consistent query keys throughout the application:

- `['foodTruck']` - Food truck details
- `['menuItems']` - Menu items
- `['menuCategories']` - Menu categories

These keys are used both for fetching data and for cache invalidation.

## Best Practices

1. **Separation of concerns**:
   - Data fetching functions in `clientQueries.ts`
   - Server actions in `actions.ts` files
   - UI components handle UI state and user interactions

2. **Handle loading and error states** for better UX

3. **Use `enabled` option** for dependent queries

4. **Invalidate relevant caches** after mutations

5. **Provide default values** for potentially undefined data 

6. **Keep query keys consistent** across components

## Implementing React Query in New Routes

1. Create data fetching functions in `clientQueries.ts`
2. Use `useQuery` hooks in your client components
3. Create server actions in an `actions.ts` file
4. Use `useMutation` for data mutations
5. Invalidate relevant caches after mutations
6. Handle loading and error states

By following this pattern, you'll have a consistent approach to data fetching and mutations throughout the application. 