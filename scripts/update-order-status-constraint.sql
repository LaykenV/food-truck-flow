-- Update the default value for the status column
ALTER TABLE "Orders" ALTER COLUMN status SET DEFAULT 'preparing';

-- Drop the existing constraint
ALTER TABLE "Orders" DROP CONSTRAINT IF EXISTS valid_status;

-- Add the new constraint
ALTER TABLE "Orders" ADD CONSTRAINT valid_status CHECK (status IN ('preparing', 'ready', 'completed'));

-- Update any existing orders with 'pending' status to 'preparing'
UPDATE "Orders" SET status = 'preparing', updated_at = NOW() WHERE status = 'pending'; 