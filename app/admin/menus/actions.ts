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
    image_url: string
  }
) {
  try {
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
          image_url: menuData.image_url
        }
      ])
      .select()
    
    if (error) {
      throw new Error(error.message || 'Failed to add menu item')
    }
    
    // Revalidate the cache tag for this food truck's menu items
    revalidateTag(`foodTruck:${foodTrucks.subdomain}`)
    
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
    image_url: string
  }
) {
  try {
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
        image_url: menuData.image_url
      })
      .eq('id', id)
    
    if (error) throw error
    
    // Revalidate the cache tag for this food truck's menu items
    revalidateTag(`foodTruck:${foodTrucks.subdomain}`)
    
    return { success: true }
  } catch (err: any) {
    console.error('Error updating menu item:', err)
    return { success: false, error: err.message || 'Failed to update menu item' }
  }
}

// Delete a menu item
export async function deleteMenuItem(id: string) {
  try {
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
    
    if (error) throw error
    
    // Revalidate the cache tag for this food truck's menu items
    revalidateTag(`foodTruck:${foodTrucks.subdomain}`)
    
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