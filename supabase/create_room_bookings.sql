CREATE TABLE IF NOT EXISTS room_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  room_ids TEXT[] NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'confirmed'
);

ALTER TABLE room_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON room_bookings
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access"
ON room_bookings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public delete access"
ON room_bookings
FOR DELETE
USING (true);

CREATE INDEX IF NOT EXISTS idx_room_bookings_room_ids ON room_bookings USING GIN (room_ids);
