// This script seeds sample analytics data for testing
// Run with: node scripts/seed-analytics.js

import { createClient } from '@supabase/supabase-js';
import { format, subDays } from 'date-fns';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAnalytics() {
  try {
    // Get all food trucks
    const { data: foodTrucks, error: foodTrucksError } = await supabase
      .from('FoodTrucks')
      .select('id');
    
    if (foodTrucksError) {
      throw foodTrucksError;
    }
    
    if (!foodTrucks || foodTrucks.length === 0) {
      console.log('No food trucks found. Please create at least one food truck first.');
      return;
    }
    
    console.log(`Found ${foodTrucks.length} food trucks. Seeding analytics data...`);
    
    // For each food truck, create 30 days of analytics data
    for (const foodTruck of foodTrucks) {
      console.log(`Seeding data for food truck ${foodTruck.id}...`);
      
      // Generate random analytics data for the last 30 days
      const analyticsData = [];
      
      for (let i = 0; i < 30; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const pageViews = Math.floor(Math.random() * 100) + 10; // 10-110 page views
        const ordersPlaced = Math.floor(Math.random() * 10); // 0-10 orders
        const revenue = ordersPlaced * (Math.floor(Math.random() * 20) + 10); // $10-30 per order
        
        analyticsData.push({
          food_truck_id: foodTruck.id,
          date,
          page_views: pageViews,
          orders_placed: ordersPlaced,
          revenue
        });
      }
      
      // Try to use upsert first (requires unique constraint)
      try {
        const { error: insertError } = await supabase
          .from('Analytics')
          .upsert(analyticsData, { onConflict: 'food_truck_id,date' });
        
        if (insertError) {
          // If upsert fails, try insert with individual handling
          console.log(`Upsert failed, trying individual inserts for food truck ${foodTruck.id}...`);
          
          for (const record of analyticsData) {
            // Check if a record already exists for this date and food truck
            const { data: existingRecord } = await supabase
              .from('Analytics')
              .select('id')
              .eq('food_truck_id', record.food_truck_id)
              .eq('date', record.date)
              .single();
            
            if (existingRecord) {
              // Update existing record
              const { error: updateError } = await supabase
                .from('Analytics')
                .update({
                  page_views: record.page_views,
                  orders_placed: record.orders_placed,
                  revenue: record.revenue,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingRecord.id);
              
              if (updateError) {
                console.error(`Error updating record for ${record.date}:`, updateError);
              }
            } else {
              // Insert new record
              const { error: insertSingleError } = await supabase
                .from('Analytics')
                .insert(record);
              
              if (insertSingleError) {
                console.error(`Error inserting record for ${record.date}:`, insertSingleError);
              }
            }
          }
          
          console.log(`Completed individual inserts for food truck ${foodTruck.id}`);
        } else {
          console.log(`Successfully seeded analytics for food truck ${foodTruck.id}`);
        }
      } catch (error) {
        console.error(`Error seeding analytics for food truck ${foodTruck.id}:`, error);
      }
    }
    
    console.log('Analytics data seeding complete!');
  } catch (error) {
    console.error('Error seeding analytics data:', error);
  }
}

// Run the seed function
seedAnalytics(); 