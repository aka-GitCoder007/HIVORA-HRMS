import OTP from "../models/OTP.js";
import User from "../models/User.js";
import otpGenerator from "otp-generator";
import sendEmail from "../utils/sendEmail.js";

// Send OTP
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check user exists
    const user = await User.findOne({ email });

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

    const otpData = await OTP.findOne({ email });

    if (!otpData) {
      return res.status(404).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await User.findOneAndUpdate(
      { email },
      {
        isVerified: true,
      }
    );

    await OTP.deleteMany({ email });

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