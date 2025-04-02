"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button 
      variant="admin-ghost" 
      size="icon" 
      onClick={toggleTheme} 
      className="h-9 w-9 text-admin-foreground/80 hover:text-admin-foreground"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-[1.3rem] w-[1.3rem]" />
      ) : (
        <Moon className="h-[1.3rem] w-[1.3rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 