const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const motorDBRoutes = require("./routes/motorDBRoutes");
const conexionDBRoutes = require("./routes/conexionDBRoutes");
const aiRoutes = require("./routes/aiRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const chatRoutes = require("./routes/chatRoutes");

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple route for testing
app.get("/", (req, res) => {
  res.json({ message: "Welcome to NexoSQL API" });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/motores", motorDBRoutes);
app.use("/api/conexiones", conexionDBRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/chats", chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler - should be the last route
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;
