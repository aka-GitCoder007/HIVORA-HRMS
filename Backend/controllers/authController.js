import bcrypt from "bcrypt";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

import otpGenerator from "otp-generator";
import OTP from "../models/OTP.js";
import sendEmail from "../utils/sendEmail.js";

// =========================
// SIGNUP
// =========================
export const signup = async (req, res) => {
  try {
    let { employeeId, name, email, password, role } = req.body;

    // Required fields validation
    if (!employeeId || !name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Convert email to lowercase
    email = email.toLowerCase();

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and contain uppercase, lowercase and one number.",
      });
    }

    // Existing User Check
    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Employee ID or Email already exists",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      employeeId,
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
    });

    // Delete previous OTP if exists
    await OTP.deleteMany({ email });

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    // Save OTP
    await OTP.create({
      email,
      otp,
    });

    // Send Email
    await sendEmail(
      email,
      "Verify Your Email",
      `Hello ${name},

Your OTP for verifying your account is:

${otp}

This OTP is valid for a short time.

Thank you.`
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful. OTP sent to your email.",
    });

  } catch (error) {
    console.error("Signup Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// =========================
// LOGIN
// =========================
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Required fields validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    // Convert email to lowercase
    email = email.toLowerCase();

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // (Enable this later after implementing email verification)
    /*
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first.",
      });
    }
    */
if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }
    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = generateToken(user);

    // Success Response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("GetMe Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};