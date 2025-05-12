import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { syncStripeDataToSupabase } from '@/lib/stripe/server';
import Stripe from 'stripe';

// Initialize Stripe with webhook secret
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE as string;

export async function POST(req: NextRequest) {
  try {
    console.log('Received webhook request');
    // Get the signature from headers - using the proper headers() API
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify the event
    const body = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`Received webhook event: ${event.type}`);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    const allowedEvents: Stripe.Event.Type[] = [
        "checkout.session.completed",
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "customer.subscription.paused",
        "customer.subscription.resumed",
        "customer.subscription.pending_update_applied",
        "customer.subscription.pending_update_expired",
        "customer.subscription.trial_will_end",
        "invoice.paid",
        "invoice.payment_failed",
        "invoice.payment_action_required",
        "invoice.upcoming",
        "invoice.marked_uncollectible",
        "invoice.payment_succeeded",
        "payment_intent.succeeded",
        "payment_intent.payment_failed",
        "payment_intent.canceled",
      ];

    if (!allowedEvents.includes(event.type)) {
        console.log(`Unhandled event type: ${event.type}`);
        return NextResponse.json({ received: true }, { status: 200 });
    }

    // All the events I track have a customerId
    const { customer: customerId } = event?.data?.object as {
        customer: string; // Sadly TypeScript does not know this
    };

    console.log(`Event: ${JSON.stringify(event.data.object)}`);

    console.log(`Customer ID: ${customerId}`);

    if (typeof customerId !== 'string') {
        console.error('Customer ID is not a string');
        return NextResponse.json({ error: 'Customer ID is not a string' }, { status: 400 });
    }

    // Sync data if we have a customerId
    if (customerId) {
      await syncStripeDataToSupabase(customerId);
      console.log(`Successfully synced Stripe data for customer: ${customerId}`);
    } else {
      console.log(`No customer ID found for event: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error(`Error processing webhook: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook error: ${error.message}` },
      { status: 500 }
    );
  }
} 