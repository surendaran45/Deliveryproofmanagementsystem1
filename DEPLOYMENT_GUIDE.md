# 🚀 Deployment Guide - Delivery Proof Management System

This guide will help you deploy the complete full-stack application.

## 📋 Prerequisites

- Supabase account (https://supabase.com)
- Node.js 18+ installed
- Git installed

## 🗄️ Step 1: Database Setup

1. **Go to your Supabase project** at https://supabase.com/dashboard

2. **Navigate to SQL Editor** and run the following commands:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'driver')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create deliveries table
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

-- Create indexes
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_users_email ON users(email);

-- Disable RLS for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries DISABLE ROW LEVEL SECURITY;
```

3. **Note your Supabase credentials:**
   - Go to Project Settings > API
   - Copy `Project URL` (SUPABASE_URL)
   - Copy `anon public` key (SUPABASE_ANON_KEY)
   - Copy `service_role` key (SUPABASE_SERVICE_ROLE_KEY) - **Keep this secret!**

## 🔧 Step 2: Configure Edge Function Environment Variables

1. **Go to Edge Functions settings** in your Supabase dashboard

2. **Add the following environment variables:**
   - `JWT_SECRET`: Create a strong random string (e.g., use `openssl rand -base64 32`)
   - These are already available in Edge Functions:
     - `SUPABASE_URL` (automatically set)
     - `SUPABASE_SERVICE_ROLE_KEY` (automatically set)

## 🎨 Step 3: Frontend Deployment

The frontend is already configured and ready to use. It automatically connects to your Supabase Edge Functions.

**No additional configuration needed!** The frontend uses the Supabase credentials from `/utils/supabase/info.tsx` which are automatically configured.

## ⚙️ Step 4: Backend Edge Function (Already Deployed)

The backend is already deployed as a Supabase Edge Function. The server code is in `/supabase/functions/server/index.tsx`.

**The API is accessible at:**
```
https://[YOUR_PROJECT_ID].supabase.co/functions/v1/make-server-cca17b23/api
```

## 🧪 Step 5: Testing the Application

1. **Open the application** in your browser

2. **Register a test admin:**
   - Click "Register" tab
   - Name: Admin User
   - Email: admin@test.com
   - Password: admin123
   - Role: Admin

3. **Register a test driver:**
   - Logout and go back to login page
   - Name: John Driver
   - Email: driver@test.com
   - Password: driver123
   - Role: Driver

4. **Test driver workflow:**
   - Login as driver
   - Click "Warehouse Pickup"
   - Upload a photo
   - Click "Get Location" (allow location access)
   - Enter delivery address
   - Click "Start Delivery"
   - Go to "Complete Delivery"
   - Upload a delivery photo
   - Get location again
   - Complete delivery
   - Note the OTP generated

5. **Test admin workflow:**
   - Logout and login as admin
   - View all deliveries in the dashboard
   - Click "View" to see delivery details
   - Mark deliveries as "Resolved" or "Disputed"

## 🔒 Security Notes

### Important Security Considerations:

1. **Service Role Key**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend
2. **JWT Secret**: Use a strong, randomly generated secret
3. **HTTPS Only**: Always use HTTPS in production
4. **Row Level Security**: For production, enable RLS and create proper policies
5. **Password Requirements**: Consider stronger password validation
6. **Rate Limiting**: Add rate limiting to prevent abuse
7. **Input Validation**: All inputs are validated on the backend

### Production RLS Policies (Optional but Recommended):

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Drivers can read their own deliveries
CREATE POLICY "Drivers can read own deliveries" ON deliveries
  FOR SELECT USING (
    driver_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Drivers can insert their own deliveries
CREATE POLICY "Drivers can insert deliveries" ON deliveries
  FOR INSERT WITH CHECK (driver_id = auth.uid());

-- Drivers can update their own deliveries
CREATE POLICY "Drivers can update deliveries" ON deliveries
  FOR UPDATE USING (driver_id = auth.uid());

-- Admins can do everything
CREATE POLICY "Admins can do everything on deliveries" ON deliveries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

## 🐛 Troubleshooting

### Common Issues:

**1. "Failed to fetch deliveries"**
- Check that database tables are created
- Verify Edge Function is deployed
- Check browser console for detailed errors

**2. "Location not working"**
- Ensure browser has location permissions
- Use HTTPS (required for geolocation API)
- Check if device has GPS enabled

**3. "OTP not generating"**
- Verify delivery is in "In Transit" status
- Check that all required fields are filled
- Look at server logs in Supabase Edge Functions

**4. "Photos not uploading"**
- Check image file size (reduce if too large)
- Verify base64 encoding is working
- Consider using Supabase Storage for large images

### Checking Logs:

1. Go to Supabase Dashboard
2. Navigate to Edge Functions > Logs
3. Check for error messages
4. Also check browser console (F12) for frontend errors

## 📊 Database Queries for Testing

```sql
-- View all users
SELECT id, email, name, role, created_at FROM users;

-- View all deliveries with driver info
SELECT 
  d.*,
  u.name as driver_name,
  u.email as driver_email
FROM deliveries d
JOIN users u ON d.driver_id = u.id
ORDER BY d.created_at DESC;

-- Count deliveries by status
SELECT status, COUNT(*) as count
FROM deliveries
GROUP BY status;

-- Find deliveries without OTP verification
SELECT * FROM deliveries
WHERE status = 'Delivered' AND otp_verified = false;
```

## 🚀 Advanced Features to Consider

1. **Email Notifications**: Send OTP via email
2. **SMS Integration**: Send OTP via SMS
3. **Real-time Updates**: Use Supabase Realtime
4. **Image Compression**: Compress images before upload
5. **Offline Support**: PWA with service workers
6. **Export Reports**: Generate PDF/CSV reports
7. **Route Optimization**: Integrate route planning
8. **Driver Analytics**: Track driver performance

## 📱 Mobile Considerations

The application is responsive and works on mobile browsers. For native mobile apps:

1. Use Capacitor or React Native
2. Access native camera APIs
3. Better GPS accuracy
4. Background location tracking
5. Push notifications

## 🎉 Success!

Your Delivery Proof Management System is now fully deployed and ready to use!

For support or issues, check the Supabase documentation:
- https://supabase.com/docs
- https://supabase.com/docs/guides/functions

---

**Built with:**
- React + TypeScript + TailwindCSS
- Supabase (PostgreSQL + Edge Functions)
- JWT Authentication
- Google Maps Embed API
