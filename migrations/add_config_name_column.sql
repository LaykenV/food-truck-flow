-- Add config_name column to ConfigurationHistory table if it doesn't exist
ALTER TABLE IF EXISTS "ConfigurationHistory" 
ADD COLUMN IF NOT EXISTS "config_name" TEXT;

-- Create an index on config_name for faster queries
CREATE INDEX IF NOT EXISTS "idx_confighistory_config_name" ON "ConfigurationHistory" ("config_name");

-- Create the ConfigurationHistory table if it doesn't exist
CREATE TABLE IF NOT EXISTS "ConfigurationHistory" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "food_truck_id" UUID NOT NULL REFERENCES "FoodTrucks" ("id") ON DELETE CASCADE,
  "configuration" JSONB NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "config_name" TEXT
);

-- Create indices for faster queries
CREATE INDEX IF NOT EXISTS "idx_confighistory_food_truck_id" ON "ConfigurationHistory" ("food_truck_id");
CREATE INDEX IF NOT EXISTS "idx_confighistory_created_at" ON "ConfigurationHistory" ("created_at"); 