import Leave from "../models/Leave.js";

// Employee - Apply Leave
export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, remarks } = req.body;

    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      startDate,
      endDate,
      remarks,
    });

    return res.status(201).json({
      success: true,
      message: "Leave request submitted.",
      leave,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Employee - View Own Leaves
export const myLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      employee: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// HR - View All Leave Requests
export const allLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "employeeId name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// HR - Approve / Reject Leave
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, hrComment } = req.body;

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
      });
    }

    leave.status = status;
    leave.hrComment = hrComment;

    await leave.save();

    res.status(200).json({
      success: true,
      message: "Leave updated successfully.",
      leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};