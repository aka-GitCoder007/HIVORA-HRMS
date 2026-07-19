
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Removed sensitive console logs for security

connectDB();

const app = express();


const getAllowedOrigins = () => {
  const origins = [
    "http://localhost:3000",
    "http://localhost:3001",
  ];

  // Support comma-separated FRONTEND_URLS (e.g., https://domain1.com,https://domain2.com)
  if (process.env.FRONTEND_URLS) {
    const envUrls = process.env.FRONTEND_URLS.split(",").map(url => url.trim().replace(/\/$/, ""));
    origins.push(...envUrls);
  } else if (process.env.FRONTEND_URL) {
    // Fallback for older .env files
    origins.push(process.env.FRONTEND_URL.trim().replace(/\/$/, ""));
  }

  return [...new Set(origins)]; // Remove duplicates
};

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");
      
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      
      console.error(`❌ CORS blocked request from origin: ${origin}`);
      console.error(`   Allowed origins are: ${allowedOrigins.join(', ')}`);
      return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/auth", authRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/leave", leaveRoutes);

app.use("/api/payroll", payrollRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/otp", otpRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.send("HRMS Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});