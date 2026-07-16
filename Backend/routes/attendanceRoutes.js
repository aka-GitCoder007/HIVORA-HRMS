import express from "express";

import {
  checkIn,
  checkOut,
  myAttendance,
  todayAttendance,
  allAttendance,
} from "../controllers/attendanceController.js";

import {
  protect,
  isHR,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Employee
router.post("/checkin", protect, checkIn);

router.post("/checkout", protect, checkOut);

router.get("/my-attendance", protect, myAttendance);

router.get("/today", protect, todayAttendance);

// HR
router.get("/all", protect, isHR, allAttendance);

export default router;