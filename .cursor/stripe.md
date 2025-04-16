Survey Note: Detailed Implementation of Stripe Subscriptions with Supabase
This section provides a comprehensive analysis of implementing Stripe subscriptions following Theo's recommendations, adapted for use with Supabase, based on the content from Theo's GitHub repository stripe-recommendations. The repository, updated as of recent discussions, outlines a strategy to manage Stripe integrations effectively, focusing on avoiding the "split brain" issue by maintaining a centralized source of truth for subscription data. While Theo recommends using a KV store like Redis (specifically mentioning Upstash), this note explores how to adapt this approach for Supabase, given the user's existing infrastructure.
Background and Context
Theo's repository, titled "How to implement Stripe without going mad," addresses the challenges of integrating Stripe, particularly with its 258 event types and potential for out-of-order webhooks. The strategy involves syncing all Stripe customer data to a local store using a single function, syncStripeDataToKV, to prevent race conditions and ensure consistency. Discussions on platforms like Reddit (r/nextjs and r/webdev) highlight that Theo's approach centralizes subscription data, reducing reliance on Stripe's potentially unreliable updates. Given the user's current use of Supabase, a PostgreSQL-based backend, we evaluate whether to introduce a KV store or adapt the strategy to use Supabase.
Database Choice: KV Store vs. Supabase
Theo explicitly recommends using a KV store, such as Redis via Upstash, for its speed and simplicity in caching subscription data. The function result details using syncStripeDataToKV(customerId: string) to store fields like subscriptionId, status, and payment method details, with 15 specific Stripe events triggering updates (e.g., checkout.session.completed, customer.subscription.updated). However, Supabase, as a relational database, offers advantages for projects already integrated with it, such as easier querying for related data and real-time capabilities.
Given the user's existing Supabase setup, introducing a KV store like Redis would add complexity to the stack. Instead, we can adapt Theo's approach by storing subscription data in a Supabase table, maintaining the centralized source of truth. This is feasible because a database can handle key-value-like storage through tables and rows, and Supabase's PostgreSQL supports the necessary operations for syncing and querying subscription data.
Detailed Implementation Steps
To implement Stripe subscriptions with Theo's advice using Supabase, follow these steps, which mirror Theo's flow but adapt for a relational database:
1. Set Up Stripe and API Keys
Obtain your STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY from the Stripe dashboard.

Define your subscription products and prices in Stripe, ensuring you have price_ids for each plan.

2. Database Schema in Supabase
Update your users table to include a stripe_customer_id column to store the Stripe customer ID for each user.

Create a subscriptions table with the following structure, based on Theo's recommended fields:

Column

Type

Description

id

UUID

Primary key

stripe_customer_id

TEXT

Stripe customer ID

subscription_id

TEXT

Stripe subscription ID

status

TEXT

Subscription status (e.g., 'active')

price_id

TEXT

Stripe price ID

current_period_start

TIMESTAMP

Start of current billing period

current_period_end

TIMESTAMP

End of current billing period

cancel_at_period_end

BOOLEAN

Whether subscription cancels at period end

payment_method_brand

TEXT

Payment method brand (e.g., 'Visa')

payment_method_last4

TEXT

Last 4 digits of payment method

This table mirrors the data Theo stores in KV, ensuring compatibility with his sync function.
3. Implement the Sync Function
Create two functions: getStripeCustomerIdFromUserId(userId: string) and syncStripeDataToSupabase(stripeCustomerId: string):

The getStripeCustomerIdFromUserId function:
- Retrieves the stripe_customer_id from the users table for the given userId
- If no stripe_customer_id exists, creates a new Stripe customer and updates the users table
- Returns the stripe_customer_id

The syncStripeDataToSupabase function:
- Fetches the latest subscription data using stripe.subscriptions.list({ customer: stripeCustomerId, limit: 1, status: 'all', expand: ['data.default_payment_method'] }), as recommended by Theo
- Updates or inserts the subscription data into the subscriptions table, associating it with the stripe_customer_id
- Uses UPSERT operations to handle updates

This approach keeps the sync function directly aligned with Theo's recommendation by working with the Stripe customer ID rather than trying to map to internal user IDs within the sync function itself.
4. Handle Checkout Flow
When a user clicks "Subscribe," call an endpoint (e.g., "generate-stripe-checkout") that:
- Gets userId from the auth context
- Calls getStripeCustomerIdFromUserId(userId) to get or create a Stripe customer ID
- Creates a Stripe checkout session with the appropriate price_id and sets the success URL to /success, as per Theo's flow
- Returns the session ID to the frontend, which redirects the user to Stripe's checkout page

After payment, the user is redirected to /success. On this page:
- Extract the session_id from URL parameters
- Retrieve the Stripe session to get the customer ID
- Call an API endpoint that triggers syncStripeDataToSupabase(stripeCustomerId) for immediate data sync

5. Set Up Stripe Webhooks
Configure Stripe to send webhooks to your server for the 15 relevant events listed by Theo:
checkout.session.completed

customer.subscription.created

customer.subscription.updated

customer.subscription.deleted

customer.subscription.paused

customer.subscription.resumed

customer.subscription.pending_update_applied

customer.subscription.pending_update_expired

customer.subscription.trial_will_end

invoice.paid

invoice.payment_failed

invoice.payment_action_required

invoice.upcoming

invoice.marked_uncollectible

invoice.payment_succeeded

payment_intent.succeeded

payment_intent.payment_failed

payment_intent.canceled

In your webhook handler, verify the event signature, extract the customerId from the event, and call syncStripeDataToSupabase(customerId) to update the subscription data.

6. Access Control and Feature Gating
Use Supabase queries to check subscription status for feature access. For example, query the subscriptions table using the stripe_customer_id to see if a user has an active subscription (status = 'active' and current_period_end > NOW()).

This leverages Supabase's querying capabilities, which may be more flexible than a KV store for complex access rules.

Additional Recommendations and Pro Tips
Theo's repository includes "Pro Tips" that are relevant:
Disable "Cash App Pay" in Stripe, as it has over 90% cancellation rates.

Enable "Limit customers to one subscription" to prevent double checkouts, as detailed in Stripe's documentation.

These settings can be configured in your Stripe dashboard to improve the user experience and reduce errors.
Considerations and Limitations
While adapting Theo's KV-based approach to Supabase is feasible, consider the following:
Performance: KV stores like Redis are optimized for fast reads and writes, which might be beneficial for high-frequency subscription checks. Supabase, while slower, offers relational querying and real-time features that may be advantageous for your use case.

Complexity: Using Supabase avoids introducing another service (e.g., Redis), simplifying deployment and maintenance.

Data Relationships: If you need to relate subscription data to other tables (e.g., usage logs), Supabase's relational model is more suitable.

Given these factors, using Supabase is likely the best choice for your project, aligning with Theo's philosophy while leveraging your existing stack.
Conclusion
By following the above steps, you can implement Stripe subscriptions using Supabase, adhering to Theo's recommendations for maintaining a centralized source of truth. This approach ensures reliability and consistency, adapting his KV store strategy to fit your PostgreSQL-based backend. For further details, refer to the code examples and discussions in Theo's repository, adjusting for Supabase's API and features.

