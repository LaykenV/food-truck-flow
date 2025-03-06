# FoodTruckFlow.com Implementation Context

## Overview
FoodTruckFlow.com is a B2B SaaS platform designed for food truck owners to create and manage their online presence. It offers a customizable public-facing website, an online ordering system, and an admin dashboard for content management and analytics. The platform is built with **Next.js** for the frontend, **Supabase** for authentication (including social login), PostgreSQL database management, and real-time updates, and **Stripe** for subscription and payment processing. Deployment is handled via **Vercel**, supporting wildcard subdomains and custom domains.

## Key Updates
- **Custom Admin Dashboard**: Replaced Payload CMS with a custom Next.js and Supabase solution.
- **Supabase Authentication**: Supports email/password and social login (e.g., Google, GitHub).
- **Supabase Real-Time**: Replaces WebSockets for order status updates and in-app notifications.
- **Row-Level Security (RLS)**: Ensures data isolation by restricting users to their own data.
- **Live Preview**: Allows real-time website editing via JSON objects on both the landing page (demo) and admin dashboard.
- **No Unit Tests**: Excluded as per request.
- **Onboarding Flow**: Free sign-up and website configuration, with a subscription required to publish live.

## Key Features

### Landing Page
- Static content served with Next.js at `/`.
- Modern, simple design with bold typography and strong calls-to-action.
- Includes a **live preview demo** for editing a sample website (e.g., menu, colors, text) without signing up.
- Subscription call-to-action to encourage hosting post-preview.

### Subscription Plans
- **Basic Plan ($29/month)**: Website template, online ordering, basic analytics.
- **Pro Plan ($49/month)**: Custom domain support, advanced analytics, priority support.
- Free website building via live preview; subscription required to host and launch.
- Managed via **Stripe** integration.

### Public-Facing Website
- Hosted at `[truckname].foodtruckflow.com` (subdomain) or custom domain (Pro plan).
- **Features**:
  - Menu-centric design with interactive cards (e.g., flip/expand on hover/tap).
  - Sections: Landing, About, Gallery, Events, Reviews (with star ratings), Locations (Google Maps), Contact.
  - Online ordering with Stripe and Apple Pay support.
  - Real-time order status component using Supabase subscriptions (shown if an active order exists).
- Data fetched from Supabase, filtered by `food_truck_id`.
- Served only if `is_published` is `true` for the corresponding `food_truck_id`.

### Admin Dashboard
- Custom-built with Next.js, accessible at `/admin` post-authentication.
- **Features**:
  - **Content Editing**: Edit website content (text, photos, menu items, colors) via JSON with real-time preview.
  - **Menu Management**: CRUD operations for menu items.
  - **SEO Management**: Basic meta tag fields.
  - **Analytics**: Sales, traffic, order trends (advanced for Pro users).
  - **Orders Dashboard**: Track/update orders with real-time notifications via Supabase.
  - **Getting Started Checklist**: Guides users (e.g., "Add logo," "Set up Stripe").
  - **Onboarding Tour**: Interactive guide for new users.
  - **Publish Button**: Publishes website after subscription and Stripe API key setup.

### Subdomain and Custom Domain Support
- Subdomains (e.g., `bobs-tacos.foodtruckflow.com`) for all users.
- Custom domains with automatic SSL (via Let’s Encrypt) for Pro plan users.
- Server-side logic with `getServerSideProps` maps domains to food trucks and checks `is_published`.

### Stripe Integration
- Subscriptions via Stripe Checkout.
- Owners provide Stripe API keys for order payments (encrypted in Supabase).
- No extra fees beyond Stripe’s; refunds handled manually via Stripe dashboard.
- Webhooks sync subscription status with the `FoodTrucks` table.

### Order Status Tracking
- Order ID stored in local storage (24-hour expiration).
- Real-time updates on the public website via Supabase subscriptions.

### Template Configuration
- Website content/layout stored in a JSON object (e.g., `{"sections": [{"type": "hero", "title": "Welcome"}]}`) in `FoodTrucks.configuration`.

### Social Media Integration
- Configurable social media links (e.g., Instagram, Twitter) in the footer via the admin dashboard.

### Testimonials
- Approved testimonials on the landing page for credibility.

## Technology Stack
- **Frontend**: Next.js with TypeScript
- **Backend**: Supabase (authentication, database, real-time updates)
- **Payments**: Stripe
- **Deployment**: Vercel (wildcard subdomains, custom domains)
- **Optional Analytics**: PostHog (for advanced event tracking, if added)

## Database Schema
Managed in **Supabase PostgreSQL** with **RLS** for data isolation.

- **`Users`** (Supabase Auth):
  - `id` (uuid, primary key)
  - `email` (text)
  - Other auth fields (e.g., `created_at`)

