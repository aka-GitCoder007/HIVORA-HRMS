import express from "express";
import {
  signup,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

import { signupValidation, loginValidation, validate } from "../middleware/validator.js";

const router = express.Router();

// Public Routes
router.post("/signup", signupValidation, validate, signup);
router.post("/login", loginValidation, validate, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected Route
router.get("/me", protect, getMe);

export default router;