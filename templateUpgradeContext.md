# [Subdomain] Route Optimization Plan

This plan outlines the steps to improve performance, user experience, and SEO for the `app/[subdomain]` routes, centralizing data fetching, leveraging Next.js features, and optimizing Supabase interactions.

## Phase 1: Data Fetching Centralization & Caching

**Goal:** Reduce database load and improve initial page load speed by caching frequently accessed, less volatile data like food truck configuration and menus. Implement cache invalidation when data changes in the admin panel.

**Files to Modify:**
- `lib/fetch-food-truck.ts` (or wherever `getFoodTruckData` and `getMenuItems` are defined)
- Admin dashboard Server Actions/API routes where config/menu are updated.
- `app/[subdomain]/layout.tsx`
- `app/[subdomain]/menu/page.tsx`

**Steps:**
1.  **Define Cache Tags:** Use descriptive tags incorporating unique identifiers. Examples: `foodTruckConfig:${subdomain}`, `menuItems:${foodTruckId}`.
2.  **Modify Fetching Functions for Caching:**
    *   Ensure `getFoodTruckData` and `getMenuItems` utilize Next.js caching. The recommended approach is using `fetch` options if your Supabase client allows, or wrapping the logic with `React.cache` or `unstable_cache` from `next/cache`.
    *   **Example using `unstable_cache`:**
        ```typescript
        // lib/fetch-food-truck.ts
        import { createClient } from '@/utils/supabase/server';
        import { unstable_cache as cache } from 'next/cache';
        import { FoodTruck, MenuItem } from '@/lib/types'; // Assuming types exist

        // Cache food truck data, tagged by subdomain
        export const getFoodTruckData = cache(
          async (subdomain: string): Promise<FoodTruck | null> => {
            console.log(`Fetching data for subdomain: ${subdomain}`); // Add logging
            const supabase = await createClient();
            const { data, error } = await supabase
              .from('FoodTrucks')
              // Select specific columns needed for the template pages + config
              .select('id, subdomain, configuration, schedule, override_status, FoodTruckConfig(*), Locations(*)')
              .eq('subdomain', subdomain)
              .maybeSingle();

            if (error) {
              console.error(`Error fetching food truck data for ${subdomain}:`, error);
              throw error; // Or handle more gracefully
            }
            return data;
          },
          ['foodTruckData'], // Cache key part
          { tags: [`foodTruckConfig:${subdomain}`] } // Cache tag including subdomain
        );

        // Cache menu items, tagged by foodTruckId
        export const getMenuItems = cache(
          async (foodTruckId: string): Promise<MenuItem[]> => {
            console.log(`Fetching menu items for foodTruckId: ${foodTruckId}`); // Add logging
            const supabase = await createClient();
            const { data, error } = await supabase
              .from('MenuItems')
              .select('*') // Select columns needed for menu display
              .eq('food_truck_id', foodTruckId)
              .order('category', { ascending: true })
              .order('order', { ascending: true });

            if (error) {
              console.error(`Error fetching menu items for ${foodTruckId}:`, error);
              throw error; // Or handle more gracefully
            }
            return data || [];
          },
          ['menuItems'], // Cache key part
          { tags: [`menuItems:${foodTruckId}`] } // Cache tag including foodTruckId
        );
        ```
3.  **Implement Cache Invalidation (`revalidateTag`):**
    *   In the Server Actions (or API routes) used by the admin dashboard to *update* food truck configuration or menu items, call `revalidateTag` with the appropriate tag.
    *   **Example Server Action Snippet:**
        ```typescript
        // app/admin/menu/actions.ts (Example Path)
        'use server';
        import { revalidateTag } from 'next/cache';
        import { createClient } from '@/utils/supabase/server'; // Use admin/service role if needed

        export async function updateMenuItem(foodTruckId: string, itemId: string, data: any) {
          const supabase = await createClient();
          // ... Supabase update logic for the menu item ...
          const { error } = await supabase.from('MenuItems').update(data).eq('id', itemId);
          if (error) { /* handle error */ }

          // Invalidate the cache for this truck's menu
          revalidateTag(`menuItems:${foodTruckId}`);
          console.log(`Revalidated menuItems tag for: ${foodTruckId}`);
        }

        export async function updateFoodTruckConfig(subdomain: string, foodTruckId: string, configData: any) {
          const supabase = await createClient();
          // ... Supabase update logic for FoodTrucks or FoodTruckConfig table ...
          const { error } = await supabase.from('FoodTrucks').update({ configuration: configData /* or specific fields */}).eq('id', foodTruckId);
           if (error) { /* handle error */ }

          // Invalidate the cache for this truck's config
          revalidateTag(`foodTruckConfig:${subdomain}`);
          console.log(`Revalidated foodTruckConfig tag for: ${subdomain}`);
        }
        ```
