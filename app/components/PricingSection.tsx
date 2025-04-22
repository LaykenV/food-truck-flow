'use client';

import React, { useState, useRef, UIEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const pricingPlans = [
  {
    title: "Basic Plan",
    description: "Perfect for getting started",
    price: "$29",
    period: "/month",
    features: [
      "Custom website template",
      "Online ordering system",
      "Basic analytics",
      "Subdomain hosting",
      "Email support",
    ],
    highlight: true, // Highlight this plan
    comingSoon: false,
  },
  {
    title: "Pro Plan",
    description: "For growing food truck businesses",
    price: "Coming Soon",
    period: "",
    features: [
      "Everything in Basic",
      "Custom domain support",
      "Advanced analytics",
      "Priority support",
      "Online Payment Processing",
    ],
    highlight: false,
    comingSoon: true,
  },
];

export function PricingSection() {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0); // Now used for scroll indicators
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Updated scroll handler to calculate the current index
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const totalWidth = container.scrollWidth - container.clientWidth; // Total scrollable width
    
    if (totalWidth <= 0) return; // Avoid division by zero if not scrollable

    // Estimate card width - adjust if necessary based on spacing/padding
    const cardWidthEstimate = container.scrollWidth / pricingPlans.length; 
    
    // Calculate the index based on the center of the viewport
    const centerScrollPosition = scrollLeft + container.clientWidth / 2;
    let newIndex = Math.floor(centerScrollPosition / cardWidthEstimate);

    // Clamp index to valid range
    newIndex = Math.max(0, Math.min(pricingPlans.length - 1, newIndex));

    if (newIndex !== selectedPlanIndex) {
      setSelectedPlanIndex(newIndex);
    }
  };

  return (
    <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[hsl(var(--admin-foreground))] sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-[hsl(var(--admin-foreground)/0.8)] max-w-3xl mx-auto">
            Choose the plan that fits your food truck business needs
          </p>
        </div>

        {/* Mobile: Scrollable horizontal card container */}
        <div 
          ref={scrollContainerRef}
          className="lg:hidden flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
        >
          {pricingPlans.map((plan, index) => (
            <div 
              key={index} 
              className={cn(
                "min-w-[280px] w-[85vw] max-w-[340px] p-1 snap-center flex-shrink-0"
              )}
            >
              <Card 
                className={cn(
                  "border-2 h-full flex flex-col", 
                  plan.highlight ? "border-[hsl(var(--admin-primary))] bg-gradient-to-r from-[hsl(var(--admin-gradient-start)/0.05)] to-[hsl(var(--admin-gradient-end)/0.05)]" : "border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))]",
                  plan.comingSoon ? "opacity-70" : "hover:shadow-md transition-all"
                )}
              >
                <CardHeader>
                  <CardTitle className="text-2xl text-[hsl(var(--admin-foreground))]">{plan.title}</CardTitle>
                  <CardDescription className="text-[hsl(var(--admin-foreground)/0.7)]">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className={cn("font-bold text-[hsl(var(--admin-foreground))]", plan.comingSoon ? "text-2xl" : "text-4xl")}>{plan.price}</span>
                    {!plan.comingSoon && <span className="text-[hsl(var(--admin-foreground)/0.7)] ml-2">{plan.period}</span>}
                  </div>
                </CardHeader>
                <CardContent className={cn("flex-grow", plan.comingSoon ? "opacity-50" : "")}>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-[hsl(var(--admin-primary))] mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-[hsl(var(--admin-foreground)/0.9)]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Mobile Scroll Indicators */}
        {pricingPlans.length > 1 && (
          <div className="lg:hidden flex justify-center mt-4">
            <div className="flex space-x-2">
              {pricingPlans.map((_, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "transition-all duration-300 rounded-full",
                    selectedPlanIndex === index 
                      ? "w-6 h-2 bg-[hsl(var(--admin-primary))]" 
                      : "w-2 h-2 bg-[hsl(var(--admin-primary)/0.4)]"
                  )}
                ></div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop: Grid layout */}
        <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={cn(
                "border-2 h-full flex flex-col", 
                plan.highlight ? "border-[hsl(var(--admin-primary))] bg-gradient-to-r from-[hsl(var(--admin-gradient-start)/0.05)] to-[hsl(var(--admin-gradient-end)/0.05)]" : "border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))]",
                plan.comingSoon ? "opacity-70" : "hover:shadow-md transition-all"
              )}
            >
              <CardHeader>
                <CardTitle className="text-2xl text-[hsl(var(--admin-foreground))]">{plan.title}</CardTitle>
                <CardDescription className="text-[hsl(var(--admin-foreground)/0.7)]">{plan.description}</CardDescription>
                <div className="mt-4">
                   <span className={cn("font-bold text-[hsl(var(--admin-foreground))]", plan.comingSoon ? "text-2xl" : "text-4xl")}>{plan.price}</span>
                   {!plan.comingSoon && <span className="text-[hsl(var(--admin-foreground)/0.7)] ml-2">{plan.period}</span>}
                 </div>
              </CardHeader>
              <CardContent className={cn("flex-grow", plan.comingSoon ? "opacity-50" : "")}>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-[hsl(var(--admin-primary))] mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-[hsl(var(--admin-foreground)/0.9)]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 