import express from "express";

import {
  employeeDashboard,
  hrDashboard,
} from "../controllers/dashboardController.js";

import {
  protect,
  isHR,
  isEmployee,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Employee Dashboard
router.get("/employee", protect, isEmployee, employeeDashboard);

// HR Dashboard
router.get("/hr", protect, isHR, hrDashboard);

export default router;