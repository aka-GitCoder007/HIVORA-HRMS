import nodemailer from "nodemailer";

const sendEmail = async (email, subject, text) => {
  // Validate env vars early and log clearly on Render
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ EMAIL_USER or EMAIL_PASS is not set in environment variables.");
    throw new Error("Email service not configured. Please set EMAIL_USER and EMAIL_PASS.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Verify connection before sending
  try {
    await transporter.verify();
  } catch (verifyError) {
    console.error("❌ Email transporter verification failed:", verifyError.message);
    throw new Error("Email service authentication failed. Check EMAIL_USER and EMAIL_PASS.");
  }

  const mailOptions = {
    from: `"HIVORA HRMS" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("✅ Email sent to:", email, "| MessageId:", info.messageId);
  return info;
};

export default sendEmail;