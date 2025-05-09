'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidateTag } from 'next/cache'

// Add a new menu item
export async function addMenuItem(
  menuData: {
    name: string,
    description: string,
    price: number,
    category: string,
    image_url: string,
    active: boolean
  }
) {
  try {
    // Input Validation
    if (!menuData.name || typeof menuData.name !== 'string') {
      throw new Error('Invalid menu item name')
    }
    if (!menuData.description || typeof menuData.description !== 'string') {
      throw new Error('Invalid menu item description')
    }
    if (menuData.price == null || typeof menuData.price !== 'number' || menuData.price < 0) {
      throw new Error('Invalid menu item price')
    }
    if (!menuData.category || typeof menuData.category !== 'string') {
      throw new Error('Invalid menu item category')
    }
    if (typeof menuData.active !== 'boolean') {
      throw new Error('Invalid menu item active state')
    }
    // Optional: Basic check for image_url, could be enhanced
    if (menuData.image_url && typeof menuData.image_url !== 'string') {
        throw new Error('Invalid menu item image URL');
    }

    const supabase = await createClient()
    
    // Get the current user's food truck ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    // Get the food truck ID for the current user
    const { data: foodTrucks, error: foodTruckError } = await supabase
      .from('FoodTrucks')
      .select('id, subdomain')
      .eq('user_id', user.id)
      .single()
    
    if (foodTruckError) {
      throw new Error(foodTruckError.message || 'Failed to find food truck')
    }
    
    if (!foodTrucks) throw new Error('No food truck found')
    
    // Add the new menu item
    const { data, error } = await supabase
      .from('Menus')
      .insert([
        {
          food_truck_id: foodTrucks.id,
          name: menuData.name,
          description: menuData.description,
          price: menuData.price,
          category: menuData.category,
          image_url: menuData.image_url,
          active: menuData.active
        }
      ])
      .select()
    
    if (error) {
      throw new Error(error.message || 'Failed to add menu item')
    }
    
    // Revalidate the cache tag for this food truck's menu items
    // This is for Next.js server cache invalidation
    revalidateTag(`foodTruck:${foodTrucks.subdomain}`)
    
    // Note: React Query cache invalidation happens on the client side
    // after mutation with queryClient.invalidateQueries({ queryKey: ['menuItems'] })
    
    return { success: true, data }
  } catch (err: any) {
    console.error('Error adding menu item:', err)
    return { success: false, error: err.message || 'An unknown error occurred' }
  }
}

// Update an existing menu item
export async function updateMenuItem(
  id: string,
  menuData: {
    name: string,
    description: string,
    price: number,
    category: string,
    image_url: string,
    active: boolean
  }
) {
  try {
    // Input Validation
    if (!id || typeof id !== 'string') {
        throw new Error('Invalid menu item ID');
    }
    if (!menuData.name || typeof menuData.name !== 'string') {
      throw new Error('Invalid menu item name')
    }
    if (!menuData.description || typeof menuData.description !== 'string') {
      throw new Error('Invalid menu item description')
    }
    if (menuData.price == null || typeof menuData.price !== 'number' || menuData.price < 0) {
      throw new Error('Invalid menu item price')
    }
    if (!menuData.category || typeof menuData.category !== 'string') {
      throw new Error('Invalid menu item category')
    }
    if (typeof menuData.active !== 'boolean') {
      throw new Error('Invalid menu item active state')
    }
    // Optional: Basic check for image_url, could be enhanced
    if (menuData.image_url && typeof menuData.image_url !== 'string') {
        throw new Error('Invalid menu item image URL');
    }

    const supabase = await createClient()
    
    // Get the current user's food truck ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    // Get the food truck ID for the current user
    const { data: foodTrucks, error: foodTruckError } = await supabase
      .from('FoodTrucks')
      .select('id, subdomain')
      .eq('user_id', user.id)
      .single()
    
    if (foodTruckError) throw foodTruckError
    if (!foodTrucks) throw new Error('No food truck found')
    
    // Update the menu item
    const { error } = await supabase
      .from('Menus')
      .update({
        name: menuData.name,
        description: menuData.description,
        price: menuData.price,
        category: menuData.category,
        image_url: menuData.image_url,
        active: menuData.active
      })
      .eq('id', id)
      .eq('food_truck_id', foodTrucks.id)
    
    if (error) throw error
    
    // Revalidate the cache tag for this food truck's menu items
    // This is for Next.js server cache invalidation
    revalidateTag(`foodTruck:${foodTrucks.subdomain}`)
    
    // Note: React Query cache invalidation happens on the client side
    // after mutation with queryClient.invalidateQueries({ queryKey: ['menuItems'] })
    
    return { success: true }
  } catch (err: any) {
    console.error('Error updating menu item:', err)
    return { success: false, error: err.message || 'Failed to update menu item' }
  }
}

