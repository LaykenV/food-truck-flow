# Food Truck Flow Order System

This document explains how the order system works in Food Truck Flow and provides guidance for future Stripe integration.

## Current Implementation

### Database Schema

The Orders table has the following structure:

```sql
CREATE TABLE Orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_truck_id UUID REFERENCES FoodTrucks(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'preparing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('preparing', 'ready', 'completed'))
);
```

### Order Flow

1. **Cart Management**:
   - Users add items to their cart using the `CartProvider` context.
   - Cart state is persisted in localStorage.

2. **Real-time Open Status**:
   - The system uses Supabase Realtime subscriptions to monitor food truck availability.
   - The `OpenStatusProvider` component subscribes to changes in the food truck's status.
   - When a food truck owner updates their schedule or status, customers see these changes immediately.
   - Initial open status is calculated server-side and passed to the client for immediate display.
   - No polling or periodic API calls are needed, reducing server load and improving responsiveness.

3. **Order Placement**:
   - User fills out the order form with their name and email.
   - The form submits to the `/api/orders` endpoint.
   - The API creates a new order in the database with status 'preparing'.
   - The order ID is stored in a cookie (`activeOrders`) with an expiration time for tracking.
   - A custom event (`orderStatusUpdate`) is triggered to notify the OrderStatusTracker.

4. **Order Confirmation**:
   - User is redirected to the order confirmation page.
   - The page displays the order status and updates in real-time using Supabase subscriptions.

5. **Order Status Tracking**:
   - The `OrderStatusTracker` component displays the current order status on all pages.
   - It appears as a floating widget if the user has active orders (stored in cookies).
   - Status updates in real-time using Supabase subscriptions.
   - Users can minimize/maximize the tracker or dismiss it entirely.
   - When multiple orders are active, users can switch between them.
   - The tracker maintains a smooth UI experience with loading states when switching between orders.
   - Orders are automatically removed from tracking when they expire (24 hours by default).
   - Completed orders have their expiry time extended to 1 hour from completion.

6. **Order Management**:
   - Food truck owners can view and update order status in the admin dashboard.
   - Status updates trigger real-time updates for customers via Supabase subscriptions.
   - Owners can mark orders as "ready" or "completed" with a single click.

### API Endpoints

- `POST /api/orders`: Create a new order
- `GET /api/orders/[id]`: Get order details
- `PATCH /api/orders/[id]`: Update order status

### Key Components

1. **OpenStatusProvider**:
   - Uses Supabase Realtime to monitor food truck availability in real-time
   - Subscribes to changes in the FoodTrucks table for the specific food truck
   - Provides open/closed status via React context
   - Initializes with server-side calculated status for immediate display

2. **OrderForm**:
   - Handles order submission and validation
   - Manages the activeOrders cookie for order tracking
   - Triggers the orderStatusUpdate event

3. **OrderStatusTracker**:
   - Displays current order status in a floating widget
   - Supports multiple active orders with easy switching
   - Uses Supabase real-time subscriptions for live updates
   - Provides smooth UI transitions with loading states
   - Can be minimized or dismissed by the user

4. **Order Confirmation Page**:
   - Displays detailed order information
   - Shows real-time status updates
   - Provides navigation back to the menu or home page

## Future Stripe Integration

To integrate Stripe payments, follow these steps:

1. **Update FoodTrucks Table**:
   - Ensure the `stripe_api_key` field is encrypted in the database.
   - Add a `stripe_account_id` field if you want to use Stripe Connect.

2. **Install Stripe SDK**:
   ```bash
   npm install stripe @stripe/stripe-js
   ```

3. **Update Order API**:
   - Uncomment the Stripe integration code in `/api/orders/route.ts`.
   - Create a new API endpoint for handling Stripe webhooks.

4. **Implementation Steps**:
   - Get the food truck's Stripe API key from the database.
   - Create a Stripe payment intent using the food truck's API key.
   - Return the client secret to the frontend.
   - Process the payment on the frontend using Stripe Elements.
   - On successful payment, create the order in the database.

5. **Stripe Connect (Optional)**:
   - If using Stripe Connect, create a Stripe account for each food truck.
   - Use the platform account to create payments on behalf of the connected accounts.
   - Handle payouts and fees automatically through Stripe.

### Example Stripe Integration Code

```typescript
// Backend (API route)
import Stripe from 'stripe';

// Get the food truck's Stripe API key
const { data: foodTruck } = await supabase
  .from('FoodTrucks')
  .select('stripe_api_key')
  .eq('id', food_truck_id)
  .single();

if (!foodTruck?.stripe_api_key) {
  return NextResponse.json(
    { error: 'Food truck is not configured for payments' },
    { status: 400 }
  );
}

// Initialize Stripe with the food truck's API key
const stripe = new Stripe(foodTruck.stripe_api_key);

// Create a payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(total_amount * 100), // Convert to cents
  currency: 'usd',
  metadata: {
    food_truck_id,
    customer_name,
    customer_email
  }
});

// Return the client secret to the frontend
return NextResponse.json({ 
  clientSecret: paymentIntent.client_secret 
});
```

```typescript
// Frontend (OrderForm component)
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Payment form component
function PaymentForm({ clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: formData.name,
          email: formData.email,
        },
      },
    });
    
    if (error) {
      console.error(error);
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Pay</button>
    </form>
  );
}

// Wrap the form in Stripe Elements
function StripePaymentForm(props) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}
```

## Security Considerations

1. **API Keys**:
   - Never expose Stripe API keys in the frontend.
   - Store API keys securely in the database (encrypted).
   - Use environment variables for your platform's Stripe keys.

2. **Webhooks**:
   - Implement Stripe webhooks to handle payment events.
   - Verify webhook signatures to prevent tampering.

3. **Error Handling**:
   - Implement proper error handling for payment failures.
   - Provide clear feedback to users when payments fail.

4. **Testing**:
   - Use Stripe test mode for development and testing.
   - Test various payment scenarios (success, failure, etc.).

## UX Considerations

1. **Order Status Tracking**:
   - Provide clear visual feedback for status changes.
   - Use loading indicators when fetching or updating status.
   - Allow users to easily access order details from the tracker.
   - Support multiple active orders with intuitive switching.

2. **Error States**:
   - Handle network errors gracefully.
   - Provide clear error messages when operations fail.
   - Offer retry options when appropriate.

3. **Accessibility**:
   - Ensure all components are keyboard navigable.
   - Include proper ARIA attributes for screen readers.
   - Maintain sufficient color contrast for status indicators.

## Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe.js and Elements](https://stripe.com/docs/js)
- [Stripe Connect](https://stripe.com/docs/connect)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) 