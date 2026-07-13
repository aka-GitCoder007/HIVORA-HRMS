import express from "express";
import {
  getProfile,
  updateProfile,
  updateEmployeeProfileByHR,
  getAllEmployees,
} from "../controllers/profileController.js";

import { protect, isHR } from "../middleware/authMiddleware.js";
import { profileValidation, validate } from "../middleware/validator.js";

const router = express.Router();

// Employee Profile
router.get("/", protect, getProfile);
router.put("/", protect, profileValidation, validate, updateProfile);

// HR Profile update of employees
router.put("/:id", protect, isHR, profileValidation, validate, updateEmployeeProfileByHR);

// HR - Get All Employees
router.get("/all", protect, isHR, getAllEmployees);

export default router;