"use client"

import { useEffect, useRef } from "react"

interface MapComponentProps {
  address: string
  height?: string
}

export default function MapComponent({ address, height = "300px" }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // In a real implementation, this would use a mapping service API
    // like Google Maps, Mapbox, or OpenStreetMap
    
    // For now, we'll just show a placeholder
    const mapContainer = mapRef.current
    if (mapContainer) {
      mapContainer.style.position = "relative"
      
      // Create a placeholder for the map
      const placeholderText = document.createElement("div")
      placeholderText.style.position = "absolute"
      placeholderText.style.top = "50%"
      placeholderText.style.left = "50%"
      placeholderText.style.transform = "translate(-50%, -50%)"
      placeholderText.style.textAlign = "center"
      placeholderText.style.color = "#666"
      placeholderText.textContent = `Map for: ${address}`
      
      // Clear previous content and add the new placeholder
      mapContainer.innerHTML = ""
      mapContainer.appendChild(placeholderText)
    }
  }, [address])

  return (
    <div 
      ref={mapRef} 
      className="w-full bg-gray-100 rounded-md overflow-hidden" 
      style={{ height }}
    />
  )
} 