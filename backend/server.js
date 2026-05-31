const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ override: true });
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// Parse JSON bodies and regular form submissions.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow the frontend to call the API during local development.
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));

// Avoid caching API responses so the shop stays up to date.
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }

  next();
});

const projectRoot = path.resolve(__dirname, "..");

// Serve static files with virtual path prefixes
app.use("/images", express.static(path.join(projectRoot, "images")));
app.use("/admin-portal", express.static(path.join(projectRoot, "frontend/admin-portal")));
app.use("/shop", express.static(path.join(projectRoot, "frontend/shop")));
app.use(express.static(path.join(projectRoot, "frontend/pages")));
app.use(express.static(path.join(projectRoot, "frontend/styles")));

// API Base - Show available endpoints (MUST BE BEFORE catch-all routes!)
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to Bite of Bliss API",
    version: "1.0.0",
    baseUrl: "http://localhost:5001/api",
    endpoints: {
      authentication: {
        register: {
          method: "POST",
          path: "/api/auth/register",
          body: { name: "string", email: "string", password: "string (min 6 chars)" },
          returns: { token: "string", user: "object" }
        },
        login: {
          method: "POST",
          path: "/api/auth/login",
          body: { email: "string", password: "string" },
          returns: { token: "string", user: "object" }
        }
      },
      products: {
        getAll: {
          method: "GET",
          path: "/api/products",
          auth: "Not required",
          returns: "array of products"
        },
        getById: {
          method: "GET",
          path: "/api/products/:id",
          auth: "Not required",
          returns: "single product object"
        },
        create: {
          method: "POST",
          path: "/api/products",
          auth: "Required (admin)",
          body: { name: "string", price: "number", category: "string", stock: "number" },
          returns: "created product"
        },
        update: {
          method: "PUT",
          path: "/api/products/:id",
          auth: "Required (admin)",
          body: "product fields to update",
          returns: "updated product"
        },
        delete: {
          method: "DELETE",
          path: "/api/products/:id",
          auth: "Required (admin)",
          returns: "success message"
        }
      },
      orders: {
        create: {
          method: "POST",
          path: "/api/orders",
          auth: "Required",
          body: { items: "array", shippingAddress: "string" },
          returns: "created order"
        },
        getMyOrders: {
          method: "GET",
          path: "/api/orders/my-orders",
          auth: "Required",
          returns: "array of user's orders"
        },
        getAll: {
          method: "GET",
          path: "/api/orders",
          auth: "Required (admin)",
          returns: "array of all orders"
        },
        updateStatus: {
          method: "PUT",
          path: "/api/orders/:id/status",
          auth: "Required (admin)",
          body: { status: "string (pending|confirmed|preparing|delivered|cancelled)" },
          returns: "updated order"
        },
        delete: {
          method: "DELETE",
          path: "/api/orders/:id",
          auth: "Required (admin)",
          returns: "success message"
        }
      }
    },
    authHeader: "Authorization: Bearer <token>",
    note: "Use Authorization header with Bearer token for authenticated endpoints"
  });
});

// Route handlers for specific pages
app.get("/", (req, res) => {
  res.sendFile(path.join(projectRoot, "frontend/pages/index.html"));
});

app.get("/admin-login.html", (req, res) => {
  res.sendFile(path.join(projectRoot, "frontend/admin-portal/admin-login.html"));
});

app.get("/admin-dashboard.html", (req, res) => {
  res.sendFile(path.join(projectRoot, "frontend/admin-portal/admin-dashboard.html"));
});

app.get("/admin-orders.html", (req, res) => {
  res.sendFile(path.join(projectRoot, "frontend/shop/admin-orders.html"));
});

app.get("/signin.html", (req, res) => {
  res.sendFile(path.join(projectRoot, "frontend/pages/signin.html"));
});

app.get("/signup.html", (req, res) => {
  res.sendFile(path.join(projectRoot, "frontend/pages/signup.html"));
});

// Catch-all for blog pages and other files with extensions
app.get("/:page.html", (req, res) => {
  const filePath = path.join(projectRoot, "frontend/pages", req.params.page + ".html");
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: "Page not found" });
    }
  });
});

// Catch-all for other static assets (css, js, etc)
app.get("/:file", (req, res) => {
  const fileName = req.params.file;
  
  // Try different locations
  const filePaths = [
    path.join(projectRoot, "frontend", fileName),
    path.join(projectRoot, "frontend/pages", fileName),
    path.join(projectRoot, "frontend/styles", fileName),
    path.join(projectRoot, "frontend/shop", fileName),
    path.join(projectRoot, "images", fileName)
  ];
  
  for (const filePath of filePaths) {
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }
  
  res.status(404).json({ error: "Resource not found" });
});

// Connect to MongoDB before serving requests.
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bakeryDB")
.then(() => {
  console.log("MongoDB connected");
})
.catch((err) => {
  console.error("MongoDB connection failed:", err.message);
});

// Application routes.
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Project running at http://localhost:${PORT}`);
  console.log(`Admin Portal: http://localhost:${PORT}/admin-portal/admin-login.html`);
  console.log(`API base: http://localhost:${PORT}/api`);
});
