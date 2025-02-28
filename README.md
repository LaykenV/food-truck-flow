// dont edit me
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# FoodTruckFlow

A B2B SaaS platform for food truck owners to create and manage their online presence. It includes a customizable public-facing website, an online ordering system, and a custom admin dashboard.

## Getting Started

First, set up your environment variables:

1. Copy `.env.example` to `.env`
2. Update the Supabase credentials in `.env` with your own from the [Supabase Dashboard](https://app.supabase.com)

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase Setup

This project uses [Supabase](https://supabase.com) for authentication, database, and storage. To set up Supabase:

1. Create a new project on [Supabase](https://app.supabase.com)
2. Get your project URL and anon key from the API settings
3. Add these to your `.env` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

To learn more about Supabase, check out:

- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase features and API.
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction) - learn about the JavaScript client.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
