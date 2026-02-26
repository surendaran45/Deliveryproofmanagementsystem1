# Database Setup Instructions

## Execute these SQL commands in your Supabase SQL Editor

### 1. Create users table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'driver')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Create deliveries table

```sql
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  before_photo TEXT,
  warehouse_latitude NUMERIC,
  warehouse_longitude NUMERIC,
  delivery_address TEXT,
  after_photo TEXT,
  delivery_latitude NUMERIC,
  delivery_longitude NUMERIC,
  otp TEXT,
  otp_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

### 3. Create indexes for better performance

```sql
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_users_email ON users(email);
```

### 4. Disable RLS (Row Level Security) for development

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries DISABLE ROW LEVEL SECURITY;
```

### Notes:
- For production, you should enable RLS and create proper policies
- Make sure to set JWT_SECRET environment variable in your Supabase Edge Function settings
- The backend will handle all authentication and authorization
