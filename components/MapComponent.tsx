"use client"

import React from 'react'

interface MapComponentProps {
  address: string
  height?: string
}

const MapComponent: React.FC<MapComponentProps> = ({ address, height = '300px' }) => {
  return (
    <div 
      className="bg-muted/40 w-full flex items-center justify-center text-muted-foreground" 
      style={{ height }}
    >
      <div className="text-center p-4">
        <p className="text-sm">Map placeholder for: {address}</p>
      </div>
    </div>
  )
}

export default MapComponent 