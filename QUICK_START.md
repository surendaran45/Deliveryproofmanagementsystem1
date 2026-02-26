# ⚡ Quick Start Guide

Get your Delivery Proof Management System up and running in 5 minutes!

## ✅ Prerequisites Checklist

Before starting, make sure you have:
- [ ] A Supabase account (free tier is fine)
- [ ] A web browser with location services enabled
- [ ] This application open in your browser

## 🚀 3-Step Setup

### Step 1: Create Database Tables (2 minutes)

1. **Open Supabase Dashboard**: Go to https://supabase.com/dashboard
2. **Select your project** (or create a new one)
3. **Navigate to SQL Editor**: Click "SQL Editor" in the left sidebar
4. **Copy and paste** this SQL script:

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

5. **Click "Run"** - You should see success messages

### Step 2: Set JWT Secret (1 minute)

1. **Still in Supabase Dashboard**, go to **Edge Functions**
2. Click **"Manage environment variables"** or **Settings icon**
3. Add a new environment variable:
   - **Name**: `JWT_SECRET`
   - **Value**: `delivery-secret-key-2024-change-in-production`
   - (For production, use a stronger random key)
4. **Save** the environment variable

### Step 3: Create Test Accounts (2 minutes)

1. **Open the application** in your browser
2. **Click "Register" tab**

**Create Admin Account:**
- Name: `Test Admin`
- Email: `admin@test.com`
- Password: `admin123`
- Role: `Admin`
- Click "Register"

3. **Logout** (click logout button in dashboard)

**Create Driver Account:**
- Click "Register" tab again
- Name: `Test Driver`
- Email: `driver@test.com`
- Password: `driver123`
- Role: `Driver`
- Click "Register"

## 🎉 That's It! You're Ready!

### Test the Driver Workflow:

1. **Login as driver** (driver@test.com / driver123)
2. Click **"📦 Warehouse Pickup"**
3. Upload a photo (use your camera or select a file)
4. Click **"Get Location"** (allow location access)
5. Enter a delivery address (e.g., "123 Main St, City, Country")
6. Click **"Start Delivery"**
7. Go back to dashboard and click **"🚚 Complete Delivery"**
8. Upload another photo
9. Click **"Get Location"** again
10. Click **"Complete Delivery"**
11. **Note the 6-digit OTP** that appears!

### Test the Admin Workflow:

1. **Logout** and **login as admin** (admin@test.com / admin123)
2. You'll see the admin dashboard with delivery statistics
3. Click **"View"** on any delivery to see full details
4. Click **"Resolve"** or **"Dispute"** to change delivery status

## 🐛 Troubleshooting

### "Failed to fetch" errors?
- ✅ Make sure database tables are created (Step 1)
- ✅ Check that JWT_SECRET is set (Step 2)
- ✅ Open browser console (F12) and check for detailed errors
- ✅ Check Supabase Edge Function logs

### Location not working?
- ✅ Make sure you clicked "Allow" when browser asks for location
- ✅ Use HTTPS (required for geolocation)
- ✅ Check if location services are enabled on your device

### Can't see photos?
- ✅ Make sure you're uploading image files (JPG, PNG, etc.)
- ✅ Check file size isn't too large (keep under 5MB)

### "User already exists" error?
- ✅ Use different email addresses for each account
- ✅ Or login with existing credentials

## 📚 What's Next?

Now that your system is running:

1. **Read the full README.md** - Learn about all features
2. **Check DEPLOYMENT_GUIDE.md** - Production deployment tips
3. **Explore the code** - Understand how everything works
4. **Customize** - Add your own features!

## 💡 Quick Tips

- **Testing**: Create multiple driver accounts to test concurrent deliveries
- **Photos**: You can use any image - doesn't have to be from camera
- **OTP**: The OTP is randomly generated for each delivery
- **Status Flow**: Deliveries go: In Transit → Delivered → Resolved/Disputed
- **Maps**: Google Maps shows exact GPS coordinates

## 🔒 Security Reminder

For production use:
1. Change JWT_SECRET to a strong random value
2. Enable Row Level Security (RLS) on database tables
3. Use proper password validation
4. Enable HTTPS
5. Add rate limiting

## 🆘 Need Help?

- Check the logs: Supabase Dashboard → Edge Functions → Logs
- Open browser console: Press F12 and check Console tab
- Review error messages carefully - they usually explain the issue
- Make sure all setup steps were completed

---

**Enjoy your Delivery Proof Management System! 🚚📦**
