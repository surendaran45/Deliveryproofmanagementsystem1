# 📡 API Documentation

Complete API reference for the Delivery Proof Management System backend.

## 🌐 Base URL

```
https://[YOUR_PROJECT_ID].supabase.co/functions/v1/make-server-cca17b23/api
```

Replace `[YOUR_PROJECT_ID]` with your actual Supabase project ID.

## 🔑 Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are obtained from login or registration endpoints and are valid for 7 days.

## 📋 API Endpoints

### Authentication Endpoints

#### 1. Register User

**Endpoint:** `POST /auth/register`

**Description:** Create a new user account

**Authentication:** None required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "driver" // or "admin"
}
```

**Response (200):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "driver"
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `400` - Invalid role (must be 'admin' or 'driver')
- `400` - User with this email already exists
- `500` - Internal server error

---

#### 2. Login User

**Endpoint:** `POST /auth/login`

**Description:** Authenticate existing user

**Authentication:** None required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "driver"
  }
}
```

**Error Responses:**
- `400` - Email and password are required
- `401` - Invalid email or password
- `500` - Internal server error

---

### Delivery Endpoints

#### 3. Start Delivery (Warehouse Pickup)

**Endpoint:** `POST /deliveries/start`

**Description:** Start a new delivery from warehouse

**Authentication:** Required (Driver only)

**Request Body:**
```json
{
  "before_photo": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "warehouse_latitude": 40.7128,
  "warehouse_longitude": -74.0060,
  "delivery_address": "123 Main St, New York, NY 10001"
}
```

**Field Details:**
- `before_photo`: Base64-encoded image string
- `warehouse_latitude`: Numeric GPS latitude
- `warehouse_longitude`: Numeric GPS longitude
- `delivery_address`: Full delivery address as text

**Response (200):**
```json
{
  "message": "Delivery started successfully",
  "delivery": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "driver_id": "550e8400-e29b-41d4-a716-446655440000",
    "before_photo": "data:image/jpeg;base64,...",
    "warehouse_latitude": 40.7128,
    "warehouse_longitude": -74.0060,
    "delivery_address": "123 Main St, New York, NY 10001",
    "status": "In Transit",
    "created_at": "2024-02-26T10:30:00Z",
    "after_photo": null,
    "delivery_latitude": null,
    "delivery_longitude": null,
    "otp": null,
    "otp_verified": false,
    "completed_at": null
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `403` - Only drivers can start deliveries
- `401` - Unauthorized (invalid/missing token)
- `500` - Internal server error

---

#### 4. Complete Delivery

**Endpoint:** `POST /deliveries/complete`

**Description:** Complete an active delivery and generate OTP

**Authentication:** Required (Driver only)

**Request Body:**
```json
{
  "delivery_id": "660e8400-e29b-41d4-a716-446655440001",
  "after_photo": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "delivery_latitude": 40.7580,
  "delivery_longitude": -73.9855
}
```

**Response (200):**
```json
{
  "message": "Delivery completed successfully",
  "delivery": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "driver_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "Delivered",
    "after_photo": "data:image/jpeg;base64,...",
    "delivery_latitude": 40.7580,
    "delivery_longitude": -73.9855,
    "otp": "123456",
    "completed_at": "2024-02-26T12:30:00Z",
    // ... other fields
  },
  "otp": "123456"
}
```

**Error Responses:**
- `400` - Missing required fields
- `400` - Delivery is not in transit
- `403` - Only drivers can complete deliveries
- `404` - Delivery not found or unauthorized
- `401` - Unauthorized (invalid/missing token)
- `500` - Internal server error

---

#### 5. Verify OTP

**Endpoint:** `POST /deliveries/verify-otp`

**Description:** Verify delivery OTP

**Authentication:** Required

**Request Body:**
```json
{
  "delivery_id": "660e8400-e29b-41d4-a716-446655440001",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "message": "OTP verified successfully"
}
```

**Error Responses:**
- `400` - Missing delivery_id or otp
- `400` - Invalid OTP
- `404` - Delivery not found
- `401` - Unauthorized (invalid/missing token)
- `500` - Internal server error

---

#### 6. Get All Deliveries

**Endpoint:** `GET /deliveries`

**Description:** Get deliveries (Admin sees all, Driver sees own)

**Authentication:** Required

**Response (200):**
```json
{
  "deliveries": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "driver_id": "550e8400-e29b-41d4-a716-446655440000",
      "before_photo": "data:image/jpeg;base64,...",
      "warehouse_latitude": 40.7128,
      "warehouse_longitude": -74.0060,
      "delivery_address": "123 Main St, New York, NY 10001",
      "after_photo": "data:image/jpeg;base64,...",
      "delivery_latitude": 40.7580,
      "delivery_longitude": -73.9855,
      "otp": "123456",
      "otp_verified": true,
      "status": "Delivered",
      "created_at": "2024-02-26T10:30:00Z",
      "completed_at": "2024-02-26T12:30:00Z",
      "driver": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
    // ... more deliveries
  ]
}
```

**Error Responses:**
- `401` - Unauthorized (invalid/missing token)
- `500` - Internal server error

---

#### 7. Resolve Delivery

**Endpoint:** `PATCH /deliveries/:id/resolve`

**Description:** Mark delivery as resolved

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id`: Delivery UUID

