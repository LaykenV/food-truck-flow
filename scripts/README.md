# Scripts Directory

This directory contains utility scripts for managing the Food Truck Flow application.

## Available Scripts

### `update-pending-orders.ts`

This script updates all orders with status 'pending' to 'preparing'. It was created during the transition from a three-status system (pending, preparing, ready, completed) to a two-status system (preparing, ready, completed).

Usage:
```bash
npx tsx scripts/update-pending-orders.ts
```

### `update-order-status-constraint.sql`

This SQL script updates the database schema to:
1. Change the default value for the status column from 'pending' to 'preparing'
2. Update the constraint to only allow 'preparing', 'ready', and 'completed' as valid statuses
3. Update any existing orders with 'pending' status to 'preparing'

Usage:
```bash
# Connect to your Supabase database and run:
\i scripts/update-order-status-constraint.sql
```

## Adding New Scripts

When adding new scripts to this directory, please follow these guidelines:
1. Use descriptive names that indicate the purpose of the script
2. Add proper documentation within the script
3. Update this README with information about the script and usage instructions 