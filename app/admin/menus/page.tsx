import { Metadata } from "next"
import MenuClient from "./client"

export const metadata: Metadata = {
  title: "Menu Management",
  description: "Create and manage your food truck menu items",
}

export default function MenuPage() {
  return (
    <MenuClient />
  )
} 