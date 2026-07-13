import Attendance from "../models/Attendance.js";

// ==============================
// Employee Check-In
// ==============================
export const checkIn = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA');

    const existing = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Already checked in today.",
      });
    }

    const attendance = await Attendance.create({
      employee: req.user._id,
      date: today,
      checkIn: new Date().toLocaleTimeString(),
      status: "Present",
    });

    return res.status(201).json({
      success: true,
      message: "Checked in successfully",
      attendance,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// Employee Check-Out
// ==============================
export const checkOut = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA');

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "No check-in found.",
      });
    }

    attendance.checkOut = new Date().toLocaleTimeString();

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Checked out successfully",
      attendance,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// Employee Attendance
// ==============================
export const myAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      employee: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// HR View All Attendance
// ==============================
export const allAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate("employee", "employeeId name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};