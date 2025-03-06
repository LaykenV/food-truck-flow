import { getFoodTruckData } from '@/lib/fetch-food-truck';
import { notFound } from 'next/navigation';
import { Cart } from '@/components/Cart';
import { OrderForm } from '@/components/OrderForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

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
  
  // Extract configuration data
  const config = foodTruck.configuration || {};
  const primaryColor = config.primaryColor || '#FF6B35';
  
  return (
    <div className="bg-white">
      {/* Spacer for navbar */}
      <div className="h-16"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/${subdomain}/menu`} className="inline-flex items-center text-orange-500 hover:text-orange-600">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Menu
          </Link>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <ShoppingBag className="h-5 w-5 text-orange-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Complete Your Order</h1>
          </div>
        </div>
      </div>
      
      {/* Order Content */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6 pb-4 border-b">Delivery Information</h2>
              <OrderForm 
                foodTruckId={foodTruck.id} 
                subdomain={subdomain}
              />
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6 pb-4 border-b">Order Summary</h2>
              <Cart foodTruckId={foodTruck.id} />
            </div>
            
            {/* Additional Information */}
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-4">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about your order, please contact us:
              </p>
              <p className="text-gray-600">
                {config.contact?.phone && (
                  <span className="block">Phone: {config.contact.phone}</span>
                )}
                {config.contact?.email && (
                  <span className="block">Email: {config.contact.email}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 