4.  **Verify Usage:** Confirm that `app/[subdomain]/layout.tsx`, `app/[subdomain]/menu/page.tsx`, and other relevant server components `await` these cached functions (`getFoodTruckData`, `getMenuItems`).

## Phase 2: Realtime Open Status

**Goal:** Replace the inefficient polling mechanism in `OpenStatusProvider` with a Supabase Realtime subscription for instant open/closed status updates.

**Files to Modify:**
- `app/[subdomain]/order/open-status-provider.tsx`
- `app/[subdomain]/order/page.tsx` (to pass initial data)
- Remove the API route used for polling (e.g., `/api/check-open`).
- Supabase: Ensure Row Level Security (RLS) allows read access to the necessary columns (`schedule`, `override_status`, etc.) on the `FoodTrucks` table for anonymous or authenticated users viewing the order page.

**Steps:**
1.  **Fetch Initial Data Server-Side:**
    *   In `app/[subdomain]/order/page.tsx`, use the cached `getFoodTruckData` to get the food truck details including `schedule` and `override_status`.
    *   Calculate the *initial* open status server-side using a helper function (this logic might already exist).
    *   Pass `initialIsOpen`, `foodTruckId`, and potentially relevant `scheduleData` down to the `ClientOrderForm` or directly to `OpenStatusProvider` if it wraps the form.
2.  **Modify `OpenStatusProvider`:**
    *   Accept `initialIsOpen` and `foodTruckId` as props.
    *   Remove the `useEffect` hook that uses `fetch` and `setInterval`.
    *   Initialize the `isOpen` state with the `initialIsOpen` prop.
    *   Add a `useEffect` hook that depends on `foodTruckId`. Inside this hook:
        *   Create a Supabase client (`createClient` from `@/utils/supabase/client`).
        *   Set up a Realtime subscription using `supabase.channel(...)`.
        *   Subscribe to `UPDATE` events on the `public.FoodTrucks` table, filtering by `id=eq.${foodTruckId}`.
        *   In the subscription callback (`payload => { ... }`):
            *   Receive the `payload.new` data containing the updated food truck record.
            *   Recalculate the open status using the *same helper function* used for the initial server-side calculation, passing `payload.new`.
            *   Update the local state using `setIsOpen`.
        *   Store the channel reference.
        *   Return a cleanup function that calls `supabase.removeChannel(channel)` and `channel.unsubscribe()`.
    *   **Example `OpenStatusProvider` Structure:**
        ```typescript
        // app/[subdomain]/order/open-status-provider.tsx
        'use client';

        import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
        import { createClient } from '@/utils/supabase/client';
        import type { RealtimeChannel } from '@supabase/supabase-js';
        import { FoodTruck } from '@/lib/types'; // Assuming types
        import { calculateCurrentOpenStatus } from '@/lib/schedule-utils'; // Import your helper

        // ... (Context definition: OpenStatusContext, useOpenStatus) ...

        interface OpenStatusProviderProps {
          children: ReactNode;
          initialIsOpen: boolean;
          foodTruckId: string;
          // Pass any other static data needed for calculation if not on FoodTruck record
        }

        export function OpenStatusProvider({
          children,
          initialIsOpen,
          foodTruckId,
        }: OpenStatusProviderProps) {
          const [isOpen, setIsOpen] = useState(initialIsOpen);
          const channelRef = useRef<RealtimeChannel | null>(null);

          // Memoize the calculation function if it's complex or passed as prop
          const updateStatus = useCallback((truckData: Partial<FoodTruck>) => {
            // Use the imported helper function
            const updatedIsOpen = calculateCurrentOpenStatus(truckData.schedule, truckData.override_status);
            setIsOpen(updatedIsOpen);
            console.log(`Realtime status update for ${foodTruckId}: ${updatedIsOpen ? 'Open' : 'Closed'}`);
          }, []); // Add dependencies if calculateCurrentOpenStatus relies on external props

          useEffect(() => {
            // Ensure state reflects the initial prop value if component re-renders
            setIsOpen(initialIsOpen);

            // Prevent setup if foodTruckId is missing
            if (!foodTruckId) return;

            const supabase = createClient();

            // Clean up previous channel if foodTruckId changes
            if (channelRef.current) {
              supabase.removeChannel(channelRef.current);
              channelRef.current = null;
            }

            const channel = supabase
              .channel(`realtime-open-status-${foodTruckId}`)
              .on<FoodTruck>( // Use type assertion for payload
                'postgres_changes',
                {
                  event: 'UPDATE',
                  schema: 'public',
                  table: 'FoodTrucks',
                  filter: `id=eq.${foodTruckId}`,
                },
                (payload) => {
                  console.log('Realtime FoodTrucks UPDATE received:', payload.new);
                  // Pass only the necessary fields to the calculation function
                  updateStatus({ schedule: payload.new.schedule, override_status: payload.new.override_status });
                }
              )
              .subscribe((status, err) => {
                if (err) {
                  console.error(`Subscription error for open status ${foodTruckId}:`, err);
                } else {
                  console.log(`Subscription active for open status ${foodTruckId}:`, status);
                }
              });

            channelRef.current = channel;
            console.log('Realtime open status subscription setup for:', foodTruckId);

            // Cleanup function
            return () => {
              console.log('Cleaning up realtime open status subscription for:', foodTruckId);
              if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
              }
            };
          // Add updateStatus to dependency array if it's memoized and has dependencies
          }, [foodTruckId, initialIsOpen, updateStatus]);

          return (
            <OpenStatusContext.Provider value={{ isOpen }}>
              {children}
            </OpenStatusContext.Provider>
          );
        }
        ```
