-- Create a function to increment a value
CREATE OR REPLACE FUNCTION increment(row_id uuid, column_name text, increment_by integer)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE "Analytics" SET %I = %I + $1 WHERE id = $2', column_name, column_name)
  USING increment_by, row_id;
END;
$$ LANGUAGE plpgsql; 