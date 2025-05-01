'use server';

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { FoodTruckConfig } from "@/components/FoodTruckTemplate";
import { getDefaultConfig } from '@/utils/config-utils';

// Helper function to validate the FoodTruckConfig object
function validateFoodTruckConfig(config: FoodTruckConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic validation: Check if name exists and is a non-empty string
  if (!config.name || typeof config.name !== 'string' || config.name.trim() === '') {
    errors.push('Food truck name is required and cannot be empty.');
  }

  // Add more validation rules here based on FoodTruckConfig type
  // Example: Validate color format (simple hex check)
  const hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
  if (config.primaryColor && !hexColorRegex.test(config.primaryColor)) {
    errors.push('Primary color must be a valid hex code (e.g., #FF0000).');
  }
  if (config.secondaryColor && !hexColorRegex.test(config.secondaryColor)) {
    errors.push('Secondary color must be a valid hex code (e.g., #00FF00).');
  }

  // Example: Validate email format (simple check)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (config.contact?.email && !emailRegex.test(config.contact.email)) {
    errors.push('Contact email must be a valid email address.');
  }
  
  // Example: Validate schedule days structure if present
  if (config.schedule?.days && Array.isArray(config.schedule.days)) {
    config.schedule.days.forEach((day, index) => {
      if (!day.day || typeof day.day !== 'string' || day.day.trim() === '') {
        errors.push(`Schedule day ${index + 1}: Day name is required.`);
      }
      if (day.coordinates) {
        if (typeof day.coordinates.lat !== 'number' || typeof day.coordinates.lng !== 'number') {
          errors.push(`Schedule day ${index + 1}: Coordinates latitude and longitude must be numbers.`);
        }
      }
    });
  }
  

  return { isValid: errors.length === 0, errors };
}

// Save configuration to the database
export async function saveConfiguration(config: FoodTruckConfig) {
  try {
    // Validate the incoming configuration
    const { isValid, errors } = validateFoodTruckConfig(config);
    if (!isValid) {
      // Join errors for a comprehensive message, or handle them differently
      throw new Error(`Invalid configuration: ${errors.join(' ')}`);
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to save configuration');
    }
    
    // Get the food truck for this user
    const { data: foodTruck, error: fetchError } = await supabase
      .from('FoodTrucks')
      .select('id, subdomain')
      .eq('user_id', user.id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // Food truck doesn't exist, create one
        const { data: newFoodTruck, error: createError } = await supabase
          .from('FoodTrucks')
          .insert({
            user_id: user.id,
            subdomain: `user-${user.id.substring(0, 8)}`,
            configuration: config,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_published: false
          })
          .select()
          .single();
          
        if (createError) {
          throw new Error(`Failed to create food truck: ${createError.message}`);
        }
        
        // Revalidate the path to update Next.js cache
        revalidatePath('/admin/config');
        if (newFoodTruck.subdomain) {
          revalidatePath(`foodTruck:${newFoodTruck.subdomain}`);
        }
        
        return { success: true, timestamp: new Date() };
      }
      throw new Error(`Failed to fetch food truck: ${fetchError.message}`);
    }
    
    // Update the existing food truck
    const { error: updateError } = await supabase
      .from('FoodTrucks')
      .update({
        configuration: config,
        updated_at: new Date().toISOString()
      })
      .eq('id', foodTruck.id);
    
    if (updateError) {
      throw new Error(`Failed to update configuration: ${updateError.message}`);
    }
    
    // Revalidate the path to update Next.js cache
    revalidateTag(`foodTruck:${foodTruck.subdomain}`)
    if (foodTruck.subdomain) {
      revalidatePath(`foodTruck:${foodTruck.subdomain}`);
    }
    
    return { success: true, timestamp: new Date() };
  } catch (error) {
    console.error('Error in saveConfiguration:', error);
    throw error;
  }
}

// Get default config if needed
export async function getInitialConfig() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    // Get the food truck for this user
    const { data: foodTruck, error } = await supabase
      .from('FoodTrucks')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Food truck doesn't exist yet, return default config
        return getDefaultConfig();
      }
      throw new Error(`Failed to fetch food truck: ${error.message}`);
    }
    
    // Return the configuration from the food truck
    return mapDatabaseConfigToFoodTruckConfig(foodTruck?.configuration || {});
    
  } catch (error) {
    console.error('Error in getInitialConfig:', error);
    throw error;
  }
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
      days: dbConfig.scheduleDays || dbConfig.schedule?.days || defaultConfig.schedule?.days,
      primaryTimezone: dbConfig.scheduleTimezone || dbConfig.schedule?.primaryTimezone || defaultConfig.schedule?.primaryTimezone
    }
  };
}

// Get configuration history
export async function getConfigurationHistory(limit: number = 10) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    // First, get the food truck ID
    const { data: foodTruck, error: foodTruckError } = await supabase
      .from('FoodTrucks')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (foodTruckError) {
      console.error('Error fetching food truck:', foodTruckError);
      throw new Error(`Failed to fetch food truck: ${foodTruckError.message}`);
    }

    // Get the configuration history
    const { data, error } = await supabase
      .from('ConfigurationHistory')
      .select('id, configuration, created_at, config_name')
      .eq('food_truck_id', foodTruck.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching configuration history:', error);
      throw new Error(`Failed to fetch configuration history: ${error.message}`);
    }

    return (data || []).map(item => ({
      id: item.id,
      config: item.configuration as FoodTruckConfig,
      timestamp: new Date(item.created_at),
      configName: item.config_name || ''
    }));
  } catch (error) {
    console.error('Error in getConfigurationHistory:', error);
    throw error;
  }
}

// Bookmark a configuration
export async function bookmarkConfiguration(config: FoodTruckConfig, configName: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to bookmark configuration');
    }
    
    // Get the food truck for this user
    const { data: foodTruck, error: fetchError } = await supabase
      .from('FoodTrucks')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (fetchError) {
      throw new Error(`Failed to fetch food truck: ${fetchError.message}`);
    }
    
    // Save to configuration history with a name
    const { error: insertError } = await supabase
      .from('ConfigurationHistory')
      .insert({
        food_truck_id: foodTruck.id,
        configuration: config,
        created_at: new Date().toISOString(),
        config_name: configName
      });
    
    if (insertError) {
      throw new Error(`Failed to bookmark configuration: ${insertError.message}`);
    }
    
    return { success: true, timestamp: new Date() };
  } catch (error) {
    console.error('Error in bookmarkConfiguration:', error);
    throw error;
  }
} 