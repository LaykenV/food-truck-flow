'use client';

import { DisplayMode } from '.';

export interface FoodTruckAboutProps {
  config: {
    about?: {
      title?: string;
      content?: string;
      image?: string;
    };
    contact?: {
      address?: string;
      phone?: string;
      email?: string;
    };
    primaryColor?: string;
    secondaryColor?: string;
  };
  displayMode: DisplayMode;
  forceViewMode?: 'mobile' | 'desktop';
}

export default function FoodTruckAbout({ config, displayMode }: FoodTruckAboutProps) {
  // This component is intentionally empty as requested
  return null;
} 