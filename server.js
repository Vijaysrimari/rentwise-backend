const express  = require("express");
const cors     = require("cors");
const dotenv   = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://rentwise-frontend-eight.vercel.app",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "RentWise API running ✅" });
});

app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/assets",    require("./routes/assetRoutes"));
app.use("/api/rentals",   require("./routes/rentalRoutes"));
app.use("/api/payments",  require("./routes/paymentRoutes"));
app.use("/api/tenants",   require("./routes/tenantRoutes"));
app.use("/api/support",   require("./routes/supportRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
