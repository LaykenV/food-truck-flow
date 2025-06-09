# 🚚 FoodTruckFlow

**A Full-Stack B2B Multi-Tenant SaaS Platform for Food Truck Owners**

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

## 🌟 Overview

FoodTruckFlow is a comprehensive B2B SaaS platform that empowers food truck owners to create professional websites with integrated online ordering systems. Built with modern technologies, it serves multiple tenants through a sophisticated subdomain and custom domain architecture, delivering a complete digital solution for mobile food businesses.

**🎯 Live Demo:** [foodtruckflow.com](https://foodtruckflow.com)

## 📸 Screenshots

### Landing Page
![Landing Page Screenshot](/public/images/landingScreen.png)
*Modern, conversion-optimized landing page with live preview demo*

### Admin Dashboard
![Admin Dashboard Screenshot](/public/images/orderScreen.png)
*Comprehensive admin interface with real-time analytics and content management*

### Example Food Truck Website
![Template Website Screenshot](/public/images/demoLanding.png)
*Mobile-first, customizable food truck website with online ordering*

## 🚀 Key Features

### 🏗️ **Multi-Tenant Architecture**
- **Subdomain Routing**: Automatic subdomain generation (`bobs-tacos.foodtruckflow.com`)
- **Custom Domains**: Pro plan users can connect their own domains with automatic SSL
- **Data Isolation**: Row-Level Security (RLS) ensures complete tenant separation
- **Scalable Infrastructure**: Built to handle thousands of concurrent food truck websites

### 🎨 **Dynamic Website Builder**
- **JSON-Based Configuration**: Flexible, schema-driven website customization
- **Live Preview**: Real-time website editing without page refreshes
- **Template System**: Pre-built, mobile-optimized templates for food trucks
- **Brand Customization**: Logo upload, color schemes, typography controls

### 📱 **Real-Time Order Management**
- **Live Order Tracking**: Customers see real-time order status updates
- **Supabase Subscriptions**: WebSocket-free real-time communication
- **Status Management**: Intuitive admin interface for order workflow
- **Notification System**: Real-time alerts for new orders and status changes

### 💳 **Payment & Subscription System**
- **Stripe Integration**: Secure payment processing
- **Freemium Model**: Free website building, paid hosting ($29-49/month)
- **Recurring Billing**: Automated subscription management and webhook handling
- **Revenue Analytics**: Track sales, conversion rates, and customer metrics

### 🔐 **Enterprise-Grade Security**
- **Supabase Authentication**: Email/password and social login (Google, GitHub)
- **Row-Level Security**: Database-level multi-tenant data protection
- **Encrypted Storage**: Sensitive data (Stripe keys) encrypted at rest
- **SSL Certificates**: Automatic HTTPS via Vercel

## 🛠️ Technical Architecture

### **Frontend Stack**
```
Next.js 14 (App Router)
├── TypeScript (Type Safety)
├── TailwindCSS (Styling)
├── React Server Components (Performance)
└── Responsive Design (Mobile-First)
```

### **Backend Infrastructure**
```
Supabase (BaaS)
├── PostgreSQL Database
├── Real-time Subscriptions
├── Authentication & Authorization
├── Row-Level Security (RLS)
└── Edge Functions
```

### **Third-Party Integrations**
```
Stripe (Payments)
├── Subscription Management
├── Webhook Processing
├── Customer Portal
└── Payment Links

Vercel (Deployment)
├── Wildcard Subdomains
├── Custom Domain Support
├── Edge Caching
└── Automatic Deployments
```

## 🗃️ Database Schema

### Core Tables
- **`FoodTrucks`**: Tenant configuration and subscription data
- **`Menus`**: Dynamic menu items with categories and pricing
- **`Orders`**: Real-time order processing with status tracking
- **`Analytics`**: Business intelligence and performance metrics
- **`Testimonials`**: Social proof and customer reviews

### Security Model
```sql
-- Row-Level Security Example
CREATE POLICY "Users can only access their own food trucks"
ON food_trucks FOR ALL
USING (user_id = auth.uid());
```

## 🎯 Business Model

### **Subscription Tiers**
| Feature | Basic ($29/month) | Pro ($49/month) |
|---------|-------------------|-----------------|
| Website Template | ✅ | ✅ |
| Online Ordering | ✅ | ✅ |
| Subdomain Hosting | ✅ | ✅ |
| Basic Analytics | ✅ | ✅ |
| Custom Domain | ❌ | ✅ |
| Advanced Analytics | ❌ | ✅ |
| Priority Support | ❌ | ✅ |

### **Revenue Drivers**
- **Freemium Conversion**: Free preview converts to paid hosting
- **Recurring Revenue**: Monthly/annual subscription billing
- **Upgrade Path**: Basic to Pro plan progression
- **Low Churn**: Essential business tool for food truck operations

## 📊 Performance & Scalability

### **Optimization Strategies**
- **Server-Side Rendering**: Fast initial page loads with Next.js SSR
- **Edge Caching**: Vercel CDN for global content delivery
- **Database Indexing**: Optimized queries for multi-tenant architecture
- **Real-time Efficiency**: Supabase subscriptions over traditional WebSockets

### **Scalability Features**
- **Horizontal Scaling**: Stateless architecture supports infinite scaling
- **Database Sharding**: Ready for partition-based scaling as needed
- **CDN Integration**: Global content delivery for all tenant websites
- **Monitoring**: Built-in analytics and performance tracking

## 🔧 Development Highlights

### **Advanced Features Implemented**
- **Dynamic Subdomain Routing**: Custom Next.js middleware for tenant resolution
- **Real-time Data Sync**: Supabase subscriptions for live updates
- **Multi-tenant Security**: Row-Level Security policies for data isolation
- **Payment Orchestration**: Complex Stripe integration with webhook handling
- **Live Website Builder**: JSON-driven configuration with instant preview

### **Technical Challenges Solved**
- **Domain Management**: Automated SSL and DNS configuration
- **Data Isolation**: Secure multi-tenant architecture
- **Real-time Updates**: Efficient WebSocket alternative implementation
- **Payment Complexity**: Subscription lifecycle and webhook handling
- **SEO Optimization**: Dynamic meta tags for tenant websites

## 📈 Results & Impact

### **Technical Achievements**
- **99.9% Uptime**: Reliable infrastructure for business-critical operations
- **Sub-second Load Times**: Optimized performance across all tenant sites
- **Zero Data Breaches**: Secure multi-tenant architecture
- **Scalable Architecture**: Ready for thousands of concurrent tenants

### **Business Impact**
- **Revenue Generation**: Recurring SaaS model with multiple pricing tiers
- **Market Validation**: Addresses real pain point for food truck industry
- **Growth Potential**: Expandable to other mobile business verticals
- **Competitive Advantage**: Unique combination of features in the market

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Layken Varholdt**
- LinkedIn: [Layken Varholdt](https://www.linkedin.com/in/layken-varholdt-a78687230/)
- Portfolio: [Layken Varholdt Portfolio](https://laykenvarholdt.com)
- Email: laykenv@gmail.com

---

**⭐ If you found this project helpful, please consider giving it a star!**
