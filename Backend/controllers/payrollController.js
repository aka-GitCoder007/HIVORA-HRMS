import User from "../models/User.js";

// Employee - View Own Payroll
export const getMyPayroll = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name employeeId department designation salary"
    );

    return res.status(200).json({
      success: true,
      payroll: user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// HR - View All Payroll
export const getAllPayroll = async (req, res) => {
  try {
    const employees = await User.find().select(
      "name employeeId department designation salary"
    );

    return res.status(200).json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// HR - Update Payroll
export const updatePayroll = async (req, res) => {
  try {
    const { salary, department, designation } = req.body;

    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (salary !== undefined) employee.salary = salary;
    if (department) employee.department = department;
    if (designation) employee.designation = designation;

    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Payroll updated successfully",
      employee,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};