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
    <section className="py-20 px-4 sm:px-6 lg:px-8 text-[hsl(var(--admin-foreground))]">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`} className="bg-[hsl(var(--admin-secondary)/0.5)] border border-[hsl(var(--admin-border))] rounded-lg px-6">
              <AccordionTrigger className="text-lg font-medium text-left hover:no-underline py-4 px-2">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-base opacity-80 pb-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
} 