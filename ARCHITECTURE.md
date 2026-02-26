# 🏗️ System Architecture

Comprehensive architecture documentation for the Delivery Proof Management System.

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                    React + TypeScript                        │
│                      TailwindCSS                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Login/     │  │   Driver     │  │    Admin     │      │
│  │  Register    │  │  Dashboard   │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Warehouse   │  │   Complete   │                        │
│  │   Pickup     │  │   Delivery   │                        │
│  └──────────────┘  └──────────────┘                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/REST API
                       │ JWT Authentication
┌──────────────────────▼──────────────────────────────────────┐
│                    BACKEND (Edge Function)                   │
│                    Hono Web Server on Deno                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │   Delivery   │  │     JWT      │      │
│  │   Routes     │  │    Routes    │  │  Middleware  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Bcrypt     │  │    CORS      │                        │
│  │   Hashing    │  │   Handler    │                        │
│  └──────────────┘  └──────────────┘                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ Supabase Client
                       │ SQL Queries
┌──────────────────────▼──────────────────────────────────────┐
│                       DATABASE                               │
│                    PostgreSQL (Supabase)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │   users table    │───────▶│ deliveries table │          │
│  │                  │ 1:N    │                  │          │
│  │ - id (PK)        │        │ - id (PK)        │          │
│  │ - email          │        │ - driver_id (FK) │          │
│  │ - password_hash  │        │ - before_photo   │          │
│  │ - name           │        │ - after_photo    │          │
│  │ - role           │        │ - warehouse_*    │          │
│  │ - created_at     │        │ - delivery_*     │          │
│  └──────────────────┘        │ - otp            │          │
│                               │ - status         │          │
│                               └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘

External Services:
┌────────────────────┐     ┌────────────────────┐
│  Google Maps API   │     │  Geolocation API   │
│  (Map Embed)       │     │  (GPS Tracking)    │
└────────────────────┘     └────────────────────┘
```

## 🎯 Design Patterns

### Frontend Patterns

#### 1. **Component-Based Architecture**
```
/src/app/
├── components/          # Reusable UI components
│   └── ui/             # Shadcn/ui component library
├── contexts/           # React Context providers
│   └── AuthContext     # Global auth state
├── pages/              # Page-level components
├── services/           # API service layer
└── routes.ts           # Route configuration
```

#### 2. **Context API for State Management**
- `AuthContext` manages global authentication state
- JWT token stored in localStorage
- User information persisted across page refreshes

#### 3. **Service Layer Pattern**
- API calls abstracted into `services/api.ts`
- Centralized error handling
- Consistent request/response formatting

#### 4. **Route-Based Code Splitting**
- React Router for navigation
- Lazy loading of route components
- Protected routes with authentication checks

### Backend Patterns

#### 1. **MVC-inspired Architecture**
```
/supabase/functions/server/
├── index.tsx           # Main server file
│   ├── Routes          # Controllers
│   ├── Middleware      # Auth verification
│   └── Database Access # Models (via Supabase)
```

#### 2. **Middleware Chain**
```
Request → CORS → Logger → Auth Middleware → Route Handler → Response
```

#### 3. **JWT Authentication Flow**
```
1. User submits credentials
2. Server validates against database
3. Server generates JWT with user claims
4. Client stores JWT in localStorage
5. Client sends JWT in Authorization header
6. Server verifies JWT on protected routes
```

## 🔐 Security Architecture

### Authentication & Authorization

#### Token-Based Authentication
```javascript
// Token Generation
jwt.sign(
  { userId, email, role },
  JWT_SECRET,
  { expiresIn: '7d' }
)

// Token Verification
const decoded = jwt.verify(token, JWT_SECRET);
// Check role permissions
```

#### Role-Based Access Control (RBAC)

| Role   | Permissions |
|--------|-------------|
| Driver | - Create deliveries<br>- View own deliveries<br>- Update own deliveries |
| Admin  | - View all deliveries<br>- Update delivery status<br>- Cannot create deliveries |

#### Password Security
```javascript
// Hashing (registration)
bcrypt.hash(password, 10) // 10 salt rounds

