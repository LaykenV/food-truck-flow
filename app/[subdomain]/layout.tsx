import { getFoodTruckData, getFoodTruckDataByUserId } from '@/lib/fetch-food-truck';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CartProvider } from '@/lib/cartContext';
import { Toaster } from '@/components/ui/sonner';
import FoodTruckNavbar from '@/components/FoodTruckTemplate/FoodTruckNavbar';
import { trackPageView } from '@/lib/track-page-view';
import { OrderStatusTrackerWrapper } from '@/components/OrderStatusTrackerWrapper';
import { createClient } from '@/utils/supabase/server';

// Helper function to generate JSON-LD script tag
function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Generate dynamic metadata
export async function generateMetadata({
  params
}: {
  params: Promise<{ subdomain: string }>
}): Promise<Metadata> {
  // Get the subdomain from the params
  const { subdomain } = await params;
  
  // Fetch the food truck data
  let foodTruck = await getFoodTruckData(subdomain);
  
  if (!foodTruck) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const foodTruckByUserId = await getFoodTruckDataByUserId(user.id);
      if (foodTruckByUserId) {
        foodTruck = foodTruckByUserId;
      } else {
        notFound();
      }
    } else {
      notFound();
    }
  }
  
  const config = foodTruck?.configuration || {};
  console.log('Config:', config);
  const name = config.name || 'Food Truck';
  const tagline = config.tagline || 'Delicious food on wheels';
  
  return {
    title: name,
    description: tagline,
    openGraph: {
      title: name,
      description: tagline,
      type: 'website',
      url: `https://${subdomain}.foodtruckflow.com`,
      images: config.logoUrl ? [{ url: config.logoUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description: tagline,
      images: config.logoUrl ? [config.logoUrl] : [],
    },
  };
}

export default async function FoodTruckLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params: Promise<{ subdomain: string }>
}) {
  // Get the subdomain from the params
  const { subdomain } = await params;
  
  // Fetch the food truck data
  let foodTruck = await getFoodTruckData(subdomain);
  
  // If no food truck is found, try to get it by user id
  if (!foodTruck) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const foodTruckByUserId = await getFoodTruckDataByUserId(user.id);
      if (foodTruckByUserId) {
        console.log('Food truck found by user id');
        foodTruck = foodTruckByUserId;
      } else {
        notFound();
      }
    } else {
      notFound();
    }
  }

  if (!foodTruck) {
    notFound();
  }
  
  // Track page view for analytics
  if (foodTruck.id) {
    // Use Promise.allSettled to avoid blocking the page render if tracking fails
    Promise.allSettled([trackPageView(foodTruck.id)])
      .catch(error => {
        // Log error but don't block page rendering
        console.error('Error tracking page view:', error);
      });
  }
  
  // Extract configuration data
  const config = foodTruck.configuration || {};
  
  // Create Restaurant Schema.org structured data
  const restaurantSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": config.name || 'Food Truck',
    "image": config.logoUrl || config.bannerUrl,
    "url": `https://${subdomain}.foodtruckflow.com`,
    "description": config.tagline || 'Delicious food on wheels',
    "servesCuisine": config.cuisineType || '',
    "telephone": config.contact?.phone || '',
    "email": config.contact?.email || '',
    "priceRange": config.priceRange || '$$',
  };
  
  // Add opening hours if available
  if (config.schedule?.days && config.schedule.days.length > 0) {
    const openingHoursSpec = config.schedule.days.map((day: any) => {
      if (!day.isOpen) return null;
      
      return {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": day.day,
        "opens": day.openTime,
        "closes": day.closeTime
      };
    }).filter(Boolean);
    
    if (openingHoursSpec.length > 0) {
      restaurantSchema.openingHoursSpecification = openingHoursSpec;
    }
  }
  
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#f0f0f0]">
        <FoodTruckNavbar config={config} subdomain={subdomain} displayMode="live" />
        <main className="flex-grow">
          {children}
        </main>
        
        {/* Order Status Tracker */}
        <OrderStatusTrackerWrapper
          primaryColor={config.primaryColor}
          secondaryColor={config.secondaryColor}
        />
      </div>
      <Toaster />
      
      {/* JSON-LD structured data */}
      <JsonLdScript data={restaurantSchema} />
    </CartProvider>
  );
} 