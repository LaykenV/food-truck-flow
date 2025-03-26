import { createClient } from "@/utils/supabase/server";
import { isScheduledOpenServer, getTodayScheduleServer } from "@/lib/schedule-utils-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const foodTruckId = searchParams.get('foodTruckId');
  
  if (!foodTruckId) {
    return NextResponse.json({ error: "Food truck ID is required" }, { status: 400 });
  }
  
  try {
    const supabase = await createClient();
    const { data: foodTruck } = await supabase
      .from('FoodTrucks')
      .select('configuration')
      .eq('id', foodTruckId)
      .single();
    
    if (!foodTruck) {
      return NextResponse.json({ error: "Food truck not found" }, { status: 404 });
    }
    
    const scheduleData = foodTruck.configuration?.schedule?.days || [];
    const todaySchedule = getTodayScheduleServer(scheduleData);
    const isCurrentlyOpen = isScheduledOpenServer(todaySchedule);
    
    return NextResponse.json({ 
      isOpen: isCurrentlyOpen,
      todaySchedule 
    });
    
  } catch (error) {
    console.error("Error checking food truck open status:", error);
    return NextResponse.json({ error: "Failed to check food truck status" }, { status: 500 });
  }
} 