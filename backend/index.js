const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const verifyToken = require("./middleware/verifyToken"); // <-- JWT middleware

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
app.use("/api/auth", require("./routes/authRoutes")); // Auth routes to handle JWT-based register/login
app.use("/api/purchases", require("./routes/purchaseRoutes"));
app.use("/api/asset-types", require("./routes/assetTypeRoutes"));
app.use("/api/asset-transactions", require("./routes/assetTransactionsRoutes"));

// Connect DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
