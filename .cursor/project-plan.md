## FoodTruckFlow.com Implementation Context

### Overview
FoodTruckFlow.com is a B2B SaaS platform designed for food truck owners to create and manage their online presence. It provides a customizable public-facing website, an online ordering system, and an admin dashboard for content management and analytics. The platform leverages **Next.js** for the frontend and **Supabase** for authentication (including social login), PostgreSQL database management, and real-time updates. **Stripe** handles subscription management and payment processing. The app is deployed on **Vercel** with support for wildcard subdomains and custom domains.

### Key Updates
- **Custom Admin Dashboard**: Replaced Payload CMS with a custom-built admin dashboard using Next.js and Supabase.
- **Supabase Authentication**: Handles login/signup with email/password and social login (e.g., Google, GitHub).
- **Supabase Real-Time**: Replaces WebSockets for order status updates and in-app notifications.
- **Row-Level Security (RLS)**: Ensures data isolation by restricting users to their own data in the Supabase database.
- **Live Preview**: A custom feature allowing real-time website previews by editing JSON objects, both on the landing page (demo) and admin dashboard.
- **No Unit Tests**: As per your request, unit tests are not required.

### Key Features

#### Landing Page
- Static content served with Next.js at `/`.
- Modern, simple design with bold typography and strong calls-to-action.
- Features a **live preview demo** allowing users to edit a sample website (e.g., menu, colors, text) without signing up.
- Subscription call-to-action to encourage hosting after preview.

#### Subscription Plans
- **Basic Plan ($29/month)**: Includes website template, online ordering, and basic analytics.
- **Pro Plan ($49/month)**: Adds custom domain support, advanced analytics, and priority support.
- Users can build their website for free via the live preview but must subscribe to host and launch.
- Managed via **Stripe** integration.

#### Public-Facing Website
- Hosted at `[truckname].foodtruckflow.com` (subdomain) or a custom domain (Pro plan).
- **Features**:
  - Menu-centric design with interactive cards (e.g., flip/expand on hover/tap).
  - Sections: Landing, About, Gallery, Events, Reviews (with star ratings), Locations (Google Maps), Contact.
  - Online ordering with Stripe and Apple Pay support.
  - Real-time order status component using Supabase subscriptions (displays if an active order exists).
- Data fetched from Supabase, filtered by `food_truck_id`.

#### Admin Dashboard
- Custom-built with Next.js, accessible at `/admin` after authentication.
- **Features**:
  - **Content Editing**: Edit website content (e.g., text, photos, menu items, colors) via a JSON object with a real-time live preview.
  - **Menu Management**: CRUD operations for menu items.
  - **SEO Management**: Basic fields for meta tags.
  - **Analytics**: Sales data, website traffic, order trends (advanced for Pro users).
  - **Orders Dashboard**: Track and update orders with real-time notifications via Supabase.
  - **Getting Started Checklist**: Guides users (e.g., "Add your logo," "Set up Stripe").
  - **Onboarding Tour**: Interactive guide for new users.

#### Subdomain and Custom Domain Support
- Subdomains (e.g., `bobs-tacos.foodtruckflow.com`) for all users.
- Custom domains with automatic SSL (via Let’s Encrypt) for Pro plan users.
- Server-side logic with `getServerSideProps` to map domains to food trucks.

#### Stripe Integration
- Subscriptions managed via Stripe Checkout.
- Food truck owners provide Stripe API keys for order payments (encrypted in Supabase).
- No additional fees beyond Stripe’s rates; refunds handled manually via Stripe dashboard.

#### Order Status Tracking
- Order ID stored in local storage (24-hour expiration).
- Real-time updates displayed on the public website via Supabase subscriptions.

#### Template Configuration
- Website content and layout defined in a JSON object (e.g., `{"sections": [{"type": "hero", "title": "Welcome"}]}`), stored in `FoodTrucks.configuration`.

#### Social Media Integration
- Links to social media (e.g., Instagram, Twitter) added to the footer, configurable via the admin dashboard.

#### Testimonials
- Approved testimonials displayed on the landing page for credibility.

### Technology Stack
- **Frontend**: Next.js with TypeScript
- **Backend**: Supabase (authentication, database, real-time updates)
- **Payments**: Stripe
- **Deployment**: Vercel (wildcard subdomains and custom domains)
- **Optional Analytics**: PostHog (for advanced event tracking, if implemented)

### Database Schema
All tables are managed in **Supabase PostgreSQL** with **RLS** enforced for data isolation.

- **`Users`** (managed by Supabase Auth):
  - `id` (uuid, primary key)
  - `email` (text)
  - Other auth-managed fields (e.g., `created_at`)
- **`FoodTrucks`**:
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to `Users.id`)
  - `subdomain` (text, unique)
  - `custom_domain` (text, nullable, unique)
  - `configuration` (jsonb): Stores website content and layout
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
  - `food_truck_id` (uuid, foreign key to `FoodTrucks.id`, nullable for global testimonials)
  - `content` (text)
  - `author` (text)
  - `approved` (boolean)
  - `created_at` (timestamp, default `now()`)
  - `updated_at` (timestamp, default `now()`)

#### RLS Policies
- **`FoodTrucks`**:
  - `SELECT`, `INSERT`, `UPDATE`, `DELETE`: `WHERE user_id = auth.uid()`
- **`Menus`, `Orders`, `Analytics`, `Testimonials`**:
  - `SELECT`, `INSERT`, `UPDATE`, `DELETE`: `WHERE food_truck_id IN (SELECT id FROM FoodTrucks WHERE user_id = auth.uid())`

### Security
- **Authentication**: Supabase Auth with email/password and social login; optional 2FA for admin logins.
- **Data Isolation**: Enforced via RLS at the database level.
- **Encryption**: Sensitive data (e.g., Stripe API keys) encrypted in Supabase.
- **SSL**: Automatic via Let’s Encrypt for subdomains and custom domains.

### Design Guidelines
- **Landing Page**: Clean, modern layout with bold typography and a focus on use cases.
- **Public-Facing Website**: Mobile-first, menu-centric design with interactive elements (e.g., swipeable/expandable menu cards).
- **Admin Dashboard**: Intuitive UI with a focus on usability (e.g., guided onboarding, checklist).

### Implementation Notes
- **Live Preview**: 
  - On the landing page, a hardcoded sample JSON is used for the demo.
  - In the admin dashboard, the `configuration` JSON from `FoodTrucks` is edited, with changes reflected in real-time using React state.
- **Real-Time Updates**: Supabase subscriptions (`supabase.channel`) handle order status changes and admin notifications.
- **Custom Domains**: Pro users update `custom_domain` via the admin dashboard; Vercel handles DNS and SSL.
- **Analytics**: Basic metrics (page views, orders) for all users; advanced trends (e.g., revenue over time) for Pro users.
- **Scalability**: Efficient queries and caching (e.g., via Next.js) to support growth.
- **Dependencies**: Install packages as needed (e.g., `@supabase/supabase-js`, `@stripe/stripe-js`, `react-json-editor-ajrm`, `chart.js`).

### Deployment
- Hosted on **Vercel** with:
  - Wildcard subdomain support (`*.foodtruckflow.com`).
  - Custom domain support for Pro users.
- Environment variables (e.g., `SUPABASE_URL`, `STRIPE_SECRET_KEY`) configured in Vercel.

### Future Considerations
- Mobile app for admin users (post-launch).
- Additional integrations (e.g., email marketing tools).

This context provides everything your AI agent needs to implement the `FoodTruckFlow.com` platform according to your step-by-step plan. It reflects the updated requirements and aligns with the features, security, and technology stack you’ve specified.