- **`FoodTrucks`**:
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to `Users.id`)
  - `subdomain` (text, unique)
  - `custom_domain` (text, nullable, unique)
  - `configuration` (jsonb): Website content/layout
  - `subscription_plan` (text: 'basic' or 'pro')
  - `stripe_customer_id` (text)
  - `stripe_subscription_id` (text)
  - `stripe_api_key` (text, nullable): Encrypted API key for orders
  - `is_published` (boolean, default: `false`)
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
  - `items` (jsonb): Ordered items array
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
  - `food_truck_id` (uuid, foreign key to `FoodTrucks.id`, nullable for global testimonials)
  - `content` (text)
  - `author` (text)
  - `approved` (boolean)
  - `created_at` (timestamp, default `now()`)
  - `updated_at` (timestamp, default `now()`)

### RLS Policies
- **`FoodTrucks`**:
  - `SELECT`, `INSERT`, `UPDATE`, `DELETE`: `WHERE user_id = auth.uid()`
- **`Menus`, `Orders`, `Analytics`, `Testimonials`**:
  - `SELECT`, `INSERT`, `UPDATE`, `DELETE`: `WHERE food_truck_id IN (SELECT id FROM FoodTrucks WHERE user_id = auth.uid())`

## Security
- **Authentication**: Supabase Auth with email/password, social login; optional 2FA for admin.
- **Data Isolation**: RLS at the database level.
- **Encryption**: Sensitive data (e.g., Stripe API keys) encrypted in Supabase.
- **SSL**: Automatic via Let’s Encrypt for all domains.

## Design Guidelines
- **Landing Page**: Clean, modern, bold typography, use-case focused.
- **Public-Facing Website**: Mobile-first, menu-centric, interactive elements (e.g., swipeable cards).
- **Admin Dashboard**: Intuitive UI, usability-focused (e.g., guided onboarding, checklist).

## Onboarding Flow
Users sign up for free, configure their website, and subscribe to publish it live.

1. **Sign-Up:**
   - Email/password or social login.
   - Creates a `FoodTrucks` record with `user_id`, `subdomain`, default `configuration`, `is_published` = `false`.

2. **Welcome to Admin Dashboard:**
   - Redirect to `/admin` post-sign-in.
   - Displays a welcome screen with a "Getting Started Checklist" and onboarding tour.

3. **Guided Setup:**
   - Tasks:
     - Add logo.
     - Set up menu (CRUD via `Menus`).
     - Customize design (edit `configuration` JSON with live preview).
     - Connect Stripe (enter API key, stored encrypted in `stripe_api_key`).
     - Preview website.

4. **Publish Prompt:**
   - On "Publish" click:
     - Checks `stripe_subscription_id` (active) and `stripe_api_key`.
     - If missing:
       - No subscription: Redirect to Stripe Checkout (Basic/Pro).
       - No API key: Prompt to enter it.
     - If valid, sets `is_published` to `true`, site goes live at `[truckname].foodtruckflow.com`.

5. **Post-Publish:**
   - Manage subscription (upgrade, cancel) from dashboard.
   - Subscription lapse (e.g., payment failure) updates `is_published` to `false` via Stripe webhooks (optional grace period).

## Implementation Notes
- **Live Preview**:
  - Landing page uses hardcoded sample JSON for demo.
  - Admin dashboard edits `configuration` JSON, reflected real-time via React state.
- **Real-Time Updates**: Supabase subscriptions (`supabase.channel`) for orders and notifications.
- **Custom Domains**: Pro users update `custom_domain` in dashboard; Vercel manages DNS/SSL.
- **Analytics**: Basic metrics for all; advanced trends for Pro.
- **Scalability**: Efficient queries, Next.js caching for growth.
- **Dependencies**: Install `@supabase/supabase-js`, `@stripe/stripe-js`, `react-json-editor-ajrm`, `chart.js`, etc.
- **Public Website Logic**: Serve only if `is_published` = `true` via `getServerSideProps` or routing.
- **Stripe Integration**:
  - Stripe Checkout for subscriptions, storing `stripe_customer_id` and `stripe_subscription_id`.
  - Webhooks sync status (e.g., cancellation updates `is_published`).
- **Stripe API Key**: Required before publishing, with dashboard status indicator.

## Deployment
- Hosted on **Vercel** with:
  - Wildcard subdomain support (`*.foodtruckflow.com`).
  - Custom domain support for Pro users.
- Environment variables (e.g., `SUPABASE_URL`, `STRIPE_SECRET_KEY`) set in Vercel.

## Future Considerations
- Mobile app for admin users (post-launch).
- Email marketing tool integrations.