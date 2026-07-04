import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";

// =========================
// Employee Dashboard
// =========================
export const employeeDashboard = async (req, res) => {
  try {
    const profile = await User.findById(req.user._id).select("-password");

    const attendanceCount = await Attendance.countDocuments({
      employee: req.user._id,
    });

    const leaveCount = await Leave.countDocuments({
      employee: req.user._id,
    });

    const pendingLeaves = await Leave.countDocuments({
      employee: req.user._id,
      status: "Pending",
    });

    return res.status(200).json({
      success: true,

      profile,

      dashboard: {
        attendanceCount,
        leaveCount,
        pendingLeaves,
        salary: profile.salary,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// HR Dashboard
// =========================
export const hrDashboard = async (req, res) => {
  try {
    const employeeCount = await User.countDocuments({
      role: "Employee",
    });

    const attendanceToday = await Attendance.countDocuments({
      date: new Date().toISOString().split("T")[0],
    });

    const pendingLeaves = await Leave.countDocuments({
      status: "Pending",
    });

    return res.status(200).json({
      success: true,

      dashboard: {
        employeeCount,
        attendanceToday,
        pendingLeaves,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};