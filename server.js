const express   = require("express");
const cors      = require("cors");
const dotenv    = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
connectDB();

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// -- Health check -- MUST be first --
app.get("/", (req, res) => {
  res.status(200).json({
    message: "RentWise API running ✅",
    env:     process.env.NODE_ENV || "development",
    time:    new Date().toISOString(),
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    message: "RentWise API ✅"
  });
});

// -- Routes --
app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/assets",    require("./routes/assetRoutes"));
app.use("/api/rentals",   require("./routes/rentalRoutes"));
app.use("/api/payments",  require("./routes/paymentRoutes"));
app.use("/api/tenants",   require("./routes/tenantRoutes"));
app.use("/api/support",   require("./routes/supportRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// -- 404 --
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.url} not found`
  });
});

// -- Error handler --
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    message: err.message || "Server Error"
  });
});

// -- Local dev only --
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// -- Export for Vercel --
module.exports = app;
