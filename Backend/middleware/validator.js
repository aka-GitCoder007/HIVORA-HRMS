import { body, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

export const signupValidation = [
  body("employeeId").trim().escape().notEmpty().withMessage("Employee ID is required"),
  body("name").trim().escape().notEmpty().withMessage("Name is required"),
  body("email").trim().normalizeEmail().isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("role").trim().escape().notEmpty().withMessage("Role is required"),
];

export const loginValidation = [
  body("email").trim().normalizeEmail().isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const leaveValidation = [
  body("leaveType").trim().escape().notEmpty().withMessage("Leave type is required"),
  body("startDate").trim().escape().notEmpty().withMessage("Start date is required"),
  body("endDate").trim().escape().notEmpty().withMessage("End date is required"),
];

export const attendanceValidation = [
  // Depends on what fields are sent; maybe empty for checkin/checkout if they don't send a body
];

export const payrollValidation = [
  body("salary").optional().isNumeric(),
  body("basicPay").optional().isNumeric(),
  body("hra").optional().isNumeric(),
];

export const profileValidation = [
  body("address").optional().trim().escape(),
  body("phone").optional().trim().escape(),
];
