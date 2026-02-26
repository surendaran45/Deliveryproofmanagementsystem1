# 📦 Delivery Proof Management System

A comprehensive full-stack delivery management system with photo proof, GPS tracking, and OTP verification.

## 🌟 Features

### 👨‍✈️ Driver Features
- **Warehouse Pickup**
  - Upload warehouse photo (before delivery)
  - Capture GPS location at warehouse
  - Enter delivery address
  - Start delivery journey

- **Complete Delivery**
  - Upload delivery photo (after delivery)
  - Capture GPS location at delivery point
  - Generate 6-digit OTP automatically
  - View delivery history

### 👨‍💼 Admin Features
- **Dashboard Overview**
  - View all deliveries across all drivers
  - Real-time delivery statistics
  - Filter by status (In Transit, Delivered, Resolved, Disputed)

- **Delivery Management**
  - View warehouse and delivery photos side-by-side
  - Check GPS coordinates for both locations
  - Verify OTP status
  - Mark deliveries as Resolved or Disputed
  - View complete delivery timeline

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **React Router** for navigation
- **Shadcn/ui** components
- **Sonner** for toast notifications

### Backend
- **Supabase Edge Functions** (Hono web server)
- **PostgreSQL** database
- **JWT** authentication
- **Bcrypt** password hashing

### APIs & Services
- **Google Maps Embed API** for location display
- **Geolocation API** for GPS tracking
- **Base64** image encoding for photo storage

## 📁 Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts (Auth)
│   │   ├── pages/             # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── DriverDashboard.tsx
│   │   │   ├── WarehousePickup.tsx
│   │   │   ├── CompleteDelivery.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── services/          # API services
│   │   ├── App.tsx            # Main app component
│   │   └── routes.ts          # Route configuration
│   └── styles/                # Global styles
├── supabase/
│   └── functions/
│       └── server/
│           └── index.tsx      # Backend API server
├── DATABASE_SETUP.md          # Database schema
├── DEPLOYMENT_GUIDE.md        # Deployment instructions
└── README.md                  # This file
```

## 🗄️ Database Schema

### `users` Table
- `id` - UUID (Primary Key)
- `email` - Text (Unique)
- `password_hash` - Text
- `name` - Text
- `role` - Text ('admin' or 'driver')
- `created_at` - Timestamp

### `deliveries` Table
- `id` - UUID (Primary Key)
- `driver_id` - UUID (Foreign Key → users.id)
- `before_photo` - Text (Base64)
- `warehouse_latitude` - Numeric
- `warehouse_longitude` - Numeric
- `delivery_address` - Text
- `after_photo` - Text (Base64)
- `delivery_latitude` - Numeric
- `delivery_longitude` - Numeric
- `otp` - Text (6 digits)
- `otp_verified` - Boolean
- `status` - Text (Pending/In Transit/Delivered/Resolved/Disputed)
- `created_at` - Timestamp
- `completed_at` - Timestamp

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Deliveries
- `POST /api/deliveries/start` - Start new delivery (Driver)
- `POST /api/deliveries/complete` - Complete delivery (Driver)
- `POST /api/deliveries/verify-otp` - Verify OTP
- `GET /api/deliveries` - Get all deliveries (Admin sees all, Driver sees own)
- `PATCH /api/deliveries/:id/resolve` - Mark as resolved (Admin)
- `PATCH /api/deliveries/:id/dispute` - Mark as disputed (Admin)

## 🚀 Getting Started

### 1. Database Setup
Run the SQL commands from `/supabase/DATABASE_SETUP.md` in your Supabase SQL Editor.

### 2. Configure Environment Variables
Set the following in your Supabase Edge Function settings:
- `JWT_SECRET` - A strong random secret key

### 3. Access the Application
The application is ready to use! Just open it in your browser.

### 4. Create Test Accounts

**Admin Account:**
- Email: admin@test.com
- Password: admin123
- Role: Admin

**Driver Account:**
- Email: driver@test.com
- Password: driver123
- Role: Driver

## 📸 Screenshots & Workflow

### Driver Workflow
1. Login → Driver Dashboard
2. Click "📦 Warehouse Pickup"
3. Upload photo + Get GPS location + Enter address
4. Click "Start Delivery" (Status: In Transit)
5. Click "🚚 Complete Delivery"
6. Upload photo + Get GPS location
7. Click "Complete Delivery" → OTP generated
8. Share OTP with recipient

### Admin Workflow
1. Login → Admin Dashboard
2. View delivery statistics
3. Browse all deliveries in table
4. Click "View" to see photos and details
5. Mark as "Resolved" or "Disputed"

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Bcrypt password hashing
- ✅ Role-based access control
- ✅ Protected API routes with middleware
- ✅ Input validation and error handling
- ✅ CORS enabled for cross-origin requests

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktop computers

## 🎨 UI/UX Features

- Modern gradient backgrounds
- Clean card-based layouts
- Interactive buttons with hover effects
- Loading states and error messages
- Toast notifications for user feedback
- Modal dialogs for detailed views
- Status badges with color coding
- Responsive tables and grids

## 🌍 Maps Integration

Uses Google Maps Embed API to display:
- Warehouse location
- Delivery location
- Interactive map with zoom controls

## 📊 Status Flow

```
Pending → In Transit → Delivered → Resolved/Disputed
```

- **Pending**: Initial state
- **In Transit**: Driver started from warehouse
- **Delivered**: Driver completed delivery (OTP generated)
- **Resolved**: Admin confirmed successful delivery
- **Disputed**: Admin marked delivery as problematic

## 🐛 Known Limitations

1. **Image Size**: Base64 encoding increases database size (consider Supabase Storage for production)
2. **Location Accuracy**: Depends on device GPS and browser permissions
3. **RLS Disabled**: Row Level Security is disabled for development (enable for production)
4. **OTP Delivery**: OTP is only shown in app (consider SMS/Email integration)

## 🚀 Future Enhancements

- [ ] Email/SMS OTP delivery
- [ ] Real-time delivery tracking
- [ ] Route optimization
- [ ] Driver analytics dashboard
- [ ] Export delivery reports (PDF/CSV)
- [ ] Image compression before upload
- [ ] Offline mode (PWA)
- [ ] Push notifications
- [ ] Multi-language support
- [ ] Dark mode

## 📝 License

This project is for demonstration purposes.

## 🤝 Support

For issues or questions:
1. Check `DEPLOYMENT_GUIDE.md`
2. Review Supabase Edge Function logs
3. Check browser console for errors
4. Verify database tables are created correctly

---

**Built with ❤️ using React, TypeScript, TailwindCSS, and Supabase**
