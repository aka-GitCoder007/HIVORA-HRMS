import express from "express";

import {
  employeeDashboard,
  hrDashboard,
} from "../controllers/dashboardController.js";

import {
  protect,
  isHR,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Employee Dashboard
router.get("/employee", protect, employeeDashboard);

// HR Dashboard
router.get("/hr", protect, isHR, hrDashboard);

export default router;