import { getFoodTruckData } from '@/lib/fetch-food-truck';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CartProvider } from '@/lib/cartContext';
import { Toaster } from '@/components/ui/sonner';
import FoodTruckNavbar from '@/components/FoodTruckNavbar';
import FoodTruckFooter from '@/components/FoodTruckFooter';

// Generate dynamic metadata
export async function generateMetadata({
  params
}: {
  params: { subdomain: string }
}): Promise<Metadata> {
  // Get the subdomain from the params
  const { subdomain } = await params;
  
  // Fetch the food truck data
  const foodTruck = await getFoodTruckData(subdomain);
  
  if (!foodTruck) {
    return {
      title: 'Food Truck Not Found',
    };
  }
  
  const config = foodTruck.configuration || {};
  const name = config.name || 'Food Truck';
  const tagline = config.tagline || 'Delicious food on wheels';
  
  return {
    title: name,
    description: tagline,
  };
}

export default async function FoodTruckLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params: { subdomain: string }
}) {
  // Get the subdomain from the params
  const { subdomain } = await params;
  
  // Fetch the food truck data
  const foodTruck = await getFoodTruckData(subdomain);
  
  // If no food truck is found, return 404
  if (!foodTruck) {
    notFound();
  }
  
  // Extract configuration data
  const config = foodTruck.configuration || {};
  
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <FoodTruckNavbar config={config} subdomain={subdomain} />
        <main className="flex-grow">
          {children}
        </main>
        <FoodTruckFooter config={config} subdomain={subdomain} />
      </div>
      <Toaster />
    </CartProvider>
  );
} 