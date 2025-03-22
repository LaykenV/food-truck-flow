import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AdminConfigClient } from '@/app/admin/config/client';

export default async function ConfigPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Fetch the user's food truck directly from Supabase
  const { data: foodTruck, error } = await supabase
    .from('FoodTrucks')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  if (error) {
    console.error('Error fetching food truck:', error);
    // If the food truck doesn't exist, create one with default configuration
    if (error.code === 'PGRST116') {
      const defaultConfig = getDefaultConfig();
      
      const { data: newFoodTruck, error: createError } = await supabase
        .from('FoodTrucks')
        .insert({
          user_id: user.id,
          subdomain: `user-${user.id.substring(0, 8)}`,
          configuration: defaultConfig,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_published: false
        })
        .select()
        .single();
        
      if (createError) {
        console.error('Error creating food truck:', createError);
        // Handle error - could redirect to an error page
      } else {
        return (
          <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold mb-6">Website Configuration</h1>
            
            <AdminConfigClient 
              initialConfig={defaultConfig} 
              userId={user.id} 
            />
          </div>
        );
      }
    }
  }
  
  // Map the database configuration to the FoodTruckConfig format
  // or use defaults if not available
  const config = mapDatabaseConfigToFoodTruckConfig(foodTruck?.configuration || {});
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Website Configuration</h1>
      
      <AdminConfigClient 
        initialConfig={config} 
        userId={user.id} 
      />
    </div>
  );
}

// Get default configuration for new food trucks
function getDefaultConfig() {
  return {
    name: 'Food Truck Name',
    tagline: 'Tasty meals on wheels',
    logo: '',
    primaryColor: '#FF6B35',
    secondaryColor: '#4CB944',
    hero: {
      image: '/images/placeholder-hero.jpg',
      title: 'Delicious Food Truck',
      subtitle: 'Serving the best street food in town'
    },
    about: {
      title: 'About Our Food Truck',
      content: 'Tell your story here...',
      image: ''
    },
    contact: {
      email: '',
      phone: '',
      address: ''
    },
    socials: {
      twitter: '',
      instagram: '',
      facebook: ''
    },
    schedule: {
      title: 'Weekly Schedule',
      description: 'Find us at these locations throughout the week',
      days: [
        {
          day: 'Monday',
          location: 'Downtown',
          address: '123 Main St',
          hours: '11:00 AM - 2:00 PM'
        },
        {
          day: 'Wednesday',
          location: 'Business District',
          address: '456 Market Ave',
          hours: '11:00 AM - 2:00 PM'
        },
        {
          day: 'Friday',
          location: 'Food Truck Friday',
          address: '789 Park Blvd',
          hours: '5:00 PM - 9:00 PM'
        },
        {
          day: 'Saturday',
          location: 'Farmers Market',
          address: '321 Harvest Lane',
          hours: '9:00 AM - 1:00 PM'
        }
      ]
    }
  };
}

// Helper function to map database configuration to FoodTruckConfig format
function mapDatabaseConfigToFoodTruckConfig(dbConfig: any) {
  // Check for legacy social property and migrate it
  if (dbConfig.social && !dbConfig.socials) {
    dbConfig.socials = dbConfig.social;
  }
  
  return {
    name: dbConfig.truckName || dbConfig.name || 'Food Truck Name',
    tagline: dbConfig.tagline || 'Tasty meals on wheels',
    logo: dbConfig.logo || '',
    primaryColor: dbConfig.primaryColor || '#FF6B35',
    secondaryColor: dbConfig.secondaryColor || '#4CB944',
    hero: {
      image: dbConfig.heroImage || dbConfig.hero?.image || '/images/placeholder-hero.jpg',
      title: dbConfig.heroTitle || dbConfig.hero?.title || 'Delicious Food Truck',
      subtitle: dbConfig.heroSubtitle || dbConfig.hero?.subtitle || 'Serving the best street food in town'
    },
    about: {
      title: dbConfig.aboutTitle || dbConfig.about?.title || 'About Our Food Truck',
      content: dbConfig.aboutContent || dbConfig.about?.content || dbConfig.description || 'Tell your story here...',
      image: dbConfig.aboutImage || dbConfig.about?.image || ''
    },
    contact: {
      email: dbConfig.contactEmail || dbConfig.contact?.email || '',
      phone: dbConfig.contactPhone || dbConfig.contact?.phone || '',
      address: dbConfig.contactAddress || dbConfig.contact?.address || ''
    },
    socials: {
      twitter: dbConfig.socialTwitter || dbConfig.socials?.twitter || '',
      instagram: dbConfig.socialInstagram || dbConfig.socials?.instagram || '',
      facebook: dbConfig.socialFacebook || dbConfig.socials?.facebook || ''
    },
    schedule: {
      title: dbConfig.scheduleTitle || dbConfig.schedule?.title || 'Weekly Schedule',
      description: dbConfig.scheduleDescription || dbConfig.schedule?.description || 'Find us at these locations throughout the week',
      days: dbConfig.scheduleDays || dbConfig.schedule?.days || []
    }
  };
} 