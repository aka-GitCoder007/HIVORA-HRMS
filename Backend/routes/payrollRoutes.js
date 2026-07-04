import express from "express";

import {
  getMyPayroll,
  getAllPayroll,
  updatePayroll,
} from "../controllers/payrollController.js";

import { protect, isHR } from "../middleware/authMiddleware.js";

const router = express.Router();

// Employee
router.get("/my", protect, getMyPayroll);

// HR
router.get("/all", protect, isHR, getAllPayroll);
router.put("/:id", protect, isHR, updatePayroll);

export default router;