3.  **Remove Polling API Route:** Delete the file handling the `/api/check-open` endpoint.

## Phase 3: Server Action for Order Submission

**Goal:** Migrate the order creation logic from a client-side fetch to an API route into a Next.js Server Action for better code colocation and potentially reduced client-side JavaScript.

**Files to Modify:**
- `app/[subdomain]/order/components/ClientOrderForm.tsx` (or the form component)
- Create `app/[subdomain]/order/actions.ts`
- Remove the API route handler for order creation (e.g., `pages/api/create-order.ts`).

**Steps:**
1.  **Create Server Action (`actions.ts`):**
    *   Define an `async` function `submitOrder` marked with `'use server'`.
    *   Accept necessary arguments, preferably a structured `payload` object rather than raw `FormData` for type safety.
    *   Inside the action:
        *   Perform rigorous server-side validation of the payload (items, quantities, prices, pickup time, customer details).
        *   Create a Supabase server client (`createClient` from `@/utils/supabase/server`).
        *   Prepare the data object for insertion into the `Orders` table. Ensure `food_truck_id`, `total`, `status` ('pending' initially), etc., are correctly set.
        *   Insert the order using `supabase.from('Orders').insert(...).select('id').single()`.
        *   Handle potential Supabase errors.
        *   **Crucially:** After successful insertion, use `redirect` from `next/navigation` to navigate the user to the order confirmation page, passing the new `orderId`. This follows the Post-Redirect-Get (PRG) pattern.
    *   **Example `submitOrder` Action:**
        ```typescript
        // app/[subdomain]/order/actions.ts
        'use server';

        import { createClient } from '@/utils/supabase/server';
        import { cookies } from 'next/headers';
        import { redirect } from 'next/navigation';
        import { CartItem } from '@/context/CartContext'; // Adjust import path
        import { z } from 'zod'; // Use Zod for validation

        // Define Zod schema for validation
        const OrderPayloadSchema = z.object({
          items: z.array(z.object({ /* define CartItem schema */ id: z.string(), name: z.string(), quantity: z.number().min(1), price: z.number() })).min(1, "Cart cannot be empty"),
          notes: z.string().max(500).optional(),
          pickupTime: z.string().datetime().nullable(), // ISO string or null
          isAsap: z.boolean(),
          customerName: z.string().min(1, "Name is required"),
          customerPhone: z.string().min(10, "Valid phone number is required"), // Add better phone validation
          foodTruckId: z.string().uuid(),
          subdomain: z.string().min(1),
          total: z.number().positive("Total must be positive"),
          // Add payment intent ID if applicable
        });

        type OrderPayload = z.infer<typeof OrderPayloadSchema>;

        export async function submitOrder(payload: OrderPayload) {
          const validationResult = OrderPayloadSchema.safeParse(payload);

          if (!validationResult.success) {
            console.error("Order validation failed:", validationResult.error.flatten());
            // Cannot redirect here, need to return error to client
            // Consider using a library like 'next-safe-action' for better error handling
            throw new Error(`Validation failed: ${validationResult.error.flatten().fieldErrors}`);
          }

          const validatedPayload = validationResult.data;
          const cookieStore = cookies();
          const supabase = await createClient(cookieStore); // Use cookieStore if RLS depends on user

          try {
            // Optional: Verify total server-side based on item prices from DB?

            const orderData = {
              food_truck_id: validatedPayload.foodTruckId,
              items: validatedPayload.items, // Ensure structure matches DB jsonb type
              notes: validatedPayload.notes,
              pickup_time: validatedPayload.isAsap ? null : validatedPayload.pickupTime,
              is_asap: validatedPayload.isAsap,
              customer_name: validatedPayload.customerName,
              customer_phone: validatedPayload.customerPhone,
              total: validatedPayload.total,
              status: 'pending', // Initial status
              // user_id: (await supabase.auth.getUser()).data.user?.id, // If applicable
            };

            const { data: newOrder, error } = await supabase
              .from('Orders')
              .insert(orderData)
              .select('id')
              .single();

            if (error) {
              console.error('Supabase order insertion error:', error);
              // Throw error to be caught by client if not using PRG immediately
              throw new Error('Failed to save order to database.');
            }

            if (!newOrder?.id) {
               throw new Error('Failed to retrieve order ID after creation.');
            }

            console.log(`Order ${newOrder.id} created successfully.`);

            // Redirect to confirmation page (PRG pattern)
            redirect(`/${validatedPayload.subdomain}/order-confirmation?id=${newOrder.id}`);

          } catch (err: any) {
            console.error('Order submission process error:', err);
            // Re-throw or handle error appropriately for client feedback
            // If not redirecting, return an error object: return { success: false, error: err.message };
             throw new Error(err.message || 'An unexpected error occurred during order submission.');
          }
        }
        ```
