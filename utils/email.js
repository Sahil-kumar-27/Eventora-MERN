const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Booking Email
const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  try {
    const mailOptions = {
      from: `"Eventora" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Booking Confirmed: ${eventTitle}`,
      html: `
        <h2>Hi ${userName}!</h2>
        <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
        <p>Thank you for choosing Eventora.</p>
      `,
    };

    const response = await transporter.sendMail(mailOptions);

    console.log("✅ Booking email sent:", response.messageId);
  } catch (error) {
    console.error("❌ Error sending booking email:", error);
  }
};

// ✅ OTP Email
const sendOTPEmail = async (userEmail, otp, type) => {
  try {
    const title =
      type === "account_verification"
        ? "Verify your Eventora Account"
        : "Eventora Booking Verification";

    const msg =
      type === "account_verification"
        ? "Please use the following OTP to verify your new Eventora account."
        : "Please use the following OTP to verify and confirm your event booking.";

    const mailOptions = {
      from: `"Eventora" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2>${title}</h2>
          <p>${msg}</p>
          <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
            ${otp}
          </div>
          <p style="font-size: 12px;">
            This code expires in 5 minutes.
          </p>
        </div>
      `,
    };

    const response = await transporter.sendMail(mailOptions);

    console.log(`✅ OTP sent to ${userEmail}:`, response.messageId);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
  }
};

module.exports = { sendBookingEmail, sendOTPEmail };