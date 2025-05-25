const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const verifyToken = require("./middleware/verifyToken"); // <-- JWT middleware

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Define allowed origins
const allowedOrigins = [
  "https://military-asset-manager.vercel.app", // your deployed frontend
  "http://localhost:5173",                     // dev mode
];

// ✅ CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // allow cookies or auth headers
  })
);

// ✅ Preflight support
app.options("*", cors());

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Military Asset Management API running");
});

// Protected route example
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: "Access granted to protected route",
    user: req.user,
  });
});

// API routes
app.use("/api/bases", require("./routes/baseRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/transfers", require("./routes/transferRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/purchases", require("./routes/purchaseRoutes"));
app.use("/api/asset-types", require("./routes/assetTypeRoutes"));
app.use("/api/asset-transactions", require("./routes/assetTransactionsRoutes"));

// Connect DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
