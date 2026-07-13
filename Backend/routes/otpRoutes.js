import express from "express";

import {
  sendOTP,
  verifyOTP,
} from "../controllers/otpController.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/send", authLimiter, sendOTP);

router.post("/verify", authLimiter, verifyOTP);

export default router;