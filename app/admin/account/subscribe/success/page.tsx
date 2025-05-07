import { stripe, syncStripeDataToSupabase } from '@/lib/stripe/server';
import { redirect } from 'next/navigation';

export default async function SubscribeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  // If no session ID, redirect back to account
  if (!sessionId) {
    redirect('/admin/account');
  }

  try {
    // Retrieve the session to get customer ID
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customerId = session.customer as string;

    // Sync the subscription data to Supabase
    if (customerId) {
      await syncStripeDataToSupabase(customerId);
    }

    // Return success UI
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Subscription Successful!</h1>
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Thank you for subscribing. Your account has been updated with your new subscription.
            </p>
            <p className="text-gray-700">
              You can manage your subscription at any time from your account dashboard.
            </p>
          </div>
          <div className="flex justify-center">
            <a
              href="/admin/account"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error processing subscription success:', error);
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">Something went wrong</h1>
          <p className="text-gray-700 mb-6">
            We encountered an error while processing your subscription. Please contact support if this issue persists.
          </p>
          <div className="flex justify-center">
            <a
              href="/admin/account"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }
} 