import { getFoodTruckData } from '@/lib/fetch-food-truck';
import { notFound } from 'next/navigation';
import { MenuDisplay } from '@/components/MenuDisplay';
import { Cart } from '@/components/Cart';
import { ShoppingCartDrawer } from '@/components/ShoppingCartDrawer';
import { Utensils } from 'lucide-react';
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
      title: 'Menu Not Found',
    };
  }
  
  const config = foodTruck.configuration || {};
  const truckName = config.name || 'Food Truck';
  
  return {
    title: `Menu | ${truckName}`,
    description: `Explore the delicious menu and order online from ${truckName}.`,
    openGraph: {
      title: `Menu | ${truckName}`,
      description: `Explore our delicious menu and place your order online from ${truckName}.`,
      type: 'website',
      url: `https://${subdomain}.foodtruckflow.com/menu`,
      images: config.logoUrl ? [{ url: config.logoUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Menu | ${truckName}`,
      description: `Explore our delicious menu and place your order online from ${truckName}.`,
      images: config.logoUrl ? [config.logoUrl] : [],
    },
  };
}

// Skeleton components for Suspense
function MenuDisplaySkeleton() {
  return (
    <div className="space-y-6">
      {/* Mobile View Skeleton */}
      <div className="space-y-10 lg:hidden">
        {[1, 2].map((category) => (
          <div key={category} className="space-y-4">
            <Skeleton className="h-7 w-32 mb-2" />
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-[250px] flex-shrink-0">
                  <div className="rounded-md overflow-hidden border h-full flex flex-col">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-3">
                      <Skeleton className="h-5 w-3/4 mb-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Desktop View Skeleton */}
      <div className="hidden lg:block">
        <div className="mb-4 flex space-x-1 overflow-x-auto pb-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-md" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-md overflow-hidden border h-full flex flex-col">
              <Skeleton className="aspect-square w-full" />
              <div className="p-3">
                <Skeleton className="h-5 w-3/4 mb-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="w-full sticky top-24 rounded-xl overflow-hidden shadow-sm border">
      <div className="p-4 border-b bg-gray-50">
        <Skeleton className="h-6 w-28" />
      </div>
      <div className="p-4">
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export default async function FoodTruckMenuPage({
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
  
  // Get menu items from the foodTruck data and filter to only show active ones
  const allMenuItems = foodTruck.menuItems || [];
  const menuItems = allMenuItems.filter(item => item.active !== false); // Show if active is true or undefined (for backward compatibility)
  
  // Extract configuration data
  const config = foodTruck.configuration || {};
  const primaryColor = config.primaryColor || '#FF6B35';
  const secondaryColor = config.secondaryColor || '#2EC4B6';
  
  // Create dynamic styles for the page
  const headerStyle = { color: primaryColor };
  const sectionBgStyle = { backgroundColor: `${secondaryColor}10` }; // Lighter background
  
  // Create Menu schema JSON-LD data
  // Group items by category for menu sections
  const menuSections = menuItems.reduce((acc: any[], item) => {
    const existingSection = acc.find(section => section.name === item.category);
    
    if (existingSection) {
      existingSection.hasMenuItem.push({
        "@type": "MenuItem",
        "name": item.name,
        "description": item.description || '',
        "offers": {
          "@type": "Offer",
          "price": item.price.toFixed(2),
          "priceCurrency": "USD"
        },
        "image": item.image || (item as any).image_url || '',
      });
    } else {
      acc.push({
        "@type": "MenuSection",
        "name": item.category,
        "hasMenuItem": [{
          "@type": "MenuItem",
          "name": item.name,
          "description": item.description || '',
          "offers": {
            "@type": "Offer",
            "price": item.price.toFixed(2),
            "priceCurrency": "USD"
          },
          "image": item.image || (item as any).image_url || '',
        }]
      });
    }
    
    return acc;
  }, []);
  
  const menuSchema = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "name": `${config.name || 'Food Truck'} Menu`,
    "url": `https://${subdomain}.foodtruckflow.com/menu`,
    "hasMenuSection": menuSections
  };
  
  return (
    <>
      <div className="min-h-screen">
        {/* Spacer for navbar */}
        <div className="h-16"></div>
        
        <div className="container mx-auto px-4 md:py-8 pb-20 lg:pb-8">
          
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* ShoppingCartDrawer for Mobile */}
            <div className="lg:hidden">
              <ShoppingCartDrawer 
                foodTruckId={foodTruck.id} 
                primaryColor={primaryColor} 
                secondaryColor={secondaryColor} 
              />
            </div>
            
            {/* Menu Display Component with Primary & Secondary Colors */}
            <div className="w-full lg:w-3/4 bg-background rounded-xl">
              <div className="rounded-xl overflow-hidden" style={{ boxShadow: `0 4px 20px rgba(0, 0, 0, 0.05)` }}>
                <div className="p-4 md:p-6 rounded-t-xl" style={sectionBgStyle}>
                  <div className="flex items-center">
                    <Utensils className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                    <h2 className="text-2xl font-bold" style={{ color: secondaryColor, opacity: '0.9' }}>Menu Items</h2>
                  </div>
                </div>
                
                <div className="p-4 md:p-6">
                  <Suspense fallback={<MenuDisplaySkeleton />}>
                    <MenuDisplay items={menuItems} primaryColor={primaryColor} secondaryColor={secondaryColor} />
                  </Suspense>
                </div>
              </div>
            </div>
            
            {/* Cart Component for Desktop (shown on right side) */}
            <div className="w-full lg:w-1/4 hidden lg:block">
              <Suspense fallback={<CartSkeleton />}>
                <div 
                  className="sticky top-24 rounded-xl overflow-hidden" 
                  style={{ 
                    boxShadow: `0 4px 20px rgba(0, 0, 0, 0.1)`,
                    border: `1px solid rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.1)`
                  }}
                >
                  <div className="p-4 border-b" style={{ backgroundColor: `${primaryColor}10` }}>
                    <h2 className="text-xl font-bold" style={{ color: primaryColor, opacity: '0.9' }}>Your Order</h2>
                  </div>
                  <Cart foodTruckId={foodTruck.id} primaryColor={primaryColor} secondaryColor={secondaryColor} />
                </div>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      
      {/* JSON-LD structured data */}
      <JsonLdScript data={menuSchema} />
    </>
  );
} 