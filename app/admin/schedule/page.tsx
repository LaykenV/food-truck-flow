import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleClient } from "./client";
import { LucideCalendar } from "lucide-react";
import { updateSchedule } from "../actions";

export default async function SchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <div>Not authenticated</div>;
  }
  
  // Fetch food truck data
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('*')
    .eq('user_id', user?.id)
    .single();
  
  if (!foodTruck) {
    return <div>Food truck not found</div>;
  }
  
  // Extract schedule data from food truck configuration
  const scheduleData = foodTruck.configuration?.schedule?.days || [];
  const primaryColor = foodTruck.configuration?.primaryColor || '#FF6B35';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>Manage your food truck's weekly locations</CardDescription>
          </div>
          <LucideCalendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ScheduleClient 
            initialSchedule={scheduleData} 
            onUpdateSchedule={updateSchedule} 
            primaryColor={primaryColor}
            scheduleTitle={foodTruck.configuration?.schedule?.title || 'Weekly Schedule'}
            scheduleDescription={foodTruck.configuration?.schedule?.description || 'Find us at these locations throughout the week'}
          />
        </CardContent>
      </Card>
    </div>
  );
} 