# SEO Implementation for Food Truck Flow

This document outlines the SEO strategy implemented across the Food Truck Flow platform, focusing on structured data, metadata, and best practices to improve search engine visibility and user experience.

## Overview

The SEO implementation consists of three primary components:

1. **Page-Specific Metadata**: Dynamic metadata for each route using Next.js's `generateMetadata` function
2. **Structured Data (JSON-LD)**: Schema.org markup for rich search results
3. **Open Graph & Twitter Cards**: Enhanced social media sharing

## Metadata Implementation

Each route in the application uses Next.js's `generateMetadata` function to generate dynamic, SEO-friendly metadata based on food truck data. This metadata includes:

- Page title
- Meta description
- Open Graph tags
- Twitter Card tags

### Example: Menu Page Metadata

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = params;
  const foodTruck = await getFoodTruckData(subdomain);
  
  if (!foodTruck) {
    return { title: 'Menu Not Found' };
  }
  
  const config = foodTruck.configuration || {};
  const truckName = config.name || 'Food Truck';
  
  return {
    title: `Menu | ${truckName}`,
    description: `Explore the delicious menu and order online from ${truckName}.`,
    openGraph: {
      title: `Menu | ${truckName}`,
      description: `Explore our delicious menu and place your order online from ${truckName}.`,
      type: 'website',
      url: `https://${subdomain}.foodtruckflow.com/menu`,
      images: config.logoUrl ? [{ url: config.logoUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Menu | ${truckName}`,
      description: `Explore our delicious menu and place your order online from ${truckName}.`,
      images: config.logoUrl ? [config.logoUrl] : [],
    },
  };
}
```

## Structured Data (JSON-LD)

The application implements Schema.org structured data using JSON-LD format to enable rich results in search engines. Various schema types are used based on the page context:

### 1. Restaurant Schema (Layout)

Applied at the root layout level, providing basic food truck information:

```typescript
const restaurantSchema: Record<string, any> = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": config.name || 'Food Truck',
  "image": config.logoUrl || config.bannerUrl,
  "url": `https://${subdomain}.foodtruckflow.com`,
  "description": config.tagline || 'Delicious food on wheels',
  "servesCuisine": config.cuisineType || '',
  "telephone": config.contact?.phone || '',
  "email": config.contact?.email || '',
  "priceRange": config.priceRange || '$$',
  // OpeningHoursSpecification added conditionally
};
```

### 2. Menu Schema (Menu Page)

Applied on the menu page, representing the food truck's menu with categories and items:

```typescript
const menuSchema = {
  "@context": "https://schema.org",
  "@type": "Menu",
  "name": `${config.name || 'Food Truck'} Menu`,
  "url": `https://${subdomain}.foodtruckflow.com/menu`,
  "hasMenuSection": menuSections // Array of menu sections with menu items
};
```

Each menu section follows this structure:

```typescript
{
  "@type": "MenuSection",
  "name": category,
  "hasMenuItem": [
    {
      "@type": "MenuItem",
      "name": item.name,
      "description": item.description,
      "offers": {
        "@type": "Offer",
        "price": item.price.toFixed(2),
        "priceCurrency": "USD"
      },
      "image": item.image
    },
    // More menu items...
  ]
}
```

### 3. FoodEstablishment with OrderAction (Order Page)

Applied on the order page to indicate online ordering capability:

```typescript
const orderPageSchema = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  "name": config.name || 'Food Truck',
  "image": config.logoUrl || config.bannerUrl,
  "url": `https://${subdomain}.foodtruckflow.com`,
  "servesCuisine": config.cuisineType || '',
  "potentialAction": {
    "@type": "OrderAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `https://${subdomain}.foodtruckflow.com/order`,
      "inLanguage": "en-US",
      "name": "Order Online"
    },
    "deliveryMethod": ["http://schema.org/OnSitePickup"],
    "availability": isCurrentlyOpen ? "http://schema.org/InStock" : "http://schema.org/OutOfStock"
  }
};
```

### 4. Product Schema (Menu Items)

Applied dynamically when a menu item dialog is opened:

```typescript
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": item.name,
  "description": item.description || '',
  "image": imageSource || '',
  "offers": {
    "@type": "Offer",
    "price": item.price.toFixed(2),
    "priceCurrency": "USD",
    "availability": "http://schema.org/InStock",
    "url": currentUrl
  }
};
```

## Implementation Details

### JSON-LD Helper Component

A helper function creates the script tags for JSON-LD data:

```typescript
function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### Client-Side Considerations

For client components like MenuItem that generate structured data dynamically:

1. URL generation uses `usePathname()` from Next.js
2. The current URL is set in a useEffect to avoid reference errors during SSR
3. Structured data is only rendered when needed (e.g., when dialog is open)

```typescript
const [currentUrl, setCurrentUrl] = useState('');

// Set the current URL safely on the client side
useEffect(() => {
  setCurrentUrl(window.location.origin + pathname);
}, [pathname]);

// Conditionally render the schema
{isDialogOpen && productSchema && <JsonLdScript data={productSchema} />}
```

## Best Practices Implemented

1. **Dynamic Data**: All metadata and structured data is dynamically generated based on food truck configuration
2. **Fallbacks**: Default values are provided for all properties to ensure valid schemas even with incomplete data
3. **Conditional Rendering**: Schemas are only included when relevant (e.g., menu item schema only when dialog is open)
4. **Rich Information**: Key details like prices, descriptions, and images are included when available
5. **Hierarchy**: Proper nesting of schemas (Restaurant → Menu → MenuSection → MenuItem)

## Testing and Validation

Schema markup can be validated using:

1. [Google's Rich Results Test](https://search.google.com/test/rich-results)
2. [Schema.org Validator](https://validator.schema.org/)
3. [Structured Data Testing Tool](https://search.google.com/structured-data/testing-tool)

## Future Enhancements

Potential improvements for the SEO implementation:

1. Add `AggregateRating` schema for food trucks with reviews
2. Implement `breadcrumbs` schema for improved navigation structure
3. Add more specific dietary and allergen information to menu items
4. Implement `LocalBusiness` schema with geolocation data for food trucks with fixed locations

## Resources

- [Schema.org Documentation](https://schema.org/docs/full.html)
- [Google's Structured Data Guidelines](https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata) 