2.  **Update Form Component (`ClientOrderForm.tsx`):**
    *   Import the `submitOrder` action.
    *   Use the `useTransition` hook from React to manage the pending state of the action.
    *   Modify the form's `onSubmit` handler:
        *   Prevent default form submission (`event.preventDefault()`).
        *   Construct the `payload` object with all required data.
        *   Wrap the call to `submitOrder(payload)` within `startTransition(() => { ... })`.
        *   Since the action now redirects on success, client-side success handling is minimal. Focus on disabling the form while `isPending` and displaying errors if the action throws.
    *   **Example `onSubmit` Handler:**
        ```typescript
        // app/[subdomain]/order/components/ClientOrderForm.tsx
        'use client';
        import { useTransition, useState } from 'react';
        import { submitOrder } from '../actions';
        import { useCart } from '@/context/CartContext'; // Adjust path
        import { Button } from '@/components/ui/button';
        // ... other imports and form state hooks ...

        function ClientOrderForm({ foodTruckId, subdomain }: { foodTruckId: string; subdomain: string }) {
          const [isPending, startTransition] = useTransition();
          const { cartItems, cartTotal, clearCart } = useCart(); // Assuming clearCart exists
          const [formError, setFormError] = useState<string | null>(null);
          // ... state for name, phone, notes, pickupTime, isAsap ...

          const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setFormError(null);

            // Gather form data into payload
            const payload = {
              items: cartItems,
              notes: /* get notes state */,
              pickupTime: /* get pickupTime state (ensure ISO format or null) */,
              isAsap: /* get isAsap state */,
              customerName: /* get name state */,
              customerPhone: /* get phone state */,
              foodTruckId,
              subdomain,
              total: cartTotal,
            };

            startTransition(async () => {
              try {
                // Action handles redirect on success
                await submitOrder(payload);
                // Clear cart optimistically *after* starting transition,
                // but before redirect happens (might be too fast to see)
                // Consider clearing cart on the confirmation page instead via effect?
                // clearCart();
              } catch (error: any) {
                console.error("Order submission failed:", error);
                // Action threw an error, display it
                setFormError(error.message || "Failed to place order. Please check your details and try again.");
              }
            });
          };

          return (
            <form onSubmit={handleFormSubmit}>
              {/* ... Form Fields ... */}
              {formError && <p className="text-sm text-red-600 mt-2">{formError}</p>}
              <Button type="submit" disabled={isPending || cartItems.length === 0} className="w-full mt-4">
                {isPending ? 'Placing Order...' : `Place Order ($${cartTotal.toFixed(2)})`}
              </Button>
            </form>
          );
        }
        ```
