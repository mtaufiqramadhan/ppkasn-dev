CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY, 
    name TEXT,
    category TEXT,
    location TEXT,
    status TEXT,
    type TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    added_by TEXT,
    last_borrowed_by TEXT,
    last_borrowed_at TIMESTAMPTZ,
    last_returned_at TIMESTAMPTZ,
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    material TEXT,
    dimensions TEXT,
    license_plate TEXT,
    vehicle_type TEXT,
    year INTEGER,
    month INTEGER,
    stnk_year INTEGER,
    stnk_month INTEGER,
    mileage INTEGER,
    fuel_type TEXT,
    capacity INTEGER,
    room_size TEXT,
    floor TEXT, 
    facilities TEXT
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON assets FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON assets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON assets FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