// Verification (login)
bcrypt.compare(password, hash)
```

### Data Security

1. **Sensitive Data Protection**
   - Passwords never stored in plain text
   - Service role key never exposed to frontend
   - JWT secret kept in environment variables

2. **SQL Injection Prevention**
   - Parameterized queries via Supabase client
   - No raw SQL with user input

3. **XSS Prevention**
   - React auto-escapes rendered content
   - Content Security Policy headers (production)

## 📡 API Communication Flow

### Request Flow
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  Service │────▶│  Backend │────▶│ Database │
│          │     │  Layer   │     │  Server  │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                        │
                                        ▼
                                   JWT Verify
                                   Role Check
                                   Validation
```

### Response Flow
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │◀────│  Service │◀────│  Backend │◀────│ Database │
│          │     │  Layer   │     │  Server  │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
    │
    ▼
Update UI
Show Toast
Navigate
```

## 🗄️ Database Design

### Entity Relationship Diagram

```
users (1) ──────────── (N) deliveries

users:
- id: UUID (PK)
- email: TEXT (UNIQUE)
- password_hash: TEXT
- name: TEXT
- role: TEXT
- created_at: TIMESTAMPTZ

deliveries:
- id: UUID (PK)
- driver_id: UUID (FK → users.id)
- before_photo: TEXT (base64)
- warehouse_latitude: NUMERIC
- warehouse_longitude: NUMERIC
- delivery_address: TEXT
- after_photo: TEXT (base64)
- delivery_latitude: NUMERIC
- delivery_longitude: NUMERIC
- otp: TEXT
- otp_verified: BOOLEAN
- status: TEXT
- created_at: TIMESTAMPTZ
- completed_at: TIMESTAMPTZ
```

### Indexing Strategy

```sql
-- Primary Keys (auto-indexed)
users.id
deliveries.id

-- Foreign Keys
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);

-- Frequent Queries
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_users_email ON users(email);
```

## 📱 Frontend Architecture

### Component Hierarchy

```
App (RouterProvider)
└── Root
    ├── AuthProvider
    │   └── Toaster
    └── Outlet (Routes)
        ├── Login
        ├── DriverDashboard
        │   ├── Header
        │   ├── ActiveDeliveryAlert
        │   ├── ActionCards
        │   └── RecentDeliveries
        ├── WarehousePickup
        │   ├── PhotoUpload
        │   ├── LocationCapture
        │   ├── GoogleMapsEmbed
        │   └── AddressInput
        ├── CompleteDelivery
        │   ├── PhotoUpload
        │   ├── LocationCapture
        │   ├── GoogleMapsEmbed
        │   └── OTPDisplay
        ├── AdminDashboard
        │   ├── Header
        │   ├── StatsCards
        │   ├── DeliveriesTable
        │   └── ViewDetailsModal
        └── NotFound
```

### State Management Flow

```
Component
    │
    ▼
useAuth() Hook
    │
    ▼
AuthContext
    │
    ├─▶ user state
    ├─▶ token state
    ├─▶ login()
    └─▶ logout()
        │
        ▼
    localStorage
```

### Data Fetching Pattern

```javascript
// 1. Component mounts
useEffect(() => {
  fetchData();
}, []);

// 2. Call API service
const response = await deliveryAPI.getAll();

// 3. Update local state
setDeliveries(response.deliveries);

// 4. UI re-renders
```

## 🔄 Delivery Lifecycle

### State Machine

```
              START
                │
                ▼
         [Register/Login]
                │
                ▼
      Driver Dashboard ◀──────┐
                │              │
                ▼              │
    [Click Warehouse Pickup]  │
                │              │
                ▼              │
      Warehouse Pickup Page    │
      - Upload photo           │
      - Get GPS                │
      - Enter address          │
                │              │
                ▼              │
      [Submit: Start Delivery] │
                │              │
                ▼              │
      Status: "In Transit"     │
                │              │
                ▼              │
    [Click Complete Delivery]  │
                │              │
                ▼              │
     Complete Delivery Page    │
     - Upload photo            │
     - Get GPS                 │
                │              │
                ▼              │
    [Submit: Complete Delivery]│
                │              │
                ▼              │
     Status: "Delivered"       │
     OTP Generated: "123456"   │
                │              │
                ▼              │
        OTP Display            │
                │              │
                └──────────────┘
