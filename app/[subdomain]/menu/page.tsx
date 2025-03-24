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
  const secondaryColor = config.secondaryColor || '#2EC4B6';
  
  // Create dynamic styles for the page
  const headerStyle = { color: primaryColor };
  const sectionBgStyle = { backgroundColor: `${secondaryColor}10` }; // Lighter background
  
  return (
    <div className="min-h-screen bg-white">
      {/* Spacer for navbar */}
      <div className="h-16"></div>
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Menu Header with Primary Color */}
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={headerStyle}>
            Our Menu
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Explore our delicious offerings and add your favorites to your order
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Cart Component for Mobile (shown above menu) */}
          <div className="w-full lg:hidden mb-6">
            <div 
              className="rounded-xl overflow-hidden" 
              style={{ 
                boxShadow: `0 4px 20px rgba(0, 0, 0, 0.1)`,
                border: `1px solid rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.1)`
              }}
            >
              <div className="p-4 border-b" style={{ backgroundColor: `${primaryColor}10` }}>
                <h2 className="text-xl font-bold" style={{ color: primaryColor }}>Your Order</h2>
              </div>
              <Cart foodTruckId={foodTruck.id} primaryColor={primaryColor} secondaryColor={secondaryColor} />
            </div>
          </div>
          
          {/* Menu Display Component with Primary & Secondary Colors */}
          <div className="w-full lg:w-3/4">
            <div className="rounded-xl overflow-hidden" style={{ boxShadow: `0 4px 20px rgba(0, 0, 0, 0.05)` }}>
              <div className="p-4 md:p-6 rounded-t-xl" style={sectionBgStyle}>
                <div className="flex items-center">
                  <Utensils className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                  <h2 className="text-2xl font-bold" style={{ color: secondaryColor }}>Menu Items</h2>
                </div>
              </div>
              
              <div className="p-4 md:p-6">
                <MenuDisplay items={menuItems} primaryColor={primaryColor} secondaryColor={secondaryColor} />
              </div>
            </div>
          </div>
          
          {/* Cart Component for Desktop (shown on right side) */}
          <div className="w-full lg:w-1/4 hidden lg:block">
            <div 
              className="sticky top-24 rounded-xl overflow-hidden" 
              style={{ 
                boxShadow: `0 4px 20px rgba(0, 0, 0, 0.1)`,
                border: `1px solid rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.1)`
              }}
            >
              <div className="p-4 border-b" style={{ backgroundColor: `${primaryColor}10` }}>
                <h2 className="text-xl font-bold" style={{ color: primaryColor }}>Your Order</h2>
              </div>
              <Cart foodTruckId={foodTruck.id} primaryColor={primaryColor} secondaryColor={secondaryColor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 