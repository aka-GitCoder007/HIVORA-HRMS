import express from "express";
import {
  getProfile,
  updateProfile,
} from "../controllers/profileController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Employee Profile
router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);

export default router;