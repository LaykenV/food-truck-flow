import { Metadata } from "next"
import ScheduleClient from "./client"

export const metadata: Metadata = {
  title: "Schedule Management",
  description: "Manage your food truck's weekly locations and hours",
}

export default function SchedulePage() {
  return <ScheduleClient />
} 