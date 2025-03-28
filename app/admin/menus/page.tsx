import { Metadata } from "next"
import MenuClient from "./client"

export const metadata: Metadata = {
  title: "Menu Management",
  description: "Create and manage your food truck menu items",
}

export default function MenuPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your food truck menu items
          </p>
        </div>
      </div>
      
      <MenuClient />
    </div>
  )
} 