const express = require("express");
const cors    = require("cors");

// Load env first
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect DB
require("./config/db")();

// Health check
app.get("/",    (req, res) => res.json({ message: "RentWise API ✅" }));
app.get("/api", (req, res) => res.json({ message: "RentWise API ✅" }));

// Routes
app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/assets",    require("./routes/assetRoutes"));
app.use("/api/rentals",   require("./routes/rentalRoutes"));
app.use("/api/payments",  require("./routes/paymentRoutes"));
app.use("/api/tenants",   require("./routes/tenantRoutes"));
app.use("/api/support",   require("./routes/supportRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Error
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: err.message });
});

// Local only
if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT || 5000, () => {
    console.log("Server running");
  });
}

module.exports = app;