```

### Admin Flow

```
    Admin Dashboard
           │
           ├─▶ View All Deliveries
           │   └─▶ Filter by Status
           │
           ├─▶ View Delivery Details
           │   ├─▶ See Photos
           │   ├─▶ See Locations
           │   └─▶ See OTP Status
           │
           └─▶ Update Status
               ├─▶ Mark Resolved
               └─▶ Mark Disputed
```

## 🌐 Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────┐
│         CDN / Edge Network              │
│         (Frontend Assets)               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Client Browser                   │
│         (React App)                      │
└─────────────────┬───────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────┐
│    Supabase Edge Functions              │
│    (Backend Server)                      │
│    - Auto-scaling                        │
│    - Global distribution                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    Supabase PostgreSQL                   │
│    - Managed database                    │
│    - Automatic backups                   │
│    - Connection pooling                  │
└─────────────────────────────────────────┘
```

### Environment Configuration

```
Development:
- Local React dev server (Vite)
- Supabase Edge Functions (cloud)
- Supabase PostgreSQL (cloud)

Production:
- Static hosting (Vercel/Netlify/etc)
- Supabase Edge Functions (cloud)
- Supabase PostgreSQL (cloud)
```

## 📊 Performance Considerations

### Frontend Optimization

1. **Code Splitting**
   - Route-based splitting via React Router
   - Dynamic imports for heavy components

2. **Image Handling**
   - Base64 encoding for small images
   - Consider Supabase Storage for larger files

3. **Caching**
   - JWT token cached in localStorage
   - User data cached in AuthContext

### Backend Optimization

1. **Database Queries**
   - Indexed columns for faster lookups
   - Join optimization for delivery queries
   - Pagination for large result sets (future)

2. **API Response**
   - Minimal data transfer
   - Gzip compression (handled by Supabase)

## 🧪 Testing Strategy

### Unit Tests (Future Implementation)
- Component rendering tests
- Service layer tests
- Utility function tests

### Integration Tests (Future Implementation)
- API endpoint tests
- Authentication flow tests
- Database operation tests

### End-to-End Tests (Future Implementation)
- Complete user workflows
- Cross-browser compatibility
- Mobile responsiveness

## 🔮 Scalability Considerations

### Horizontal Scaling
- Supabase Edge Functions auto-scale
- Database connection pooling
- Stateless backend design

### Vertical Scaling
- Database upgrades via Supabase plans
- Image storage migration to Supabase Storage

### Data Growth
- Consider archiving old deliveries
- Implement pagination for large lists
- Add search and filtering capabilities

## 📝 Code Organization Principles

### Frontend
1. **Component Composition** - Small, reusable components
2. **Separation of Concerns** - Logic separated from presentation
3. **DRY Principle** - API calls abstracted to service layer
4. **Consistent Naming** - Clear, descriptive names

### Backend
1. **RESTful Design** - Standard HTTP methods and status codes
2. **Error Handling** - Consistent error responses
3. **Logging** - All requests logged for debugging
4. **Validation** - Input validation on all endpoints

## 🚀 Technology Decisions

### Why React?
- Component-based architecture
- Large ecosystem
- Strong TypeScript support
- Virtual DOM for performance

### Why Supabase?
- PostgreSQL database
- Built-in authentication
- Edge Functions for backend
- Real-time capabilities (future use)

### Why TailwindCSS?
- Utility-first approach
- Responsive design utilities
- Consistent design system
- Small bundle size with purging

### Why JWT?
- Stateless authentication
- Scalable across servers
- Standard industry practice
- Easy to implement

## 📚 Further Reading

- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [JWT Introduction](https://jwt.io/introduction)
- [REST API Best Practices](https://restfulapi.net)

---

**Architecture Version:** 1.0  
**Last Updated:** February 26, 2024  
**Maintainer:** Development Team
