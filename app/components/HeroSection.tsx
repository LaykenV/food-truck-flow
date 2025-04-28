"use client"

import Link from "next/link"
import Image from "next/image"
import { AuthModals } from "@/components/auth-modals"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"

export function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[hsl(var(--admin-gradient-end))] via-[hsl(var(--admin-gradient-end)/0.9)] to-[hsl(var(--admin-gradient-start))] flex flex-col">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnptLTE4IDE4di02aC02djZoNnptNiAwaDZ2LTZoLTZ2NnoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>

      <div className="w-full lg:w-[90%] mx-auto flex-grow flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-20 md:py-24 lg:py-0 relative">
        {/* Content container */}
        <div
          className={`flex flex-col items-center lg:flex-row lg:items-center lg:justify-between gap-8 md:gap-12 lg:gap-16 transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        >
          {/* Text content - stacked on mobile, left on desktop */}
          <div
            className="w-full lg:w-1/2 order-2 lg:order-1 text-center lg:text-left mt-8 lg:mt-0 transition-all duration-700 delay-300"
            style={{ transform: isLoaded ? "translateY(0)" : "translateY(20px)" }}
          >
            <div className="space-y-6 md:space-y-8">
              <div className="inline-block px-4 py-1.5 rounded-full bg-[hsl(var(--admin-primary)/0.2)] text-[hsl(var(--admin-primary-foreground))] text-sm font-medium mb-2">
                <div className="flex items-center">
                  <span className="relative flex h-3 w-3 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--admin-primary))] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[hsl(var(--admin-primary))]"></span>
                  </span>
                  Launch your food truck business online today
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="block text-[hsl(var(--admin-primary-foreground))]">
                  Bring Your Food Truck{" "}
                  <span
                    className="text-[hsl(var(--admin-primary))] relative inline-block after:content-[''] after:absolute after:w-full after:h-[3px] after:bg-[hsl(var(--admin-primary))] after:bottom-0 after:left-0 after:opacity-80 after:transition-all after:duration-700"
                    style={{
                      textShadow: "0 0 15px rgba(var(--admin-primary-rgb), 0.9)",
                      animation: "pulse 2s infinite ease-in-out",
                    }}
                  >
                    Online
                  </span>
                </span>
              </h1>

              <p className="max-w-2xl mx-auto lg:mx-0 text-lg md:text-xl text-[hsl(var(--admin-primary-foreground)/0.9)] leading-relaxed">
                The ultimate platform for food truck owners to create stunning websites, manage online orders, and build
                a powerful online presence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <AuthModals
                  initialView="sign-in"
                  trigger={
                    <Button className="px-6 py-3 md:px-7 md:py-3.5 bg-[hsl(var(--admin-primary-foreground))] text-[hsl(var(--admin-primary))] rounded-md font-medium shadow-lg hover:bg-[hsl(var(--admin-primary-foreground)/0.9)] transition-all hover:scale-105 text-center flex items-center justify-center w-full h-auto">
                      Login
                    </Button>
                  }
                />
                <AuthModals
                  initialView="sign-up"
                  trigger={
                    <Button className="px-6 py-3 md:px-7 md:py-3.5 bg-transparent text-white border-2 border-white rounded-md font-medium shadow-lg hover:bg-white hover:bg-opacity-10 transition-all hover:scale-105 text-center flex items-center justify-center w-full h-auto">
                      Sign Up Free
                    </Button>
                  }
                />
                <Link href="/demo" target="_blank" rel="noopener noreferrer" className="hidden md:block">
                  <Button className="px-5 py-3 md:py-3.5 bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-primary-foreground))] rounded-md font-medium shadow-lg hover:bg-[hsl(var(--admin-primary)/0.9)] transition-all hover:scale-105 flex flex-col items-center justify-center gap-0 h-auto">
                    <div className="flex items-center">
                      <span className="text-base md:text-lg">Visit Demo Website</span>
                      <ExternalLink className="ml-2 h-5 w-5" />
                    </div>
                    <span className="text-xs opacity-80 text-left">(Place an order!)</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Image container - top on mobile, right on desktop */}
          <div
            className="w-4/5 lg:w-1/2 order-1 lg:order-2 flex justify-center lg:justify-end transition-all duration-700 delay-100"
            style={{ transform: isLoaded ? "translateY(0)" : "translateY(-20px)" }}
          >
            <div className="relative w-full aspect-square max-w-lg">
              {/* Decorative elements */}
              <div className="absolute -inset-0.5 bg-[hsl(var(--admin-primary))] rounded-lg opacity-20 blur-xl animate-pulse"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(var(--admin-primary))] to-[hsl(var(--admin-gradient-start))] rounded-lg opacity-10 blur-md"></div>

              {/* Main image container */}
              <div className="relative w-full h-full bg-[hsl(var(--admin-gradient-end)/0.3)] backdrop-blur-sm rounded-lg border border-[hsl(var(--admin-primary)/0.2)] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[hsl(var(--admin-gradient-end)/0.1)] backdrop-blur-sm rounded-lg"></div>

                <Image
                  src="/images/edit6.png"
                  alt="Food Truck Online - A food truck with a wifi symbol representing online presence"
                  fill
                  priority
                  className="object-contain p-0 drop-shadow-2xl transition-transform duration-700"
                  quality={100}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                  }}
                />

                {/* Floating elements */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-[hsl(var(--admin-primary)/0.2)] rounded-full blur-md animate-pulse"></div>
                <div className="absolute bottom-8 left-8 w-12 h-12 bg-[hsl(var(--admin-primary-foreground)/0.2)] rounded-full blur-md animate-pulse delay-700"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[hsl(var(--admin-primary))] to-transparent"></div>

        {/* Add keyframes for the pulse animation */}
        <style jsx global>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              text-shadow: 0 0 15px rgba(var(--admin-primary-rgb), 0.9);
            }
            50% {
              opacity: 0.8;
              text-shadow: 0 0 25px rgba(var(--admin-primary-rgb), 1);
            }
          }
        `}</style>
      </div>
    </section>
  )
}