**Response (200):**
```json
{
  "message": "Delivery resolved successfully"
}
```

**Error Responses:**
- `403` - Only admins can resolve deliveries
- `401` - Unauthorized (invalid/missing token)
- `500` - Internal server error

---

#### 8. Dispute Delivery

**Endpoint:** `PATCH /deliveries/:id/dispute`

**Description:** Mark delivery as disputed

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id`: Delivery UUID

**Response (200):**
```json
{
  "message": "Delivery disputed successfully"
}
```

**Error Responses:**
- `403` - Only admins can dispute deliveries
- `401` - Unauthorized (invalid/missing token)
- `500` - Internal server error

---

## 🔐 JWT Token Structure

The JWT token contains the following claims:

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "role": "driver",
  "iat": 1708948200,
  "exp": 1709553000
}
```

- `userId`: User's UUID
- `email`: User's email address
- `role`: User's role ('admin' or 'driver')
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (7 days from issue)

## 📊 Delivery Status Values

Deliveries progress through these statuses:

| Status | Description | Can be set by |
|--------|-------------|---------------|
| `Pending` | Initial state (not used in current flow) | System |
| `In Transit` | Pickup complete, delivery in progress | Driver (via start) |
| `Delivered` | Delivery completed, OTP generated | Driver (via complete) |
| `Resolved` | Admin confirmed successful delivery | Admin only |
| `Disputed` | Admin marked as problematic | Admin only |

## 🔄 Typical Workflow Sequence

### Driver Starting Delivery:
1. `POST /auth/login` - Get authentication token
2. `POST /deliveries/start` - Start delivery from warehouse
3. `GET /deliveries` - View active delivery
4. `POST /deliveries/complete` - Complete delivery, get OTP
5. Share OTP with recipient

### Admin Monitoring:
1. `POST /auth/login` - Get authentication token
2. `GET /deliveries` - View all deliveries
3. `PATCH /deliveries/:id/resolve` - Mark as resolved
4. OR `PATCH /deliveries/:id/dispute` - Mark as disputed

## 🐛 Error Response Format

All error responses follow this format:

```json
{
  "error": "Description of what went wrong"
}
```

## 📝 Request/Response Examples

### Example: Complete Driver Flow

**1. Login**
```bash
curl -X POST https://[PROJECT_ID].supabase.co/functions/v1/make-server-cca17b23/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@test.com",
    "password": "driver123"
  }'
```

**2. Start Delivery**
```bash
curl -X POST https://[PROJECT_ID].supabase.co/functions/v1/make-server-cca17b23/api/deliveries/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "before_photo": "data:image/jpeg;base64,...",
    "warehouse_latitude": 40.7128,
    "warehouse_longitude": -74.0060,
    "delivery_address": "123 Main St, New York, NY"
  }'
```

**3. Complete Delivery**
```bash
curl -X POST https://[PROJECT_ID].supabase.co/functions/v1/make-server-cca17b23/api/deliveries/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "delivery_id": "660e8400-e29b-41d4-a716-446655440001",
    "after_photo": "data:image/jpeg;base64,...",
    "delivery_latitude": 40.7580,
    "delivery_longitude": -73.9855
  }'
```

## 🔒 Security Best Practices

1. **Always use HTTPS** - Never send tokens over HTTP
2. **Store tokens securely** - Use httpOnly cookies or secure localStorage
3. **Validate inputs** - All inputs are validated server-side
4. **Check permissions** - Backend enforces role-based access
5. **Rate limiting** - Consider implementing rate limits for production
6. **Token expiration** - Tokens expire after 7 days, implement refresh flow

## 🧪 Testing with Postman/Insomnia

Import this collection structure:

1. Create environment variables:
   - `base_url`: `https://[PROJECT_ID].supabase.co/functions/v1/make-server-cca17b23/api`
   - `token`: (will be set after login)

2. Set up requests as documented above
3. Use `{{base_url}}` and `{{token}}` variables
4. Chain requests: Login → Save token → Use in subsequent requests

## 📚 Additional Notes

- **Base64 Images**: Keep images reasonably sized (< 5MB) to avoid database bloat
- **GPS Accuracy**: Coordinates should have 6 decimal places for ~10cm accuracy
- **Concurrent Requests**: Server handles concurrent requests safely
- **Database Transactions**: Updates use proper transaction handling
- **CORS**: Enabled for all origins (restrict for production)

---

**API Version:** 1.0  
**Last Updated:** February 26, 2024  
**Backend Framework:** Hono on Deno  
**Database:** PostgreSQL via Supabase
