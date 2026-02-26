import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as bcrypt from "npm:bcryptjs@2.4.3";
import * as jwt from "npm:jsonwebtoken@9.0.2";

const app = new Hono();

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "your-secret-key-change-in-production";

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// Middleware to verify JWT token
async function verifyToken(c: any, next: any) {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "No token provided" }, 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    c.set("userId", decoded.userId);
    c.set("userRole", decoded.role);
    await next();
  } catch (error) {
    console.log("Token verification error:", error);
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}

// Health check endpoint
app.get("/make-server-cca17b23/health", (c) => {
  return c.json({ status: "ok" });
});

// ============================================
// AUTH ROUTES
// ============================================

// Register
app.post("/make-server-cca17b23/api/auth/register", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password || !name || !role) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (!["admin", "driver"].includes(role)) {
      return c.json({ error: "Invalid role. Must be 'admin' or 'driver'" }, 400);
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return c.json({ error: "User with this email already exists" }, 400);
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const { data, error } = await supabase
      .from("users")
      .insert({
        email,
        password_hash,
        name,
        role,
      })
      .select()
      .single();

    if (error) {
      console.log("Error registering user:", error);
      return c.json({ error: "Failed to register user: " + error.message }, 500);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: data.id, email: data.email, role: data.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return c.json({
      message: "User registered successfully",
      token,
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
      },
    });
  } catch (error) {
    console.log("Registration error:", error);
    return c.json({ error: "Internal server error during registration: " + error }, 500);
  }
});

// Login
app.post("/make-server-cca17b23/api/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Get user
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      console.log("User not found error:", error);
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return c.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Login error:", error);
    return c.json({ error: "Internal server error during login: " + error }, 500);
  }
});

// ============================================
// DELIVERY ROUTES
// ============================================

// Start delivery (Warehouse Pickup)
app.post("/make-server-cca17b23/api/deliveries/start", verifyToken, async (c) => {
  try {
    const userId = c.get("userId");
    const userRole = c.get("userRole");

    if (userRole !== "driver") {
      return c.json({ error: "Only drivers can start deliveries" }, 403);
    }

    const {
      before_photo,
      warehouse_latitude,
      warehouse_longitude,
      delivery_address,
    } = await c.req.json();

    if (!before_photo || !warehouse_latitude || !warehouse_longitude || !delivery_address) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Insert delivery
    const { data, error } = await supabase
      .from("deliveries")
      .insert({
        driver_id: userId,
        before_photo,
        warehouse_latitude: parseFloat(warehouse_latitude),
        warehouse_longitude: parseFloat(warehouse_longitude),
        delivery_address,
        status: "In Transit",
      })
      .select()
      .single();

    if (error) {
      console.log("Error starting delivery:", error);
      return c.json({ error: "Failed to start delivery: " + error.message }, 500);
    }

    return c.json({
      message: "Delivery started successfully",
      delivery: data,
    });
  } catch (error) {
    console.log("Start delivery error:", error);
    return c.json({ error: "Internal server error while starting delivery: " + error }, 500);
  }
});

