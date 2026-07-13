import User from "../models/User.js";

// ==========================
// GET PROFILE
// ==========================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// UPDATE PROFILE
// ==========================
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Employee can edit only these fields
    user.address = req.body.address || user.address;
    user.phone = req.body.phone || user.phone;
    user.profilePicture =
      req.body.profilePicture || user.profilePicture;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// HR - UPDATE EMPLOYEE PROFILE
// ==========================
export const updateEmployeeProfileByHR = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // HR can edit these fields
    if (req.body.name !== undefined) employee.name = req.body.name;
    if (req.body.dob !== undefined) employee.dob = req.body.dob;
    if (req.body.gender !== undefined) employee.gender = req.body.gender;
    if (req.body.phone !== undefined) employee.phone = req.body.phone;
    if (req.body.address !== undefined) employee.address = req.body.address;
    if (req.body.emergencyContact !== undefined) employee.emergencyContact = req.body.emergencyContact;
    if (req.body.emergencyPhone !== undefined) employee.emergencyPhone = req.body.emergencyPhone;
    if (req.body.designation !== undefined) employee.designation = req.body.designation;
    if (req.body.department !== undefined) employee.department = req.body.department;
    if (req.body.joiningDate !== undefined) employee.joiningDate = req.body.joiningDate;
    if (req.body.reportingManager !== undefined) employee.reportingManager = req.body.reportingManager;
    if (req.body.profilePicture !== undefined) employee.profilePicture = req.body.profilePicture;

    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Employee profile updated successfully by HR",
      user: employee,
    });
  } catch (error) {
    console.error("HR Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// HR - GET ALL EMPLOYEES
// ==========================
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "Employee" }).select("-password");

    return res.status(200).json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error("Get All Employees Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};