'use client';

import Image from 'next/image';

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[hsl(var(--admin-gradient-start)/0.15)] to-[hsl(var(--admin-gradient-end)/0.15)]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[hsl(var(--admin-foreground))]">What Our Customers Say</h2>
          <p className="mt-4 text-xl text-[hsl(var(--admin-foreground)/0.8)] max-w-3xl mx-auto">
            Join thousands of satisfied food truck owners who have transformed their business.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[hsl(var(--admin-card))] p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-[hsl(var(--admin-border))]">
            <div className="flex items-center mb-6">
              <div className="h-14 w-14 rounded-full bg-gray-200 overflow-hidden">
                <div className="relative w-full h-full">
                  <Image 
                    src="/images/testimonial-1.jpg" 
                    alt="Sarah Johnson" 
                    fill 
                    className="object-cover"
                    onError={(e) => {
                      // Hide the image if it fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-[hsl(var(--admin-foreground))]">Sarah Johnson</h4>
                <p className="text-[hsl(var(--admin-primary))]">Taco Truck Owner</p>
              </div>
            </div>
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-[hsl(var(--admin-primary))]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-[hsl(var(--admin-foreground)/0.8)]">
              "FoodTruckFlow has completely transformed my business. I've seen a 40% increase in orders since launching my website!"
            </p>
          </div>
          
          <div className="bg-[hsl(var(--admin-card))] p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-[hsl(var(--admin-border))]">
            <div className="flex items-center mb-6">
              <div className="h-14 w-14 rounded-full bg-gray-200 overflow-hidden">
                <div className="relative w-full h-full">
                  <Image 
                    src="/images/testimonial-2.jpg" 
                    alt="Mike Chen" 
                    fill 
                    className="object-cover"
                    onError={(e) => {
                      // Hide the image if it fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-[hsl(var(--admin-foreground))]">Mike Chen</h4>
                <p className="text-[hsl(var(--admin-primary))]">Pizza Truck Owner</p>
              </div>
            </div>
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-[hsl(var(--admin-primary))]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-[hsl(var(--admin-foreground)/0.8)]">
              "The online ordering system is seamless and my customers love it. Setting up was incredibly easy!"
            </p>
          </div>
          
          <div className="bg-[hsl(var(--admin-card))] p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-[hsl(var(--admin-border))]">
            <div className="flex items-center mb-6">
              <div className="h-14 w-14 rounded-full bg-gray-200 overflow-hidden">
                <div className="relative w-full h-full">
                  <Image 
                    src="/images/testimonial-3.jpg" 
                    alt="Lisa Rodriguez" 
                    fill 
                    className="object-cover"
                    onError={(e) => {
                      // Hide the image if it fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-[hsl(var(--admin-foreground))]">Lisa Rodriguez</h4>
                <p className="text-[hsl(var(--admin-primary))]">Ice Cream Truck Owner</p>
              </div>
            </div>
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-[hsl(var(--admin-primary))]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-[hsl(var(--admin-foreground)/0.8)]">
              "The analytics dashboard gives me insights I never had before. I can now make data-driven decisions for my business."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 