// Complete delivery
app.post("/make-server-cca17b23/api/deliveries/complete", verifyToken, async (c) => {
  try {
    const userId = c.get("userId");
    const userRole = c.get("userRole");

    if (userRole !== "driver") {
      return c.json({ error: "Only drivers can complete deliveries" }, 403);
    }

    const {
      delivery_id,
      after_photo,
      delivery_latitude,
      delivery_longitude,
    } = await c.req.json();

    if (!delivery_id || !after_photo || !delivery_latitude || !delivery_longitude) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Verify delivery belongs to this driver
    const { data: existingDelivery, error: fetchError } = await supabase
      .from("deliveries")
      .select("*")
      .eq("id", delivery_id)
      .eq("driver_id", userId)
      .single();

    if (fetchError || !existingDelivery) {
      console.log("Delivery not found error:", fetchError);
      return c.json({ error: "Delivery not found or unauthorized" }, 404);
    }

    if (existingDelivery.status !== "In Transit") {
      return c.json({ error: "Delivery is not in transit" }, 400);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update delivery
    const { data, error } = await supabase
      .from("deliveries")
      .update({
        after_photo,
        delivery_latitude: parseFloat(delivery_latitude),
        delivery_longitude: parseFloat(delivery_longitude),
        otp,
        status: "Delivered",
        completed_at: new Date().toISOString(),
      })
      .eq("id", delivery_id)
      .select()
      .single();

    if (error) {
      console.log("Error completing delivery:", error);
      return c.json({ error: "Failed to complete delivery: " + error.message }, 500);
    }

    return c.json({
      message: "Delivery completed successfully",
      delivery: data,
      otp: otp,
    });
  } catch (error) {
    console.log("Complete delivery error:", error);
    return c.json({ error: "Internal server error while completing delivery: " + error }, 500);
  }
});

// Verify OTP
app.post("/make-server-cca17b23/api/deliveries/verify-otp", verifyToken, async (c) => {
  try {
    const { delivery_id, otp } = await c.req.json();

    if (!delivery_id || !otp) {
      return c.json({ error: "Missing delivery_id or otp" }, 400);
    }

    // Get delivery
    const { data: delivery, error: fetchError } = await supabase
      .from("deliveries")
      .select("*")
      .eq("id", delivery_id)
      .single();

    if (fetchError || !delivery) {
      console.log("Delivery not found for OTP verification:", fetchError);
      return c.json({ error: "Delivery not found" }, 404);
    }

    if (delivery.otp !== otp) {
      return c.json({ error: "Invalid OTP" }, 400);
    }

    // Update otp_verified
    const { error: updateError } = await supabase
      .from("deliveries")
      .update({ otp_verified: true })
      .eq("id", delivery_id);

    if (updateError) {
      console.log("Error verifying OTP:", updateError);
      return c.json({ error: "Failed to verify OTP: " + updateError.message }, 500);
    }

    return c.json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.log("Verify OTP error:", error);
    return c.json({ error: "Internal server error while verifying OTP: " + error }, 500);
  }
});

// Get all deliveries (Admin sees all, Driver sees own)
app.get("/make-server-cca17b23/api/deliveries", verifyToken, async (c) => {
  try {
    const userId = c.get("userId");
    const userRole = c.get("userRole");

    let query = supabase
      .from("deliveries")
      .select(`
        *,
        driver:driver_id (
          id,
          name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    // If driver, only show their deliveries
    if (userRole === "driver") {
      query = query.eq("driver_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.log("Error fetching deliveries:", error);
      return c.json({ error: "Failed to fetch deliveries: " + error.message }, 500);
    }

    return c.json({
      deliveries: data,
    });
  } catch (error) {
    console.log("Get deliveries error:", error);
    return c.json({ error: "Internal server error while fetching deliveries: " + error }, 500);
  }
});

// Resolve delivery (Admin only)
app.patch("/make-server-cca17b23/api/deliveries/:id/resolve", verifyToken, async (c) => {
  try {
    const userRole = c.get("userRole");

    if (userRole !== "admin") {
      return c.json({ error: "Only admins can resolve deliveries" }, 403);
    }

    const deliveryId = c.req.param("id");

    const { error } = await supabase
      .from("deliveries")
      .update({ status: "Resolved" })
      .eq("id", deliveryId);

    if (error) {
      console.log("Error resolving delivery:", error);
      return c.json({ error: "Failed to resolve delivery: " + error.message }, 500);
    }

    return c.json({
      message: "Delivery resolved successfully",
    });
  } catch (error) {
    console.log("Resolve delivery error:", error);
    return c.json({ error: "Internal server error while resolving delivery: " + error }, 500);
  }
});

// Dispute delivery (Admin only)
app.patch("/make-server-cca17b23/api/deliveries/:id/dispute", verifyToken, async (c) => {
  try {
    const userRole = c.get("userRole");

    if (userRole !== "admin") {
      return c.json({ error: "Only admins can dispute deliveries" }, 403);
    }

    const deliveryId = c.req.param("id");

    const { error } = await supabase
      .from("deliveries")
      .update({ status: "Disputed" })
      .eq("id", deliveryId);

    if (error) {
      console.log("Error disputing delivery:", error);
      return c.json({ error: "Failed to dispute delivery: " + error.message }, 500);
    }

    return c.json({
      message: "Delivery disputed successfully",
    });
  } catch (error) {
    console.log("Dispute delivery error:", error);
    return c.json({ error: "Internal server error while disputing delivery: " + error }, 500);
  }
});

Deno.serve(app.fetch);
