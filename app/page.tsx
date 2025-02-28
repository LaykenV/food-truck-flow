'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { handleAuthFromUrl } from '../lib/auth';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  // Check for auth in URL on page load
  useEffect(() => {
    const checkAuthFromUrl = async () => {
      try {
        // Handle case where user is redirected with auth params in URL
        const session = await handleAuthFromUrl();
        if (session) {
          router.push('/admin');
        }
      } catch (err) {
        console.error('Error checking auth from URL:', err);
      }
    };

    // Only run this if we have a hash in the URL
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token')) {
      checkAuthFromUrl();
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
              Simplify Your <span className="text-indigo-600">Food Truck</span> Business
            </h1>
            <p className="text-xl text-gray-500 mb-8 leading-relaxed">
              FoodTruckFlow helps you manage your schedule, menu, and online presence all in one place. 
              Grow your business, attract more customers, and focus on what matters - your amazing food.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition duration-300"
              >
                Start Now - It&apos;s Free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-300"
              >
                Log In
              </Link>
            </div>
          </div>
          <div className="relative h-64 sm:h-80 lg:h-96">
            {/* This is a placeholder - replace with actual image in a real implementation */}
            <div className="absolute inset-0 bg-indigo-100 rounded-xl flex items-center justify-center shadow-lg">
              <div className="text-indigo-600 font-bold text-xl">
                Food Truck Dashboard Preview
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything You Need to Run Your Food Truck
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              FoodTruckFlow provides powerful, easy-to-use tools to manage all aspects of your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-md flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Menu Management</h3>
              <p className="text-gray-600">
                Create beautiful digital menus, update prices or availability in real-time, and showcase your special items.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-md flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Schedule Manager</h3>
              <p className="text-gray-600">
                Plan your locations and events, share your schedule with customers, and never miss a busy spot.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-md flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Online Ordering</h3>
              <p className="text-gray-600">
                Accept pre-orders, manage pickup times, and process payments securely through our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to grow your food truck business?
          </h2>
          <p className="mt-4 text-xl text-indigo-100 max-w-3xl mx-auto">
            Join thousands of food truck owners who have simplified their business operations with FoodTruckFlow.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl transition duration-300"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-8 py-3 border border-indigo-100 text-base font-medium rounded-md text-white hover:bg-indigo-700 transition duration-300"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4">FoodTruckFlow</h3>
            <p className="text-gray-400">
              The ultimate platform for food truck owners to create and manage their online presence.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Menu Management</li>
              <li>Location Tracking</li>
              <li>Customer Engagement</li>
              <li>Order Processing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white">Blog</Link></li>
              <li><Link href="#" className="hover:text-white">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>© {new Date().getFullYear()} FoodTruckFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
