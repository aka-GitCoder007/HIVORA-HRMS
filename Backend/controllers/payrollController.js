import User from "../models/User.js";

// Employee - View Own Payroll
export const getMyPayroll = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name employeeId department designation salary basicPay hra allowances deductions"
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
      "name employeeId department designation salary basicPay hra allowances deductions"
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
    const { basicPay, hra, allowances, deductions, department, designation } = req.body;

    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (basicPay !== undefined) employee.basicPay = Number(basicPay);
    if (hra !== undefined) employee.hra = Number(hra);
    if (allowances !== undefined) employee.allowances = Number(allowances);
    if (deductions !== undefined) employee.deductions = Number(deductions);

    // Calculate total salary dynamically
    const finalBasic = basicPay !== undefined ? Number(basicPay) : (employee.basicPay || 0);
    const finalHra = hra !== undefined ? Number(hra) : (employee.hra || 0);
    const finalAllowances = allowances !== undefined ? Number(allowances) : (employee.allowances || 0);
    const finalDeductions = deductions !== undefined ? Number(deductions) : (employee.deductions || 0);
    
    employee.salary = finalBasic + finalHra + finalAllowances - finalDeductions;

    if (department !== undefined) employee.department = department;
    if (designation !== undefined) employee.designation = designation;

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