// Delete a menu item
export async function deleteMenuItem(id: string) {
  try {
    // Input Validation
    if (!id || typeof id !== 'string') {
        throw new Error('Invalid menu item ID');
    }

    const supabase = await createClient()
    
    // Get the current user's food truck ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    // Get the food truck ID for the current user
    const { data: foodTrucks, error: foodTruckError } = await supabase
      .from('FoodTrucks')
      .select('id, subdomain')
      .eq('user_id', user.id)
      .single()
    
    if (foodTruckError) throw foodTruckError
    if (!foodTrucks) throw new Error('No food truck found')
    
    // Delete the menu item
    const { error } = await supabase
      .from('Menus')
      .delete()
      .eq('id', id)
      .eq('food_truck_id', foodTrucks.id)
    if (error) throw error
    
    // Revalidate the cache tag for this food truck's menu items
    // This is for Next.js server cache invalidation
    revalidateTag(`foodTruck:${foodTrucks.subdomain}`)
    
    // Note: React Query cache invalidation happens on the client side
    // after mutation with queryClient.invalidateQueries({ queryKey: ['menuItems'] })
    
    return { success: true }
  } catch (err: any) {
    console.error('Error deleting menu item:', err)
    return { success: false, error: err.message || 'Failed to delete menu item' }
  }
}

// Get the food truck ID
export async function getFoodTruckId() {
  try {
    const supabase = await createClient()
    
    // Get the current user's food truck ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    // Get the food truck ID for the current user
    const { data: foodTrucks, error: foodTruckError } = await supabase
      .from('FoodTrucks')
      .select('id, subdomain' )
      .eq('user_id', user.id)
      .single()
    
    if (foodTruckError) throw foodTruckError
    if (!foodTrucks) throw new Error('No food truck found')
    
    return { success: true, id: foodTrucks.id }
  } catch (err: any) {
    console.error('Error getting food truck ID:', err)
    return { success: false, error: err.message || 'Failed to get food truck ID' }
  }
}

// Update menu item active state
export async function updateMenuItemActiveState(
  id: string,
  active: boolean
) {
  try {
    // Input Validation
    if (!id || typeof id !== 'string') {
        throw new Error('Invalid menu item ID');
    }
    if (typeof active !== 'boolean') {
      throw new Error('Invalid active state')
    }

    const supabase = await createClient()
    
    // Get the current user's food truck ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    // Get the food truck ID for the current user
    const { data: foodTrucks, error: foodTruckError } = await supabase
      .from('FoodTrucks')
      .select('id, subdomain')
      .eq('user_id', user.id)
      .single()
    
    if (foodTruckError) throw foodTruckError
    if (!foodTrucks) throw new Error('No food truck found')
    
    // Update the menu item's active state
    const { error } = await supabase
      .from('Menus')
      .update({ active })
      .eq('id', id)
      .eq('food_truck_id', foodTrucks.id)
    
    if (error) throw error
    
    // Revalidate the cache tag for this food truck's menu items
    // This is for Next.js server cache invalidation
    revalidateTag(`foodTruck:${foodTrucks.subdomain}`)
    
    // Note: React Query cache invalidation happens on the client side
    // after mutation with queryClient.invalidateQueries({ queryKey: ['menuItems'] })
    
    return { success: true }
  } catch (err: any) {
    console.error('Error updating menu item active state:', err)
    return { success: false, error: err.message || 'Failed to update menu item active state' }
  }
} 