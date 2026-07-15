import OTP from "../models/OTP.js";
import User from "../models/User.js";
import otpGenerator from "otp-generator";
import sendEmail from "../utils/sendEmail.js";

// Send OTP
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Always normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check user exists
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "This email is already verified. Please log in.",
      });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    // Remove old OTPs for this email (use normalized)
    await OTP.deleteMany({ email: normalizedEmail });

    // Save new OTP with normalized email
    await OTP.create({ email: normalizedEmail, otp });

    // Send Email
    try {
      await sendEmail(
        normalizedEmail,
        "Email Verification OTP - HIVORA HRMS",
        `Hello ${user.name},

Your verification OTP for HIVORA HRMS is:

${otp}

This OTP is valid for 10 minutes.

If you did not request this, please ignore this email.

Thank you,
HIVORA HRMS Team`
      );
      console.log("✅ OTP email sent to:", normalizedEmail);
    } catch (emailError) {
      console.error("❌ Failed to send OTP email to:", normalizedEmail, emailError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please check your email address and try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please check your email.",
    });

  } catch (error) {
    console.error("SendOTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Always normalize email
    const normalizedEmail = email.trim().toLowerCase();

    const otpData = await OTP.findOne({ email: normalizedEmail });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired or was not found. Please request a new OTP.",
      });
    }

    if (otpData.otp !== otp.trim()) {
      console.log("OTP mismatch for", normalizedEmail, "| DB:", otpData.otp, "| Input:", otp.trim());
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // Mark user as verified
    await User.findOneAndUpdate(
      { email: normalizedEmail },
      { $set: { isVerified: true } }
    );

    // Delete used OTP
    await OTP.deleteMany({ email: normalizedEmail });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });

  } catch (error) {
    console.error("VerifyOTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};