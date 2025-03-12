import { getFoodTruckData } from '@/lib/fetch-food-truck';
import { getMenuItems } from '@/lib/getMenuItems';
import { notFound } from 'next/navigation';
import { MenuDisplay } from '@/components/MenuDisplay';
import { Cart } from '@/components/Cart';
import { Utensils } from 'lucide-react';

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
  
  // Fetch menu items for this food truck
  const menuItems = await getMenuItems(foodTruck.id);
  
  // Extract configuration data
  const config = foodTruck.configuration || {};
  const primaryColor = config.primaryColor || '#FF6B35';
  
  return (
    <div className="bg-white">
      {/* Spacer for navbar */}
      <div className="h-16"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Menu Header */}
          <div className="w-full md:w-3/4">
            <div className="flex items-center mb-6">
              <Utensils className="h-6 w-6 text-orange-500 mr-2" />
              <h1 className="text-3xl font-bold">Our Menu</h1>
            </div>
            
            {/* Menu Display Component */}
            <div className="mb-8">
              <MenuDisplay items={menuItems} primaryColor={primaryColor} />
            </div>
          </div>
          
          {/* Cart Component */}
          <div className="w-full md:w-1/4">
            <div className="sticky top-24 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 pb-4 border-b">Your Order</h2>
              <Cart foodTruckId={foodTruck.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 