3.  **Remove API Route:** Delete the old API route file that handled order creation.

## Phase 4: UI/UX Enhancements (Loading, Optimism, Errors)

**Goal:** Improve perceived performance and user feedback with skeleton loaders, optimistic updates for cart actions, and robust error handling.

**Files to Modify:**
- `app/[subdomain]/order/loading.tsx`
- `app/[subdomain]/menu/loading.tsx`
- `app/[subdomain]/order/page.tsx` (and components within)
- `app/[subdomain]/menu/page.tsx` (and components within)
- `context/CartContext.tsx` (or equivalent)
- Create `app/[subdomain]/error.tsx`
- Create `app/[subdomain]/order/error.tsx`
- Create `app/[subdomain]/menu/error.tsx`

**Steps:**
1.  **Granular Loading Skeletons:**
    *   Enhance `order/loading.tsx` and `menu/loading.tsx` to provide more detailed skeleton UIs that mimic the structure of their corresponding pages (e.g., skeleton for menu categories/items, order form sections, cart summary). Use `shadcn/ui` Skeleton component.
    *   In `order/page.tsx` and `menu/page.tsx`, identify components that might have their own data dependencies or are visually distinct sections. Wrap them in `<Suspense fallback={<YourSpecificSkeleton />}>`. Example:
        ```jsx
        // app/[subdomain]/order/page.tsx
        import { Suspense } from 'react';
        import { CartSummarySkeleton } from './components/CartSummarySkeleton'; // Create this
        // ... other imports

        export default async function OrderPage({ params }) {
          // ... fetch data ...
          return (
            <div>
              {/* ... other parts of the page ... */}
              <Suspense fallback={<CartSummarySkeleton />}>
                 {/* Assuming CartSummary is an async component or fetches data */}
                 <CartSummary foodTruckId={foodTruck.id} />
              </Suspense>
              <Suspense fallback={<OrderFormSkeleton />}>
                 <ClientOrderForm foodTruckId={foodTruck.id} subdomain={params.subdomain} />
              </Suspense>
              {/* ... */}
            </div>
          );
        }
        ```
2.  **Optimistic Cart Updates:**
    *   In `CartContext.tsx` (or your cart state management logic):
        *   Modify `addToCart`, `removeFromCart`, `updateQuantity` functions.
        *   When an action is triggered, update the React state *immediately* to reflect the change in the UI.
        *   *Optional but recommended:* If cart state needs persistence (e.g., localStorage, database), perform the async persistence *after* updating the state. If the persistence fails, ideally notify the user, but reverting the UI state might be jarring unless the failure is critical. For simple client-side carts, this is less of an issue.
