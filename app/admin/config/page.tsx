import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AdminConfigClient } from '@/app/admin/config/client';
import { getDefaultConfig } from '@/utils/config-utils';

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

// Helper function to map database configuration to FoodTruckConfig format
function mapDatabaseConfigToFoodTruckConfig(dbConfig: any) {
  // Detect legacy format and migrate it
  const defaultConfig = getDefaultConfig();
  
  // Check for legacy social property and migrate it
  if (dbConfig.social && !dbConfig.socials) {
    dbConfig.socials = dbConfig.social;
  }
  
  return {
    name: dbConfig.truckName || dbConfig.name || defaultConfig.name,
    tagline: dbConfig.tagline || defaultConfig.tagline,
    logo: dbConfig.logo || defaultConfig.logo,
    primaryColor: dbConfig.primaryColor || defaultConfig.primaryColor,
    secondaryColor: dbConfig.secondaryColor || defaultConfig.secondaryColor,
    heroFont: dbConfig.heroFont || defaultConfig.heroFont,
    hero: {
      image: dbConfig.heroImage || dbConfig.hero?.image || defaultConfig.hero?.image,
      title: dbConfig.heroTitle || dbConfig.hero?.title || defaultConfig.hero?.title,
      subtitle: dbConfig.heroSubtitle || dbConfig.hero?.subtitle || defaultConfig.hero?.subtitle
    },
    about: {
      title: dbConfig.aboutTitle || dbConfig.about?.title || defaultConfig.about?.title,
      content: dbConfig.aboutContent || dbConfig.about?.content || dbConfig.description || defaultConfig.about?.content,
      image: dbConfig.aboutImage || dbConfig.about?.image || defaultConfig.about?.image
    },
    contact: {
      email: dbConfig.contactEmail || dbConfig.contact?.email || defaultConfig.contact?.email,
      phone: dbConfig.contactPhone || dbConfig.contact?.phone || defaultConfig.contact?.phone
    },
    socials: {
      twitter: dbConfig.socialTwitter || dbConfig.socials?.twitter || defaultConfig.socials?.twitter,
      instagram: dbConfig.socialInstagram || dbConfig.socials?.instagram || defaultConfig.socials?.instagram,
      facebook: dbConfig.socialFacebook || dbConfig.socials?.facebook || defaultConfig.socials?.facebook
    },
    schedule: {
      title: dbConfig.scheduleTitle || dbConfig.schedule?.title || defaultConfig.schedule?.title,
      description: dbConfig.scheduleDescription || dbConfig.schedule?.description || defaultConfig.schedule?.description,
      days: dbConfig.scheduleDays || dbConfig.schedule?.days || defaultConfig.schedule?.days
    }
  };
} 