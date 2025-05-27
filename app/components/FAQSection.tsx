'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What happens if a customer tries to order when I'm closed?",
    answer: "Don't worry! Your online ordering automatically stops 30 minutes before your scheduled closing time. Plus, you have an emergency 'Close Now' button in your admin panel to instantly disable orders if needed."
  },
  {
    question: "What will my website address be?",
    answer: "Your unique website address will be `[YourFoodTruckName].foodtruckflow.com`. We're also working on adding support for custom domain names soon!"
  },
  {
    question: "How do I manage incoming orders?",
    answer: "Our intuitive admin panel features a dedicated 'Orders' tab with live updates. You can easily view order details, track statuses, see pickup times, and access customer information all in one place."
  },
  {
    question: "How can customers track their order status?",
    answer: "Customers can track their order progress directly on your website. An order tracker is conveniently accessible on every page after they place an order."
  },
  {
    question: "Can I customize the look and feel of my website?",
    answer: "Absolutely! You have full control over your website's appearance. Customize colors, upload your logo and images easily through the 'Configuration' tab in your admin panel."
  }
];

export function FAQSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 text-[hsl(var(--admin-foreground))] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[hsl(var(--admin-primary)/0.05)] rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[hsl(var(--admin-gradient-end)/0.05)] rounded-full blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Frequently Asked <span className="text-[hsl(var(--admin-primary))]">Questions</span>
          </h2>
          <p className="text-xl text-[hsl(var(--admin-foreground)/0.8)] max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about getting started with FoodTruckFlow
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full space-y-6">
          {faqItems.map((item, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index + 1}`} 
              className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-2xl px-8 py-2 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative"
            >
              {/* Card background decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[hsl(var(--admin-primary)/0.05)] rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
              
              <AccordionTrigger className="text-lg md:text-xl font-semibold text-left hover:no-underline py-6 px-2 text-[hsl(var(--admin-foreground))] hover:text-[hsl(var(--admin-primary))] transition-colors relative z-10 [&[data-state=open]]:text-[hsl(var(--admin-primary))]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-base md:text-lg text-[hsl(var(--admin-foreground)/0.8)] pb-6 px-2 leading-relaxed relative z-10">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        
      </div>
    </section>
  );
} 