import Otp from "../models/otpModel.js";
import sendEmail from "../utils/sendEmail.js";


// ✅ Send OTP to user email
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP with expiry
    const otp = new Otp({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    await otp.save();

    // Send OTP to email
    await sendEmail(
      email,
      "Your OTP Code (Valid for 5 minutes)",
      `Hi,\n\nYour OTP is: ${otpCode}\n\nIt will expire in 5 minutes.\n\nThanks,\nMyShop Team`
    );

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
      data: {
        email,
        note: "OTP is valid for 5 minutes",
        otpPreview: process.env.NODE_ENV === "development" ? otpCode : undefined,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

// ✅ Verify OTP
export const verifyOtp = async (req, res) => {

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  try {
    const record = await Otp.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (record.expiresAt < Date.now()) {
      await Otp.deleteMany({ email }); // remove expired OTPs
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // OTP is valid, remove it
    await Otp.deleteMany({ email });

    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to verify OTP", error: error.message });
  }
};
