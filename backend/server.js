require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/AWDF";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/todos", todoRoutes);
app.use("/todos", todoRoutes);

// Base route healthcheck
app.get("/", (req, res) => {
  res.send("Task Manager API is running...");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

