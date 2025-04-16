# Stripe Subscription Implementation Plan (Supabase + Theo's Principles)

**Goal:** Implement a robust Stripe subscription system using Supabase as the source of truth for subscription status within the app, triggered by user actions and kept in sync via webhooks, following Theo's principles outlined in `stripe.md`.

---

## Phase 1: Backend Setup

**Context Files:**
*   Environment variable configuration (`.env.local`, `.env.production`, or hosting provider settings)
*   Stripe Dashboard (for product/price creation)
*   Supabase Dashboard / Migration files (for schema changes)
*   `app/admin/clientQueries.ts` (to understand current user/truck data structure)

**Steps:**

1.  **Environment Variables:** Configure `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`.
2.  **Stripe Products & Prices:** Define "Basic" and "Pro" plans in Stripe Dashboard; note Price IDs.
3.  **Supabase Schema:**
    *   Add `stripe_customer_id` (TEXT, unique) to the primary user/food truck table.
    *   Create the `subscriptions` table:
        ```sql
        CREATE TABLE subscriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          stripe_customer_id TEXT REFERENCES food_trucks(stripe_customer_id) ON DELETE CASCADE NOT NULL,
          stripe_subscription_id TEXT UNIQUE,
          status TEXT, -- e.g., 'active', 'canceled', 'incomplete', etc.
          price_id TEXT,
          current_period_start TIMESTAMPTZ,
          current_period_end TIMESTAMPTZ,
          cancel_at_period_end BOOLEAN DEFAULT false,
          payment_method_brand TEXT,
          payment_method_last4 TEXT,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
        -- Add appropriate indexes, e.g., on stripe_customer_id, stripe_subscription_id
        ```
4.  **Stripe Utility Functions:**
    *   Create `lib/stripe/server.ts` (or similar): Initialize Stripe Node client.
    *   Implement `syncStripeDataToSupabase(stripeCustomerId: string)`:
        *   Find associated user in Supabase using the stripe_customer_id.
        *   Fetch latest `stripe.subscriptions.list(...)` data (expanded).
        *   `UPSERT` data into Supabase `subscriptions` table.
    *   Implement `getStripeCustomerIdFromUserId(userId: string)`:
        *   Fetch/create `stripe_customer_id` in Supabase user table.
        *   Return the customer ID for use in other functions.

---

## Phase 2: Backend Logic (Server Actions / API Routes)

**Context Files:**
*   `lib/stripe/server.ts` (for Stripe client & sync function)
*   `app/admin/account/subscribe/actions.ts` (existing actions)
*   Supabase client configuration/utilities
*   Authentication context/utilities (to get `userId`)

**Steps:**

1.  **Webhook Handler:**
    *   Create `app/api/webhooks/stripe/route.ts`:
        *   Receive POST requests.
        *   Verify signature (`stripe.webhooks.constructEvent`).
        *   Switch on `event.type` for relevant events (from `stripe.md`).
        *   Extract `customerId` from the event.
        *   Call `syncStripeDataToSupabase(customerId)`.
        *   Return appropriate HTTP response (e.g., 200).
    *   Configure endpoint in Stripe Dashboard.
2.  **Subscription Management Actions (Modify `app/admin/account/subscribe/actions.ts`):**
    *   **`updateSubscription(plan: string)`:**
        *   Get `userId`.
        *   Get/create `stripe_customer_id` using `getStripeCustomerIdFromUserId(userId)`.
        *   Get Price ID for `plan`.
        *   Create Stripe Checkout Session (`mode: 'subscription'`).
        *   Set `success_url` (e.g., `/admin/account/subscribe/success?session_id={CHECKOUT_SESSION_ID}`) and `cancel_url`.
        *   Return `{ sessionId: session.id }`.
    *   **`cancelSubscription()`:**
        *   Get `userId`.
        *   Get `stripe_customer_id` using `getStripeCustomerIdFromUserId(userId)`.
        *   Fetch `subscription_id` from Supabase `subscriptions`.
        *   Call `stripe.subscriptions.update(subscription_id, { cancel_at_period_end: true })`.
        *   Call `syncStripeDataToSupabase(stripe_customer_id)`.
    *   **(Optional) `createBillingPortalSession()`:**
        *   Get `userId`.
        *   Get `stripe_customer_id` using `getStripeCustomerIdFromUserId(userId)`.
        *   Create Stripe Billing Portal session.
        *   Return `{ url: portalSession.url }`.

---

## Phase 3: Frontend Integration

**Context Files:**
*   `app/admin/account/subscribe/client.tsx` (existing client component)
*   `app/admin/clientQueries.ts` (or wherever data fetching logic resides)
*   Stripe.js documentation (`loadStripe`, `redirectToCheckout`)

**Steps:**

1.  **Data Fetching:**
    *   Modify `getFoodTruck` or create `getSubscriptionData` to query Supabase `subscriptions` table via the `stripe_customer_id`.
    *   Update `SubscribeClient` to derive UI state (plan, status, dates) *only* from this Supabase data.
2.  **Subscription Flow (`SubscribeClient`):**
    *   Modify `handleSubscription`:
        *   Call `updateSubscriptionMutation`.
        *   On mutation success (receiving `sessionId`), use `loadStripe` and `stripe.redirectToCheckout({ sessionId })`.
3.  **Success Page:**
    *   Create `app/admin/account/subscribe/success/page.tsx`:
        *   Extract `session_id` from URL parameters.
        *   Retrieve session from Stripe to get customer ID.
        *   Call an API endpoint that triggers `syncStripeDataToSupabase(customerId)` for faster UI feedback.
        *   Display success message.
        *   Provide navigation back to `/admin/account`.
4.  **Cancellation Flow (`SubscribeClient`):**
    *   Ensure `handleCancelSubscription` calls `cancelSubscriptionMutation`. UI updates rely on query invalidation and refetching from Supabase.
5.  **(Optional) Manage Billing Button (`SubscribeClient`):**
    *   Add a new mutation calling `createBillingPortalSession`.
    *   On success, redirect (`window.location.href = data.url`).
    *   Enable the button when a subscription is active.

---

## Phase 4: Testing

**Context Files:**
*   Stripe Dashboard (Test Mode)
*   Stripe CLI
*   Your application (`client.tsx`, webhook handler logs, Supabase table data)

**Steps:**

1.  Use Stripe test mode keys and test cards.
2.  Test subscribe flow -> check Supabase data -> check UI.
3.  Test cancel flow -> check Supabase data (`cancel_at_period_end`) -> check UI.
4.  Use `stripe trigger <event_name>` (e.g., `invoice.payment_failed`, `customer.subscription.deleted`) to simulate webhook events.
5.  Verify webhook handler receives events, calls `syncStripeDataToSupabase`, and Supabase `subscriptions` table updates correctly.
6.  Verify UI always reflects the data present in the Supabase `subscriptions` table after syncs.

---