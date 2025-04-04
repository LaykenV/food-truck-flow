import { getFoodTruckData } from '@/lib/fetch-food-truck';
import { notFound } from 'next/navigation';
import { ShoppingCartDrawer } from '@/components/ShoppingCartDrawer';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { isScheduledOpenServer, getTodayScheduleServer } from "@/lib/schedule-utils-server";
import { OpenStatusProvider } from './open-status-provider';
import { ClientOrderForm } from './client-order-form';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Metadata } from 'next';

// Helper function to generate JSON-LD script tag
function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Type definitions for generating metadata
type Props = {
  params: { subdomain: string }
};

// Generate page-specific metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params;
  const foodTruck = await getFoodTruckData(subdomain);
  
  if (!foodTruck) {
    return {
      title: 'Order Page Not Found',
    };
  }
  
  const config = foodTruck.configuration || {};
  const truckName = config.name || 'Food Truck';
  
  return {
    title: `Order Online | ${truckName}`,
    description: `Place your order online and customize your selections from ${truckName}.`,
    openGraph: {
      title: `Order Online | ${truckName}`,
      description: `Order food online from ${truckName}. Fast, easy, and convenient ordering experience.`,
      type: 'website',
      url: `https://${subdomain}.foodtruckflow.com/order`,
      images: config.logoUrl ? [{ url: config.logoUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Order Online | ${truckName}`,
      description: `Order food online from ${truckName}. Fast, easy, and convenient ordering experience.`,
      images: config.logoUrl ? [config.logoUrl] : [],
    },
  };
}

// Create smaller skeleton components for specific sections
function OrderFormSkeleton() {
  return (
    <div className="w-full rounded-xl overflow-hidden shadow-sm border">
      <div className="p-4 md:p-6 border-b">
        <Skeleton className="h-7 w-36 mb-2" />
        <Skeleton className="h-5 w-60" />
      </div>
      <div className="p-4 md:p-6">
        <Skeleton className="h-10 w-full md:w-1/2 mb-4" />
        <Skeleton className="h-10 w-full md:w-1/2 mb-4" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

function ContactSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden shadow-md bg-gray-50">
      <div className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}

export default async function FoodTruckOrderPage({
  params
}: {
  params: { subdomain: string }
}) {
  // Get the subdomain from the params
  const { subdomain } = await params;
  
  // Fetch the food truck data using the cached function
  const foodTruck = await getFoodTruckData(subdomain);
  
  // If no food truck is found, return 404
  if (!foodTruck) {
    notFound();
  }
  
  // Check if the food truck is currently open
  const scheduleData = foodTruck.configuration?.schedule?.days || [];
  const todaySchedule = getTodayScheduleServer(scheduleData);
  const isCurrentlyOpen = isScheduledOpenServer(todaySchedule);
  
  // Extract configuration data
  const config = foodTruck.configuration || {};
  const primaryColor = config.primaryColor || '#FF6B35';
  const secondaryColor = config.secondaryColor || '#2EC4B6';
  
  // Create dynamic styles for the page
  const linkStyle = { color: primaryColor };
  const iconBgStyle = { backgroundColor: `${secondaryColor}25` };
  const iconStyle = { color: secondaryColor };
  const headingStyle = { color: primaryColor };
  const accentStyle = { color: secondaryColor };
  
  // Create FoodEstablishment schema for the order process
  const orderPageSchema = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "name": config.name || 'Food Truck',
    "image": config.logoUrl || config.bannerUrl,
    "url": `https://${subdomain}.foodtruckflow.com`,
    "servesCuisine": config.cuisineType || '',
    "potentialAction": {
      "@type": "OrderAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `https://${subdomain}.foodtruckflow.com/order`,
        "inLanguage": "en-US",
        "name": "Order Online"
      },
      "deliveryMethod": ["http://schema.org/OnSitePickup"],
      "availability": isCurrentlyOpen ? "http://schema.org/InStock" : "http://schema.org/OutOfStock"
    }
  };
  
  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Spacer for navbar */}
        <div className="h-16"></div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link 
              href={`/${subdomain}/menu`} 
              className="inline-flex items-center hover:underline transition-colors"
              style={linkStyle}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Menu
            </Link>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full" style={iconBgStyle}>
                <ShoppingBag className="h-5 w-5" style={iconStyle} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold" style={headingStyle}>
                Complete Your Order
              </h1>
            </div>
          </div>
        </div>
        
        {/* ShoppingCartDrawer for Mobile when open */}
        {isCurrentlyOpen && (
          <div className="lg:hidden">
            <ShoppingCartDrawer 
              foodTruckId={foodTruck.id} 
              primaryColor={primaryColor} 
              secondaryColor={secondaryColor} 
            />
          </div>
        )}
        
        {/* Order Content */}
        <div className="container mx-auto px-4 pb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3">
              <Suspense fallback={<OrderFormSkeleton />}>
                <OpenStatusProvider 
                  initialStatus={isCurrentlyOpen} 
                  initialSchedule={todaySchedule} 
                  foodTruckId={foodTruck.id}
                >
                  <ClientOrderForm 
                    foodTruck={foodTruck} 
                    subdomain={subdomain}
                  />
                </OpenStatusProvider>
              </Suspense>
            </div>
            
            {/* Need Help Section */}
            <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
              <Suspense fallback={<ContactSkeleton />}>
                <div 
                  className="rounded-xl overflow-hidden shadow-md"
                  style={{ backgroundColor: `${secondaryColor}08` }}
                >
                  <div className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <span style={iconStyle}>●</span>
                      <span style={headingStyle}>Need Help?</span>
                    </h3>
                    <p className="text-gray-600 mb-4">
                      If you have any questions about your order, please contact us:
                    </p>
                    <p className="text-gray-600">
                      {config.contact?.phone && (
                        <span className="block">Phone: <span style={{ color: secondaryColor }}>{config.contact.phone}</span></span>
                      )}
                      {config.contact?.email && (
                        <span className="block">Email: <span style={{ color: secondaryColor }}>{config.contact.email}</span></span>
                      )}
                    </p>
                  </div>
                </div>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      
      {/* JSON-LD structured data */}
      <JsonLdScript data={orderPageSchema} />
    </>
  );
} 