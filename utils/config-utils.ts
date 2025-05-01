import { createClient } from '@/utils/supabase/client';
import { FoodTruckConfig } from '@/components/FoodTruckTemplate';
import { toast } from 'sonner';

/**
 * Get the default configuration for a new food truck
 * This is the central location for default configuration values
 */
export function getDefaultConfig(): FoodTruckConfig {
  return {
    name: 'Food Truck Name',
    tagline: 'Tasty meals on wheels',
    logo: '',
    primaryColor: '#FF6B35',
    secondaryColor: '#49D0B9',
    heroFont: '#FFFFFF',
    hero: {
      image: '/images/defaultTruck.png',
      title: 'Delicious Food Truck',
      subtitle: 'Serving the best street food in town'
    },
    about: {
      title: 'About Our Food Truck',
      content: 'Tell your story here...',
      image: 'https://jnkvsjlpvaqqftuejjgh.supabase.co/storage/v1/object/public/about-images/ef635e4e-e867-4891-9971-1a64c37cc0f6/kzn5unzxl8.png'
    },
    contact: {
      email: '',
      phone: ''
    },
    socials: {
      twitter: '',
      instagram: '',
      facebook: ''
    },
    schedule: {
      title: 'Weekly Schedule',
      description: 'Find us at these locations throughout the week',
      days: [],
      primaryTimezone: 'America/New_York'
    }
  };
}

/**
 * Save the food truck configuration to Supabase
 * @param userId The user ID
 * @param config The food truck configuration
 * @returns A promise that resolves to the updated configuration and timestamp
 */
export async function saveConfiguration(
  userId: string,
  config: FoodTruckConfig
): Promise<{ config: FoodTruckConfig; timestamp: Date }> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Validate the configuration
  if (!config.name || !config.name.trim()) {
    throw new Error('Food truck name is required');
  }

  const supabase = createClient();
  const timestamp = new Date().toISOString();

  // First, get the food truck ID
  const { data: foodTruck, error: foodTruckError } = await supabase
    .from('FoodTrucks')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (foodTruckError) {
    console.error('Error fetching food truck:', foodTruckError);
    throw new Error(`Failed to fetch food truck: ${foodTruckError.message}`);
  }

  // Update the food truck configuration
  const { error, data } = await supabase
    .from('FoodTrucks')
    .update({
      configuration: config,
      updated_at: timestamp,
    })
    .eq('user_id', userId)
    .select('updated_at')
    .single();

  if (error) {
    console.error('Error updating configuration:', error);
    throw new Error(`Failed to save configuration: ${error.message}`);
  }

  // Save to configuration history
  try {
    await supabase
      .from('ConfigurationHistory')
      .insert({
        food_truck_id: foodTruck.id,
        configuration: config,
        created_at: timestamp
      });
  } catch (historyError) {
    // Non-critical error, just log it
    console.warn('Failed to save configuration history:', historyError);
  }

  return {
    config,
    timestamp: new Date(data?.updated_at || timestamp)
  };
}

/**
 * Get the configuration history for a food truck
 * @param userId The user ID
 * @param limit The maximum number of history items to return
 * @returns A promise that resolves to the configuration history
 */
export async function getConfigurationHistory(
  userId: string,
  limit: number = 10
): Promise<{ config: FoodTruckConfig; timestamp: Date }[]> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const supabase = createClient();

  // First, get the food truck ID
  const { data: foodTruck, error: foodTruckError } = await supabase
    .from('FoodTrucks')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (foodTruckError) {
    console.error('Error fetching food truck:', foodTruckError);
    throw new Error(`Failed to fetch food truck: ${foodTruckError.message}`);
  }

  // Get the configuration history
  const { data, error } = await supabase
    .from('ConfigurationHistory')
    .select('configuration, created_at')
    .eq('food_truck_id', foodTruck.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching configuration history:', error);
    throw new Error(`Failed to fetch configuration history: ${error.message}`);
  }

  return (data || []).map(item => ({
    config: item.configuration as FoodTruckConfig,
    timestamp: new Date(item.created_at)
  }));
}

/**
 * Set up a real-time subscription to configuration changes
 * @param userId The user ID
 * @param onConfigChange Callback function to handle configuration changes
 * @returns A function to unsubscribe from the real-time updates
 */
export function subscribeToConfigChanges(
  userId: string,
  onConfigChange: (config: FoodTruckConfig) => void
): () => void {
  if (!userId) {
    console.error('User ID is required for real-time updates');
    return () => {};
  }
  console.log('Subscribing to config changes for user:', userId);

  const supabase = createClient();

  // Set up a real-time subscription to the FoodTrucks table
  const channel = supabase
    .channel('config-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'FoodTrucks',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        // Handle the real-time update
        if (payload.new && payload.new.configuration) {
          onConfigChange(payload.new.configuration as FoodTruckConfig);
        }
      }
    )
    .subscribe();

  // Return a function to unsubscribe
  return () => {
    supabase.removeChannel(channel);
  };
} 