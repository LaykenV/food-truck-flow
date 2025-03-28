import { Metadata } from "next"
import ScheduleClient from "./client"

export const metadata: Metadata = {
  title: "Schedule Management",
  description: "Manage your food truck's weekly locations and hours",
}

export default function SchedulePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your food truck's weekly locations and hours
          </p>
        </div>
      </div>
      
      <ScheduleClient />
    </div>
  )
} 