3.  **Error Boundaries (`error.tsx`):**
    *   Create `error.tsx` files within `app/[subdomain]/`, `app/[subdomain]/order/`, and `app/[subdomain]/menu/`.
    *   These *must* be Client Components (`'use client'`).
    *   They receive `error: Error & { digest?: string }` and `reset: () => void` props.
    *   Display a user-friendly error message. Log the `error` object to the console or an error reporting service in a `useEffect`.
    *   Provide a "Try Again" button that calls the `reset` function.
    *   **Example `error.tsx`:**
        ```typescript
        // app/[subdomain]/order/error.tsx
        'use client';
        import { useEffect } from 'react';
        import { Button } from '@/components/ui/button';

        export default function OrderError({
          error,
          reset,
        }: {
          error: Error & { digest?: string };
          reset: () => void;
        }) {
          useEffect(() => {
            console.error("Order Page Error:", error);
            // Log to Sentry, etc.
          }, [error]);

          return (
            <div className="container mx-auto px-4 py-16 text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-4">Oops! Something went wrong loading the order page.</h2>
              <p className="text-gray-600 mb-6">{error.message || "An unexpected error occurred."}</p>
              <Button onClick={() => reset()}>
                Try Again
              </Button>
            </div>
          );
        }
        ```

## Phase 5: SEO Enhancements

**Goal:** Improve search engine discoverability and presentation through specific metadata and structured data.

**Files to Modify:**
- `app/[subdomain]/layout.tsx`
- `app/[subdomain]/menu/page.tsx`
- `app/[subdomain]/order/page.tsx`
- Components rendering menu items (e.g., `MenuDisplay`, `MenuItemCard`)

**Steps:**
1.  **Page-Specific Metadata (`generateMetadata`):**
    *   Implement `export async function generateMetadata({ params })` in `menu/page.tsx` and `order/page.tsx`.
    *   Inside these functions, fetch the food truck name using the cached `getFoodTruckData(params.subdomain)`.
    *   Return a `Metadata` object with tailored `title` and `description`.
    *   **Example for `menu/page.tsx`:**
        ```typescript
        // app/[subdomain]/menu/page.tsx
        import { getFoodTruckData } from '@/lib/fetch-food-truck'; // Adjust path
        import type { Metadata } from 'next';
        // ... other imports

        type Props = { params: { subdomain: string } };

        export async function generateMetadata({ params }: Props): Promise<Metadata> {
          const foodTruck = await getFoodTruckData(params.subdomain);
          const truckName = foodTruck?.configuration?.truckName || params.subdomain; // Fallback

          return {
            title: `Menu | ${truckName}`,
            description: `Explore the delicious menu and order online from ${truckName}.`,
            // Add openGraph, twitter card metadata etc.
          };
        }

        // ... rest of MenuPage component
        ```
