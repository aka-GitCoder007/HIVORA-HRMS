import express from "express";

import {
  applyLeave,
  myLeaves,
  allLeaves,
  updateLeaveStatus,
} from "../controllers/leaveController.js";

import {
  protect,
  isHR,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Employee
router.post("/apply", protect, applyLeave);
router.get("/my-leaves", protect, myLeaves);

// HR
router.get("/all", protect, isHR, allLeaves);

router.put("/:id", protect, isHR, updateLeaveStatus);

export default router;