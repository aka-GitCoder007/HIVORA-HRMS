import bcrypt from "bcrypt";
import crypto from "crypto";
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

    // Always normalize email to lowercase and trim
    email = email.trim().toLowerCase();

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and contain uppercase, lowercase and one number.",
      });
    }

    // Existing User Check
    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId: employeeId.trim() }],
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
      employeeId: employeeId.trim(),
      name: name.trim(),
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

    // Save OTP with normalized email
    await OTP.create({ email, otp });

    // Fire email asynchronously — respond immediately, email delivers in background
    sendEmail(
      email,
      "Verify Your Email - HIVORA HRMS",
      `Hello ${name.trim()},

Your OTP for verifying your HIVORA HRMS account is:

${otp}

This OTP is valid for 10 minutes.

If you did not sign up, please ignore this email.

Thank you,
HIVORA HRMS Team`
    )
      .then(() => console.log("✅ Signup OTP email sent to:", email))
      .catch((emailError) =>
        console.error("❌ Failed to send signup OTP email to:", email, emailError.message)
      );

    // Respond immediately — don't wait for email delivery
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
    let { email, password, portal } = req.body;

    // Required fields validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    // Always normalize email
    email = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (portal === "employee" && user.role !== "Employee") {
      return res.status(403).json({
        success: false,
        message: "Please login through Admin Portal.",
      });
    }

    if (portal === "admin" && user.role !== "HR") {
      return res.status(403).json({
        success: false,
        message: "Please login through Employee Portal.",
      });
    }

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
        profilePicture: user.profilePicture,
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

// =========================
// FORGOT PASSWORD
// =========================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Return success anyway to prevent user enumeration
      return res.status(200).json({
        success: true,
        message: "If this email is registered, a password reset link has been sent.",
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save hashed token and expiry in DB (1 hour expiry for production)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const getPrimaryFrontendUrl = () => {
      if (process.env.FRONTEND_URLS) {
        return process.env.FRONTEND_URLS.split(',')[0].trim().replace(/\/$/, "");
      }
      return (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
    };

    const frontendUrl = getPrimaryFrontendUrl();
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await sendEmail(
        user.email,
        "Password Reset Request - HIVORA HRMS",
        `Hello ${user.name},

You requested a password reset for your HIVORA HRMS account.

Click the link below to reset your password:

${resetUrl}

This link will expire in 1 hour.

If you did not request this, please ignore this email. Your password will remain unchanged.

Thank you,
HIVORA HRMS Team`
      );
      console.log("✅ Password reset email sent to:", user.email);
    } catch (emailError) {
      console.error("❌ Failed to send password reset email:", emailError.message);
      // Clear the token since email failed
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "If this email is registered, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// =========================
// RESET PASSWORD
// =========================
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset link. Please request a new one." });
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and contain uppercase, lowercase and one number.",
      });
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};