2.  **Structured Data (JSON-LD):**
    *   **`Restaurant` Schema:** In `app/[subdomain]/layout.tsx` (or `page.tsx`), fetch `foodTruck` data. Embed a `<script type="application/ld+json">` with the `Restaurant` schema. Include `name`, `url`, `image`, `servesCuisine`, `address` (if available), `telephone`, and potentially `openingHoursSpecification` based on the schedule.
    *   **`Menu` Schema:** In `app/[subdomain]/menu/page.tsx`, fetch menu items. Embed a `Menu` schema script. This schema should contain `hasMenuSection` which is an array of `MenuSection` objects. Each `MenuSection` should have a `name` (category) and `hasMenuItem` (an array of `MenuItem` schema objects).
    *   **`MenuItem` / `Product` Schema:** Within the `MenuItem` schema (inside the `Menu` schema), or potentially as separate `Product` schemas rendered alongside each menu item in your display component, include `name`, `description`, `image`, and `offers` (an `Offer` schema with `price` and `priceCurrency`).
    *   **Example Snippet Placement:**
        ```jsx
         // Helper function to generate JSON-LD script tag
         function JsonLdScript({ data }: { data: object }) {
           return (
             <script
               type="application/ld+json"
               dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
             />
           );
         }

         // In layout.tsx or page.tsx (fetch foodTruck data here)
         <JsonLdScript data={{
           "@context": "https://schema.org",
           "@type": "Restaurant",
           "name": foodTruck?.configuration?.truckName,
           "image": foodTruck?.configuration?.logoUrl, // Example
           "url": `https://${foodTruck?.subdomain}.yourdomain.com`, // Use actual domain
           // ... other Restaurant properties
         }} />

         // In menu/page.tsx (fetch menuItems data here)
         <JsonLdScript data={{
           "@context": "https://schema.org",
           "@type": "Menu",
           "name": "Main Menu",
           "hasMenuSection": menuItems.reduce((acc, item) => { /* Group items by category into sections */ }, [])
             .map(section => ({
               "@type": "MenuSection",
               "name": section.category,
               "hasMenuItem": section.items.map(item => ({
                 "@type": "MenuItem", // Or Product
                 "name": item.name,
                 "description": item.description,
                 "image": item.imageUrl,
                 "offers": {
                   "@type": "Offer",
                   "price": item.price.toFixed(2),
                   "priceCurrency": "USD" // Adjust currency
                 }
               }))
             }))
         }} />
        ```

## Phase 6: Code Refinement & Analysis

**Goal:** Optimize the client-side JavaScript bundle size and ensure efficient navigation.

**Files to Modify:** Various client components, `next.config.js`.

**Steps:**
1.  **Bundle Analysis:**
    *   Install analyzer: `npm install --save-dev @next/bundle-analyzer`
    *   Configure in `next.config.js`:
        ```javascript
        const withBundleAnalyzer = require('@next/bundle-analyzer')({
          enabled: process.env.ANALYZE === 'true',
        });
        module.exports = withBundleAnalyzer({
          // Your Next.js config
        });
        ```
    *   Run build analysis: `ANALYZE=true npm run build`.
    *   Open `.next/analyze/client.html` and identify large chunks or dependencies. Pay attention to components used in `app/[subdomain]`.
2.  **Minimize Client Components (`'use client'`):**
    *   Review components marked `'use client'`. Can interactivity be isolated to smaller child components? Pass server-rendered components as children (`{children}`) where possible to keep static parts out of the client bundle.
3.  **Lazy Loading (`next/dynamic`):**
    *   Identify components that are not immediately visible or required for the initial interaction (e.g., complex modals, date pickers, potentially the full cart details if initially collapsed).
    *   Import them dynamically: `import dynamic from 'next/dynamic'; const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), { ssr: false, loading: () => <p>Loading...</p> });`
    *   Use `<HeavyComponent />` in your JSX. `ssr: false` is often useful for client-only libraries.
4.  **Review `next/link` Usage:**
    *   Ensure all internal navigation links within the `app/[subdomain]` routes (e.g., navbar links, back buttons, links from menu to order) use `<Link href="...">` from `next/link` for client-side navigation and prefetching benefits. Avoid standard `<a href="...">` for internal routes.

## Phase 7: Order Confirmation Refinement

**Goal:** Optimize the `OrderConfirmationClient` by potentially removing redundant polling if Realtime is sufficient.

**Files to Modify:**
- `app/[subdomain]/order-confirmation/OrderConfirmationClient.tsx`

**Steps:**
1.  **Evaluate Polling (`setInterval`):**
    *   Carefully assess if the `setInterval` calling `fetchOrderDetails` every 30 seconds is still necessary.
    *   **Test:** Temporarily comment out the `setInterval` and its related `fetchOrderDetails` call. Test the order confirmation page thoroughly. Do all expected status updates (`pending` -> `preparing` -> `ready` -> `completed`) arrive correctly and promptly via the Realtime subscription?
    *   **Decision:**
        *   If Realtime updates are reliable for all status transitions, **remove** the `setInterval`, the `fetchOrderDetails` function, and the associated `loading` state management tied to polling. This simplifies the component and reduces load.
        *   If Realtime occasionally misses updates or if polling provides essential fallback/synchronization, **keep** the `setInterval`, but consider increasing the interval (e.g., to 60 seconds) if 30 seconds is too aggressive.
2.  **Subscription Cleanup:** Double-check the `useEffect` cleanup function for the Realtime subscription. Ensure `supabase.removeChannel(currentSubscription.channel)` is correctly called when the component unmounts or the `orderId` changes to prevent leaks. The existing code (```150:157:app/[subdomain]/order-confirmation/OrderConfirmationClient.tsx```) seems correct, but verify its behavior.
