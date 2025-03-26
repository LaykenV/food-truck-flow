import { getFoodTruckData } from '@/lib/fetch-food-truck';
import { notFound } from 'next/navigation';
import { ShoppingCartDrawer } from '@/components/ShoppingCartDrawer';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { isScheduledOpenServer, getTodayScheduleServer } from "@/lib/schedule-utils-server";
import { OpenStatusProvider } from './open-status-provider';
import { ClientOrderForm } from './client-order-form';

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
        
        {/* Need Help Section */}
        <div className="mt-8">
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
        </div>
      </div>
    </div>
  );
} 