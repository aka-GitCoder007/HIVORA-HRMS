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

    const normalizedEmail = email.trim().toLowerCase();

    // Check user exists
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });
    console.log("Generated OTP for", email, ":", otp);

    // Remove old OTP
    await OTP.deleteMany({ email });

    // Save new OTP
    await OTP.create({
      email,
      otp,
    });

    // Send Email
    await sendEmail(
      email,
      "Email Verification OTP",
      `Your verification OTP is ${otp}`
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {

    const { email, otp } = req.body;
    console.log("verifyOTP called with email:", email, "otp:", otp);

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const otpData = await OTP.findOne({ email: normalizedEmail });
    console.log("otpData found in DB:", otpData);

    if (!otpData) {
      return res.status(404).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (otpData.otp !== otp) {
      console.log("OTP mismatch! DB:", otpData.otp, "Input:", otp);
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: { isVerified: true }
      }
    );

    await OTP.deleteMany({ email: normalizedEmail });

    return res.status(200).json({
      success: true,
      message: "Email Verified Successfully",
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};