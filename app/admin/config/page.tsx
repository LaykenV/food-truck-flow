import { getFoodTruckData } from '@/lib/fetch-food-truck';
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

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
  }
  
  // Extract configuration from the food truck or use defaults
  const config = foodTruck?.configuration || {
    truckName: '',
    tagline: '',
    description: '',
    primaryColor: '#3B82F6', // Default blue color
  };
  
  // Server action to save configuration changes
  async function saveConfig(formData: FormData) {
    'use server'
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect('/login');
    }
    
    // Get form values
    const truckName = formData.get('truckName') as string;
    const tagline = formData.get('tagline') as string;
    const description = formData.get('description') as string;
    const primaryColor = formData.get('primaryColor') as string;
    
    // Create updated configuration object
    const updatedConfig = {
      ...config,
      truckName,
      tagline,
      description,
      primaryColor,
    };
    
    // Update the food truck configuration in Supabase
    const { error } = await supabase
      .from('FoodTrucks')
      .update({
        configuration: updatedConfig,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error updating configuration:', error);
    }
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Website Configuration</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <form action={saveConfig} className="space-y-4">
          <div>
            <label htmlFor="truckName" className="block text-sm font-medium text-gray-700">Food Truck Name</label>
            <input
              id="truckName"
              name="truckName"
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              defaultValue={config.truckName}
              required
            />
          </div>
          
          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">Tagline</label>
            <input
              id="tagline"
              name="tagline"
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              defaultValue={config.tagline}
              placeholder="A short, catchy phrase about your food truck"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              defaultValue={config.description}
              placeholder="Tell customers about your food truck, your story, and what makes your food special"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">Primary Color</label>
            <div className="flex items-center mt-1">
              <input
                id="primaryColor"
                name="primaryColor"
                type="color"
                className="block w-12 h-8"
                defaultValue={config.primaryColor}
              />
              <span className="ml-2 text-sm text-gray-500">This color will be used for buttons, headings, and accents on your website.</span>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
        <div 
          className="border border-gray-300 rounded-md p-4 h-64 flex flex-col items-center justify-center bg-gray-100"
          style={{ backgroundColor: config.primaryColor ? `${config.primaryColor}10` : undefined }}
        >
          {config.truckName ? (
            <>
              <h3 className="text-2xl font-bold" style={{ color: config.primaryColor }}>
                {config.truckName}
              </h3>
              {config.tagline && (
                <p className="text-lg mt-2 text-gray-700">{config.tagline}</p>
              )}
              {config.description && (
                <p className="mt-4 text-sm text-gray-600 text-center max-w-md">
                  {config.description.length > 100 
                    ? `${config.description.substring(0, 100)}...` 
                    : config.description}
                </p>
              )}
              <button 
                className="mt-6 px-4 py-2 rounded text-white"
                style={{ backgroundColor: config.primaryColor }}
              >
                View Menu
              </button>
            </>
          ) : (
            <p className="text-gray-500">Fill out the form to see a preview of your website</p>
          )}
        </div>
      </div>
    </div>
  )
} 