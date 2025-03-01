# Updated Implementation Plan for FoodTruckFlow.com

This plan provides a detailed, sequential guide to building `FoodTruckFlow.com`, a B2B SaaS platform for food truck owners to create and manage their online presence. It includes a customizable public-facing website, an online ordering system, and a custom admin dashboard, with updates based on feedback to enhance functionality and usability.

---

## Project Setup

### Step 1: Initialize Next.js Project with TypeScript
- **Task**: Set up a new Next.js project with TypeScript support.
- **Files**:
  - `package.json`: Add dependencies (`next`, `react`, `react-dom`, `typescript`).
  - `tsconfig.json`: Configure TypeScript settings.
- **Dependencies**: None
- **Instructions**:
  - Run `npx create-next-app@latest my-foodtruck-app --typescript` to initialize the project.
  - Verify the setup by running `npm run dev`.

### Step 2: Set Up Supabase
- **Task**: Create a Supabase project and obtain credentials.
- **Files**: None
- **Dependencies**: None
- **Instructions**:
  - Sign up at [supabase.com](https://supabase.com).
  - Create a new project and copy the API URL and anon key from the dashboard.

### Step 3: Install Supabase Client
- **Task**: Add the Supabase JavaScript client to the project.
- **Files**:
  - `package.json`: Add `@supabase/supabase-js@latest`.
- **Dependencies**: Step 1
- **Instructions**:
  - Run `npm install @supabase/supabase-js@latest` to install the latest version, ensuring compatibility with real-time features.

### Step 4: Configure Supabase Client
- **Task**: Initialize the Supabase client with environment variables.
- **Files**:
  - `lib/supabase.ts`: Create the Supabase client instance.
  - `.env`: Add `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- **Dependencies**: Step 2, Step 3
- **Instructions**:
  - Add the API URL and anon key from Step 2 to `.env`.
  - In `lib/supabase.ts`, initialize the client:
    ```typescript
    import { createClient } from '@supabase/supabase-js';
    export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
    ```

---

## Authentication

### Step 5: Implement Authentication with Supabase
- **Task**: Set up login, signup, and social login using Supabase Authentication.
- **Files**:
  - `app/login/page.tsx`: Login page with email/password and social login options.
  - `app/signup/page.tsx`: Signup page with email/password and social login options.
  - `lib/auth.ts`: Authentication utility functions (e.g., `signIn`, `signUp`, `signOut`).
- **Dependencies**: Step 4
- **Instructions**:
  - In `lib/auth.ts`, define functions using Supabase auth methods:
    - `supabase.auth.signInWithPassword` for email/password login.
    - `supabase.auth.signUp` for signup.
    - `supabase.auth.signInWithOAuth` for social login (e.g., Google, GitHub).
  - Enable social providers in the Supabase dashboard under Authentication > Providers.
  - Create basic UI in `login` and `signup` pages with forms and buttons for each auth method.
  - Test all authentication flows manually.

### Step 6: Enhance Session Management
- **Task**: Ensure session persistence and validation across the app.
- **Files**:
  - `lib/useAuth.ts`: Update the authentication hook.
  - `app/admin/layout.tsx`: Add server-side session validation.
- **Dependencies**: Step 5
- **Instructions**:
  - In `lib/useAuth.ts`, listen for real-time auth state changes:
    ```typescript
    import { useEffect, useState } from 'react';
    import { supabase } from './supabase';
    export function useAuth() {
      const [session, setSession] = useState(null);
      useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          setSession(session);
        });
        return () => authListener.subscription.unsubscribe();
      }, []);
      return session;
    }
    ```
  - In `app/admin/layout.tsx`, use `getServerSideProps` for server-side validation:
    ```typescript
    export async function getServerSideProps(context) {
      const { req } = context;
      const { user } = await supabase.auth.api.getUserByCookie(req);
      if (!user) {
        return { redirect: { destination: '/login', permanent: false } };
      }
      return { props: {} };
    }
    ```

---

## Database and Security

### Step 7: Define Database Schema with Timestamps
- **Task**: Create tables in Supabase with timestamps for auditing.
- **Files**: None (use Supabase dashboard or SQL editor)
- **Dependencies**: Step 2
- **Instructions**:
  - Define the schema with `created_at` and `updated_at` columns:
    - **`Users`** (managed by Supabase Auth):
      - `id` (uuid, primary key)
      - `email` (text)
      - Other auth-managed fields (e.g., `created_at`)
    - **`FoodTrucks`**:
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to `Users.id`)
      - `subdomain` (text, unique)
      - `custom_domain` (text, nullable, unique)
      - `configuration` (jsonb): Stores website content (e.g., hero, about)
      - `subscription_plan` (text: 'basic' or 'pro')
      - `stripe_customer_id` (text)
      - `stripe_subscription_id` (text)
      - `stripe_api_key` (text, nullable): Encrypted Stripe API key
      - `created_at` (timestamp, default `now()`)
      - `updated_at` (timestamp, default `now()`)
    - **`Menus`**:
      - `id` (uuid, primary key)
      - `food_truck_id` (uuid, foreign key to `FoodTrucks.id`)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `category` (text)
      - `created_at` (timestamp, default `now()`)
      - `updated_at` (timestamp, default `now()`)
    - **`Orders`**:
      - `id` (uuid, primary key)
      - `food_truck_id` (uuid, foreign key to `FoodTrucks.id`)
      - `customer_name` (text)
      - `customer_email` (text)
      - `items` (jsonb): Array of ordered items
      - `total_amount` (numeric)
      - `status` (text: 'pending', 'preparing', 'ready', 'completed')
      - `created_at` (timestamp, default `now()`)
      - `updated_at` (timestamp, default `now()`)
    - **`Analytics`**:
      - `id` (uuid, primary key)
      - `food_truck_id` (uuid, foreign key to `FoodTrucks.id`)
      - `date` (date)
      - `page_views` (integer)
      - `orders_placed` (integer)
      - `revenue` (numeric)
      - `created_at` (timestamp, default `now()`)
      - `updated_at` (timestamp, default `now()`)
    - **`Testimonials`**:
      - `id` (uuid, primary key)
      - `food_truck_id` (uuid, foreign key to `FoodTrucks.id`, nullable)
      - `content` (text)
      - `author` (text)
      - `approved` (boolean)
      - `created_at` (timestamp, default `now()`)
      - `updated_at` (timestamp, default `now()`)

### Step 8: Set Up Row Level Security (RLS)
- **Task**: Implement RLS policies to ensure data isolation.
- **Files**: None (use Supabase dashboard or SQL editor)
- **Dependencies**: Step 7
- **Instructions**:
  - Enable RLS for each table in the Supabase dashboard.
  - Define policies:
    - **`FoodTrucks`**:
      - `SELECT`, `INSERT`, `UPDATE`, `DELETE`: `WHERE user_id = auth.uid()`
    - **`Menus`, `Orders`, `Analytics`, `Testimonials`**:
      - `SELECT`, `INSERT`, `UPDATE`, `DELETE`: `WHERE food_truck_id IN (SELECT id FROM FoodTrucks WHERE user_id = auth.uid())`

### Step 9: Test Row Level Security (RLS)
- **Task**: Manually test RLS policies to ensure data isolation.
- **Files**: None
- **Dependencies**: Step 8
- **Instructions**:
  - Create test accounts and attempt to access another user's `FoodTrucks` data.
  - Verify access is denied as expected.

---

## Utilities

### Step 10: Implement `getFoodTruckByHostname` Utility
- **Task**: Create a utility to fetch a food truck by hostname with optimized queries.
- **Files**:
  - `lib/getFoodTruckByHostname.ts`
- **Dependencies**: Step 7, Step 4
- **Instructions**:
  - In `lib/getFoodTruckByHostname.ts`, query `FoodTrucks`:
    ```typescript
    import { supabase } from './supabase';
    export async function getFoodTruckByHostname(hostname: string) {
      const { data, error } = await supabase
        .from('FoodTrucks')
        .select('id, configuration, subscription_plan')
        .or(`subdomain.eq.${hostname},custom_domain.eq.${hostname}`)
        .single();
      if (error) throw error;
      return data;
    }
    ```

---

## Layout and Shared Components

### Step 11: Set Up Root Layout and Design System
- **Task**: Implement the root layout with global styles and dynamic rendering.
- **Files**:
  - `app/layout.tsx`: Root layout component.
  - `components/Layout.tsx`: Reusable layout wrapper.
  - `styles/global.css`: Global CSS styles.
- **Dependencies**: Step 10
- **Instructions**:
  - In `app/layout.tsx`, use `getFoodTruckByHostname`:
    ```typescript
    import { getFoodTruckByHostname } from '../lib/getFoodTruckByHostname';
    export default async function RootLayout({ children }) {
      const hostname = headers().get('host') || 'foodtruckflow.com';
      const foodTruck = await getFoodTruckByHostname(hostname);
      return (
        <html lang="en">
          <body>{foodTruck ? <Layout>{children}</Layout> : children}</body>
        </html>
      );
    }
    ```
  - Add basic styles in `global.css` (e.g., reset, typography).

### Step 12: Implement Shared Header and Footer Components
- **Task**: Create reusable headers and footers.
- **Files**:
  - `components/LandingHeader.tsx`
  - `components/LandingFooter.tsx`
  - `components/FoodTruckHeader.tsx`
  - `components/FoodTruckFooter.tsx`
- **Dependencies**: Step 11
- **Instructions**:
  - In `FoodTruckFooter.tsx`, fetch social links:
    ```typescript
    export function FoodTruckFooter({ config }) {
      const socials = config?.socials || { twitter: '#', instagram: '#' };
      return (
        <footer>
          <a href={socials.twitter}>Twitter</a>
          <a href={socials.instagram}>Instagram</a>
        </footer>
      );
    }
    ```

---

## Landing Page and Subscription

### Step 13: Implement Basic Landing Page with Demo Mode
- **Task**: Build the landing page with a "Demo Mode" preview.
- **Files**:
  - `app/page.tsx`: Landing page route.
  - `components/LandingPage.tsx`: Main component.
  - `components/LivePreviewDemo.tsx`: Preview component.
- **Dependencies**: Step 12
- **Instructions**:
  - In `LivePreviewDemo.tsx`, label as "Demo Mode":
    ```typescript
    import { useState } from 'react';
    export function LivePreviewDemo() {
      const [config, setConfig] = useState({ title: 'Demo Food Truck', color: '#ff0000' });
      return (
        <div>
          <h2>Demo Mode: Try Editing!</h2>
          <input
            value={config.title}
            onChange={(e) => setConfig({ ...config, title: e.target.value })}
          />
          <div style={{ background: config.color }}>{config.title}</div>
        </div>
      );
    }
    ```
  - Add a CTA button linking to `/subscribe`.

### Step 14: Set Up Stripe Products
- **Task**: Define subscription plans in Stripe.
- **Files**: None
- **Dependencies**: None
- **Instructions**:
  - In Stripe dashboard, create:
    - Basic Plan: $29/month
    - Pro Plan: $49/month
  - Note product and price IDs.

### Step 15: Implement Subscription Page
- **Task**: Build a subscription page with Stripe Checkout.
- **Files**:
  - `app/subscribe/page.tsx`: Subscription page.
  - `lib/stripe.ts`: Stripe client initialization.
  - `api/webhooks/stripe/route.ts`: Webhook handler.
- **Dependencies**: Step 14, Step 5
- **Instructions**:
  - Install: `npm install @stripe/stripe-js stripe`.
  - Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to `.env`.
  - In `lib/stripe.ts`:
    ```typescript
    import Stripe from 'stripe';
    export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
    ```
  - In `app/subscribe/page.tsx`, create a checkout session.
  - In `api/webhooks/stripe/route.ts`, update `FoodTrucks` on `checkout.session.completed`.

---

## Admin Dashboard

### Step 16: Implement Protected Routes for Admin
- **Task**: Restrict admin pages to authenticated users.
- **Files**:
  - `components/ProtectedRoute.tsx`: Wrapper component.
- **Dependencies**: Step 6
- **Instructions**:
  - Use `getServerSideProps` for server-side validation (see Step 6).

### Step 17: Implement Admin Dashboard Layout
- **Task**: Create a layout with navigation and guidance.
- **Files**:
  - `app/admin/layout.tsx`: Admin layout route.
  - `components/AdminLayout.tsx`: Layout component.
  - `components/OnboardingTour.tsx`: Onboarding tour.
  - `components/Checklist.tsx`: Checklist component.
- **Dependencies**: Step 16
- **Instructions**:
  - Install: `npm install react-joyride`.
  - In `AdminLayout.tsx`:
    ```typescript
    import { OnboardingTour } from './OnboardingTour';
    import { Checklist } from './Checklist';
    export function AdminLayout({ children }) {
      return (
        <div>
          <nav>Config | Menus | Orders | Analytics | Settings</nav>
          <OnboardingTour />
          <Checklist />
          {children}
        </div>
      );
    }
    ```
  - Define steps in `OnboardingTour.tsx`.
  - List tasks in `Checklist.tsx`.

### Step 18: Implement Food Truck Configuration Editing
- **Task**: Add a form-based UI for editing `configuration`.
- **Files**:
  - `app/admin/config/page.tsx`: Config page.
  - `components/ConfigForm.tsx`: Form-based editor.
  - `components/LivePreview.tsx`: Preview component.
  - `components/JsonEditor.tsx`: Optional JSON editor.
- **Dependencies**: Step 17, Step 7
- **Instructions**:
  - In `ConfigForm.tsx`, create fields with tooltips.
  - Offer a toggle to `JsonEditor.tsx`.
  - Fetch and save `configuration`.

### Step 19: Implement Menu Management
- **Task**: Add CRUD operations for menu items.
- **Files**:
  - `app/admin/menus/page.tsx`: Menu page.
  - `components/MenuList.tsx`: Menu list.
  - `components/MenuForm.tsx`: Menu form.
- **Dependencies**: Step 17, Step 7
- **Instructions**:
  - Use Supabase to manage `Menus`.

---

## Public-Facing Pages

### Step 20: Implement Public Food Truck Pages
- **Task**: Create dynamic, responsive pages.
- **Files**:
  - `app/[subdomain]/page.tsx`: Home page.
  - `app/[subdomain]/menu/page.tsx`: Menu page.
  - `app/[subdomain]/about/page.tsx`: About page.
- **Dependencies**: Step 10, Step 11
- **Instructions**:
  - Use `getFoodTruckByHostname` to render content.
  - Test responsiveness on mobile devices.

### Step 21: Implement Online Ordering with Stripe Key Validation
- **Task**: Add cart and payment with key validation.
- **Files**:
  - `lib/cartContext.ts`: Cart state.
  - `components/Cart.tsx`: Cart display.
  - `components/OrderForm.tsx`: Order form.
  - `api/payments/route.ts`: Payment endpoint.
  - `app/admin/settings/page.tsx`: Settings page.
- **Dependencies**: Step 20, Step 15, Step 7
- **Instructions**:
  - In `app/admin/settings/page.tsx`, validate `stripe_api_key`:
    ```typescript
    const validateStripeKey = async (key) => {
      try {
        const response = await stripe.accounts.retrieve({ apiKey: key });
        return !!response.id;
      } catch (error) {
        return false;
      }
    };
    ```
  - In `api/payments/route.ts`:
    ```typescript
    import { stripe } from '../../lib/stripe';
    export async function POST(req) {
      const { foodTruckId, amount } = await req.json();
      const foodTruck = await supabase.from('FoodTrucks').select('stripe_api_key').eq('id', foodTruckId).single();
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        apiKey: foodTruck.data.stripe_api_key,
      });
      return Response.json({ clientSecret: paymentIntent.client_secret });
    }
    ```

### Step 22: Implement Real-Time Order Tracking with Debouncing
- **Task**: Enable real-time order updates.
- **Files**:
  - `components/OrderStatusComponent.tsx`: Status display.
- **Dependencies**: Step 21
- **Instructions**:
  - In `OrderStatusComponent.tsx`, add debouncing:
    ```typescript
    import { useEffect, useState } from 'react';
    import { supabase } from '../lib/supabase';
    export function OrderStatusComponent() {
      const [status, setStatus] = useState('');
      const orderId = localStorage.getItem('activeOrderId');
      if (!orderId) return null;
      useEffect(() => {
        const channel = supabase.channel('orders').on('UPDATE', (payload) => {
          if (payload.new.id === orderId) setStatus(payload.new.status);
        }).subscribe();
        return () => channel.unsubscribe();
      }, [orderId]);
      return <div>Order Status: {status}</div>;
    }
    ```

---

## Orders and Analytics Dashboards

### Step 23: Implement Orders Dashboard in Admin
- **Task**: Manage orders with real-time updates.
- **Files**:
  - `app/admin/orders/page.tsx`: Orders page.
  - `components/OrderList.tsx`: Order list.
- **Dependencies**: Step 17, Step 22
- **Instructions**:
  - Fetch and update `Orders`.

### Step 24: Implement Analytics Display in Admin with SSR
- **Task**: Display analytics with SSR.
- **Files**:
  - `app/admin/analytics/page.tsx`: Analytics page.
  - `components/AnalyticsChart.tsx`: Chart component.
- **Dependencies**: Step 17, Step 7
- **Instructions**:
  - Install: `npm install chart.js`.
  - Use `getServerSideProps`:
    ```typescript
    export async function getServerSideProps() {
      const analytics = await supabase.from('Analytics').select('*').eq('food_truck_id', foodTruckId);
      return { props: { analytics } };
    }
    ```

---

## Custom Domains and Security

### Step 25: Implement Custom Domain Support with Guidance
- **Task**: Allow Pro users to set custom domains.
- **Files**:
  - `app/admin/settings/page.tsx`: Settings page.
  - `components/CustomDomainForm.tsx`: Domain form.
- **Dependencies**: Step 18, Step 15
- **Instructions**:
  - Provide DNS instructions with visuals.

### Step 26: Enhance Security with 2FA
- **Task**: Add two-factor authentication.
- **Files**:
  - `app/login/page.tsx`: Updated login page.
  - `components/TwoFASetup.tsx`: 2FA setup.
- **Dependencies**: Step 5
- **Instructions**:
  - Enable MFA in Supabase and use `supabase.auth.mfa`.

---

## Integrations

### Step 27: Implement Social Media Integration
- **Task**: Add social media links.
- **Files**:
  - `components/FoodTruckFooter.tsx`
  - `app/admin/config/page.tsx`
- **Dependencies**: Step 18
- **Instructions**:
  - Add social fields to `configuration`.

### Step 28: Implement Testimonials on Landing Page
- **Task**: Display approved testimonials.
- **Files**:
  - `components/Testimonials.tsx`
  - `app/page.tsx`
- **Dependencies**: Step 13
- **Instructions**:
  - Fetch `approved` testimonials.

### Step 29: Integrate PostHog Analytics
- **Task**: Set up event tracking.
- **Files**:
  - `lib/posthog.ts`
  - `app/layout.tsx`
- **Dependencies**: Step 11
- **Instructions**:
  - Install: `npm install posthog-js`.
  - Add `POSTHOG_API_KEY` to `.env`.

---

## Compliance and Legal Pages

### Step 30: Add Privacy Policy and Terms of Service
- **Task**: Create static legal pages.
- **Files**:
  - `app/privacy-policy/page.tsx`
  - `app/terms/page.tsx`
  - `components/LandingFooter.tsx`: Update with links.
- **Dependencies**: Step 12
- **Instructions**:
  - Add content and link in footer.

---

## Deployment

### Step 31: Configure Deployment
- **Task**: Set up Vercel deployment.
- **Files**: None (Vercel dashboard)
- **Dependencies**: Step 25, Step 15
- **Instructions**:
  - Add environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `STRIPE_SECRET_KEY`.
  - Configure wildcard subdomains and custom domains.
  - Deploy via `vercel deploy`.

---

## Additional Notes
- **Error Handling**: Use try-catch blocks in all API and Supabase/Stripe calls.
- **Logging**: Log critical actions to Supabase’s `Logs` table.
- **Backup and Recovery**: Schedule backups in Supabase and document recovery.
- **Performance**: Use ISR for static content and lazy-load images.
- **Scalability**: Add indexes to frequently queried fields (e.g., `FoodTrucks.subdomain`).
- **Testing**: Manually test critical paths and mobile responsiveness.

---

This plan ensures a secure, scalable, and user-friendly platform. Happy building!