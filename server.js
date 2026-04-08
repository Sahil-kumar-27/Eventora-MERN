const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const authRoutes = require("./src/routes/auth.routes");
const eventRoutes = require("./src/routes/events.routes");
const bookingRoutes = require("./src/routes/bookings.routes");

const app = express();

// ================= Middleware =================
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= API Health Route =================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Eventora backend is live 🚀",
  });
});

// ================= API Routes =================
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

// ================= Frontend Static =================
app.use(express.static(path.join(__dirname, "public")));

// ================= React SPA Fallback =================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ================= Database + Server Start =================
const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/eventora";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });