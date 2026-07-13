import express from "express";

import {
  getMyPayroll,
  getAllPayroll,
  updatePayroll,
} from "../controllers/payrollController.js";

import { protect, isHR } from "../middleware/authMiddleware.js";
import { payrollValidation, validate } from "../middleware/validator.js";

const router = express.Router();

// Employee
router.get("/my", protect, getMyPayroll);

// HR
router.get("/all", protect, isHR, getAllPayroll);
router.put("/:id", protect, isHR, payrollValidation, validate, updatePayroll);

export default router;