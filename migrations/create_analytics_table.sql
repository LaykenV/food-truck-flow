-- Create Analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Analytics" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "food_truck_id" UUID NOT NULL REFERENCES "FoodTrucks"("id") ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "page_views" INTEGER DEFAULT 0,
  "orders_placed" INTEGER DEFAULT 0,
  "revenue" NUMERIC(10, 2) DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE("food_truck_id", "date")
);

-- Add Row Level Security (RLS) policies
ALTER TABLE "Analytics" ENABLE ROW LEVEL SECURITY;

-- Policy for selecting analytics data
CREATE POLICY "Users can view their own food truck analytics" 
ON "Analytics" FOR SELECT 
USING (
  "food_truck_id" IN (
    SELECT "id" FROM "FoodTrucks" WHERE "user_id" = auth.uid()
  )
);

-- Policy for inserting analytics data
CREATE POLICY "Users can insert their own food truck analytics" 
ON "Analytics" FOR INSERT 
WITH CHECK (
  "food_truck_id" IN (
    SELECT "id" FROM "FoodTrucks" WHERE "user_id" = auth.uid()
  )
);

-- Policy for updating analytics data
CREATE POLICY "Users can update their own food truck analytics" 
ON "Analytics" FOR UPDATE 
USING (
  "food_truck_id" IN (
    SELECT "id" FROM "FoodTrucks" WHERE "user_id" = auth.uid()
  )
);

-- Policy for deleting analytics data
CREATE POLICY "Users can delete their own food truck analytics" 
ON "Analytics" FOR DELETE 
USING (
  "food_truck_id" IN (
    SELECT "id" FROM "FoodTrucks" WHERE "user_id" = auth.uid()
  )
);

-- Create function to update analytics when an order is placed
CREATE OR REPLACE FUNCTION update_analytics_on_order()
RETURNS TRIGGER AS $$
DECLARE
  order_date DATE;
  order_amount NUMERIC;
BEGIN
  order_date := DATE(NEW.created_at);
  order_amount := COALESCE(NEW.total_amount, 0);
  
  -- Insert or update analytics for the day
  INSERT INTO "Analytics" ("food_truck_id", "date", "orders_placed", "revenue")
  VALUES (NEW.food_truck_id, order_date, 1, order_amount)
  ON CONFLICT ("food_truck_id", "date") 
  DO UPDATE SET 
    "orders_placed" = "Analytics"."orders_placed" + 1,
    "revenue" = "Analytics"."revenue" + order_amount,
    "updated_at" = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new orders
DROP TRIGGER IF EXISTS orders_analytics_trigger ON "Orders";
CREATE TRIGGER orders_analytics_trigger
AFTER INSERT ON "Orders"
FOR EACH ROW
EXECUTE FUNCTION update_analytics_on_order(); 