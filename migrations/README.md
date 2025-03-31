# Database Migrations

This directory contains SQL migration scripts for the Food Truck Flow application.

## How to Apply Migrations

You can run these migrations in the Supabase SQL Editor or using the Supabase CLI.

### Using Supabase Dashboard

1. Log in to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy the content of the SQL file you want to run
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

### Using Supabase CLI

1. Install the Supabase CLI if you haven't already:
   ```
   npm install -g supabase
   ```

2. Log in to your Supabase account:
   ```
   supabase login
   ```

3. Run the migration script:
   ```
   supabase db execute --file ./migrations/migration_file.sql
   ```

## Available Migrations

- `add_config_name_column.sql`: Adds a `config_name` column to the `ConfigurationHistory` table to allow bookmarking configurations with custom names.

## Schema Changes

### ConfigurationHistory Table

The `ConfigurationHistory` table is used to store previous versions of food truck configurations. 

The schema includes:
- `id`: UUID primary key
- `food_truck_id`: Foreign key to FoodTrucks table
- `configuration`: JSONB object containing the full configuration
- `created_at`: Timestamp of when the configuration was saved
- `config_name`: Optional name for the configuration (for bookmarking) 