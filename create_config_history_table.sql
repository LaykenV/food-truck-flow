-- Create ConfigurationHistory table to track configuration changes
CREATE TABLE IF NOT EXISTS "ConfigurationHistory" (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), food_truck_id UUID NOT NULL REFERENCES "FoodTrucks"(id) ON DELETE CASCADE, configuration JSONB NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT now());
ALTER TABLE "ConfigurationHistory" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own configuration history" ON "ConfigurationHistory" FOR SELECT USING (food_truck_id IN (SELECT id FROM "FoodTrucks" WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert their own configuration history" ON "ConfigurationHistory" FOR INSERT WITH CHECK (food_truck_id IN (SELECT id FROM "FoodTrucks" WHERE user_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_config_history_food_truck_id ON "ConfigurationHistory"(food_truck_id);
CREATE INDEX IF NOT EXISTS idx_config_history_created_at ON "ConfigurationHistory"(created_at);
