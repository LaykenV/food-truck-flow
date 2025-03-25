import { getFoodTruckData } from '@/lib/fetch-food-truck';
import { notFound } from 'next/navigation';
import { Cart } from '@/components/Cart';
import { OrderForm } from '@/components/OrderForm';
import { ShoppingCartDrawer } from '@/components/ShoppingCartDrawer';
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
  const secondaryColor = config.secondaryColor || '#2EC4B6';
  
  // Create dynamic styles for the page
  const sectionBgStyle = { backgroundColor: `${secondaryColor}10` };
  const linkStyle = { color: primaryColor };
  const iconBgStyle = { backgroundColor: `${secondaryColor}25` };
  const iconStyle = { color: secondaryColor };
  const headingStyle = { color: primaryColor };
  const accentStyle = { color: secondaryColor };
  
  return (
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
              Complete Your <span style={accentStyle}>Order</span>
            </h1>
          </div>
        </div>
      </div>
      
      {/* ShoppingCartDrawer for Mobile */}
      <div className="lg:hidden">
        <ShoppingCartDrawer 
          foodTruckId={foodTruck.id} 
          primaryColor={primaryColor} 
          secondaryColor={secondaryColor} 
        />
      </div>
      
      {/* Order Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div>
            <div 
              className="rounded-xl overflow-hidden shadow-md"
              style={{ 
                boxShadow: `0 4px 20px rgba(0, 0, 0, 0.08)`,
                border: `1px solid rgba(${parseInt(secondaryColor.slice(1, 3), 16)}, ${parseInt(secondaryColor.slice(3, 5), 16)}, ${parseInt(secondaryColor.slice(5, 7), 16)}, 0.2)`
              }}
            >
              <div className="p-6 border-b" style={sectionBgStyle}>
                <h2 className="text-xl font-bold" style={headingStyle}>Delivery Information</h2>
              </div>
              <div className="p-6">
                <OrderForm 
                  foodTruckId={foodTruck.id} 
                  subdomain={subdomain}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              </div>
            </div>
          </div>
          
          {/* Order Summary - Hidden on mobile (since we use drawer) */}
          <div className="hidden lg:block">
            <div 
              className="rounded-xl overflow-hidden shadow-md"
              style={{ 
                boxShadow: `0 4px 20px rgba(0, 0, 0, 0.08)`,
                border: `1px solid rgba(${parseInt(secondaryColor.slice(1, 3), 16)}, ${parseInt(secondaryColor.slice(3, 5), 16)}, ${parseInt(secondaryColor.slice(5, 7), 16)}, 0.2)`
              }}
            >
              <div className="p-6 border-b" style={sectionBgStyle}>
                <h2 className="text-xl font-bold" style={headingStyle}>Order Summary</h2>
              </div>
              <div className="p-0">
                <Cart 
                  foodTruckId={foodTruck.id} 
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  hideCheckoutButton={true}
                />
              </div>
            </div>
            
            {/* Additional Information */}
            <div 
              className="mt-6 rounded-xl overflow-hidden shadow-md"
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
          </div>
          
          {/* Need Help Section - Mobile Only */}
          <div className="lg:hidden">
            <div 
              className="mt-6 rounded-xl overflow-hidden shadow-md"
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
          </div>
        </div>
      </div>
    </div>
  );
} 