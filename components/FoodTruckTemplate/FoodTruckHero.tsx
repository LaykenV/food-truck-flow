"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin } from "lucide-react"
import type { DisplayMode } from "."
import { useCallback, useEffect, useState } from "react"

export interface FoodTruckHeroProps {
  config: {
    hero?: {
      image?: string
      title?: string
      subtitle?: string
    }
    name?: string
    tagline?: string
    primaryColor?: string
    secondaryColor?: string
    heroFont?: string
  }
  displayMode: DisplayMode
  subdomain: string
  forceViewMode?: "mobile" | "desktop"
}

export default function FoodTruckHero({ config, displayMode, subdomain, forceViewMode }: FoodTruckHeroProps) {
  // Extract configuration data with defaults
  const {
    hero,
    name = "Food Truck",
    tagline = "Delicious food on wheels",
    primaryColor = "#FF6B35",
    secondaryColor = "#2EC4B6",
    heroFont = "#FFFFFF", // Default to white if not specified
  } = config

  const heroTitle = hero?.title || name
  const heroSubtitle = hero?.subtitle || tagline
  const heroImage = hero?.image || "/images/food-truck-background.jpg"

  // Determine if we should show mobile view based on forceViewMode or screen size
  const [isMobileView, setIsMobileView] = useState(forceViewMode === "mobile")

  useEffect(() => {
    if (forceViewMode) {
      setIsMobileView(forceViewMode === "mobile")
    } else {
      const checkMobileView = () => {
        setIsMobileView(window.innerWidth < 768)
      }

      checkMobileView()
      window.addEventListener("resize", checkMobileView)

      return () => {
        window.removeEventListener("resize", checkMobileView)
      }
    }
  }, [forceViewMode])

  // Handle button click based on display mode
  const handleButtonClick = (e: React.MouseEvent) => {
    if (displayMode === "preview") {
      e.preventDefault()
      // Maybe show a toast: "This button is disabled in preview mode"
    }
    // Live mode will follow the link naturally
  }

  // Handle smooth scroll to schedule section
  const handleSmoothScroll = useCallback((e: React.MouseEvent) => {
    e.preventDefault()

    const scheduleSection = document.getElementById("schedule-section")
    if (scheduleSection) {
      scheduleSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }, [])

  // Create gradient with opacity for better text readability
  const backgroundGradient = `linear-gradient(135deg, ${primaryColor}80, ${secondaryColor}80)`

  return (
    <>
      {/* Mobile hero section - visible when isMobileView is true */}
      <section
        className={`${!isMobileView ? "hidden" : ""} relative min-h-[50vh] flex flex-col items-center justify-between overflow-hidden`}
        style={{
          background: backgroundGradient,
        }}
      >
        {/* Decorative elements */}
        <div
          className="absolute top-0 left-0 w-24 h-24 rounded-br-full opacity-30"
          style={{ background: primaryColor }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-32 h-32 rounded-tl-full opacity-30"
          style={{ background: secondaryColor }}
        ></div>

        {/* Content container */}
        <div className="w-full px-6 pt-24 pb-28 flex flex-col items-center z-10">

          {/* Food truck image */}
          <div className="relative w-full h-[40vh] flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full opacity-20" style={{ background: primaryColor }}></div>
            </div>
            <Image
              src={heroImage || "/placeholder.svg"}
              alt={heroTitle}
              width={500}
              height={500}
              className="object-contain max-h-full z-10 transform hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 90vw, 500px"
              priority
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="absolute bottom-8 left-4 right-4 z-20 flex flex-col gap-3 items-center">
          {displayMode === "live" ? (
            <>
              <Button
                asChild
                size="lg"
                className="group w-[90%] shadow-lg hover:shadow-xl transition-all"
                id="hero-menu-button"
                style={{
                  background: primaryColor,
                  color: heroFont,
                  border: `2px solid ${heroFont}30`,
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
              >
                <Link href={`/${subdomain}/menu`} prefetch={true}>
                  View Menu
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group w-[90%] border-2 backdrop-blur-sm"
                style={{
                  borderColor: `${heroFont}50`,
                  color: heroFont,
                  backgroundColor: "transparent",
                }}
                onClick={handleSmoothScroll}
              >
                <MapPin className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
                Find Us
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                className="group w-[90%] shadow-lg hover:shadow-xl transition-all"
                id="hero-menu-button"
                style={{
                  background: primaryColor,
                  color: heroFont,
                  border: `2px solid ${heroFont}30`,
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
                onClick={handleButtonClick}
              >
                View Menu
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group w-[90%] border-2 backdrop-blur-sm"
                style={{
                  borderColor: `${heroFont}50`,
                  color: heroFont,
                  backgroundColor: "transparent",
                }}
                onClick={handleSmoothScroll}
              >
                <MapPin className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
                Find Us
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Desktop hero (full screen) - visible when isMobileView is false */}
      <section
        className={`${isMobileView ? "hidden" : ""} relative min-h-[100vh] overflow-hidden`}
        style={{
          background: backgroundGradient,
        }}
      >
        {/* Decorative elements */}
        <div
          className="absolute top-0 left-0 w-64 h-64 rounded-br-full opacity-20"
          style={{ background: primaryColor }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-tl-full opacity-20"
          style={{ background: secondaryColor }}
        ></div>
        <div
          className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full opacity-10"
          style={{ background: primaryColor }}
        ></div>

        {/* Hero Content - Two column layout */}
        <div className="container mx-auto relative z-10 px-4 py-12 h-full flex items-center">
          <div className="flex flex-row items-center h-full py-8 gap-8">
            {/* Left column - Text content */}
            <div className="w-full md:w-1/2 pr-4 pt-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight" style={{ color: heroFont }}>
                {heroTitle}
              </h1>
              <p className="text-xl md:text-2xl mb-10 max-w-xl" style={{ color: heroFont }}>
                {heroSubtitle}
              </p>
              <div className="flex flex-row gap-4">
                {displayMode === "live" ? (
                  <>
                    <Button
                      asChild
                      size="lg"
                      className="group shadow-lg hover:shadow-xl transition-all"
                      id="hero-menu-button"
                      style={{
                        background: primaryColor,
                        color: heroFont,
                        border: `2px solid ${heroFont}30`,
                        fontWeight: "bold",
                        fontSize: "1.2rem",
                      }}
                    >
                      <Link href={`/${subdomain}/menu`} prefetch={true}>
                        View Menu
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="group border-2 backdrop-blur-sm hover:bg-white/10"
                      style={{
                        borderColor: `${heroFont}50`,
                        color: heroFont,
                        backgroundColor: "transparent",
                      }}
                      onClick={handleSmoothScroll}
                    >
                      <MapPin className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
                      Find Us
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="group shadow-lg hover:shadow-xl transition-all"
                      id="hero-menu-button"
                      style={{
                        background: primaryColor,
                        color: heroFont,
                        border: `2px solid ${heroFont}30`,
                        fontWeight: "bold",
                        fontSize: "1.2rem",
                      }}
                      onClick={handleButtonClick}
                    >
                      View Menu
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="group border-2 backdrop-blur-sm hover:bg-white/10"
                      style={{
                        borderColor: `${heroFont}50`,
                        color: heroFont,
                        backgroundColor: "transparent",
                      }}
                      onClick={handleSmoothScroll}
                    >
                      <MapPin className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
                      Find Us
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Right column - Food truck image with animation */}
            <div className="hidden md:flex md:w-1/2 justify-center items-center relative">
              <div className="relative w-full h-[80vh] flex items-center justify-center">
                {/* Animated background circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-[500px] h-[500px] rounded-full opacity-20 animate-pulse"
                    style={{
                      background: secondaryColor,
                      animationDuration: "3s",
                    }}
                  ></div>
                </div>

                <Image
                  src={heroImage || "/placeholder.svg"}
                  alt={heroTitle}
                  width={700}
                  height={700}
                  className="object-contain z-10 transform transition-transform duration-500"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent line with gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2 z-10"
          style={{
            background: `linear-gradient(to right, ${secondaryColor}, ${primaryColor})`,
          }}
        ></div>
      </section>
    </>
  )
}
