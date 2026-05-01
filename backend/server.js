const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
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

app.get("/", (req, res) => {
  res.send("API Running...");
});

// Connect to MongoDB before serving requests.
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bakeryDB")
.then(() => {})
.catch(() => {});

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
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5500/index.html";
  let adminPortalUrl = process.env.ADMIN_PORTAL_URL;

  if (!adminPortalUrl) {
    try {
      const parsedFrontendUrl = new URL(frontendUrl);
      parsedFrontendUrl.pathname = "/admin-portal/admin-login.html";
      parsedFrontendUrl.search = "";
      parsedFrontendUrl.hash = "";
      adminPortalUrl = parsedFrontendUrl.toString();
    } catch (error) {
      adminPortalUrl = "http://localhost:5500/admin-portal/admin-login.html";
    }
  }

  console.log(`Frontend: ${frontendUrl}`);
  console.log(`Admin Portal: ${adminPortalUrl}`);
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log(`API base: http://localhost:${PORT}/api`);
});
