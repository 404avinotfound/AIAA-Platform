const nodemailer = require("nodemailer");

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_USER) {
    console.log(`[email skipped - SMTP not configured] To: ${to} | Subject: ${subject}`);
    return;
  }
  const transport = getTransport();
  await transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtpEmail(to, otp) {
  await sendEmail({
    to,
    subject: "Your AIAA verification code",
    html: `<p>Your AIAA login code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
  });
}

async function sendMembershipConfirmationEmail(to, { membershipNumber, fullName }) {
  await sendEmail({
    to,
    subject: "Welcome to AIAA - Membership Confirmed",
    html: `
      <p>Dear ${fullName},</p>
      <p>Your AIAA membership is now active. Your membership number is <b>${membershipNumber}</b>.</p>
      <p>You can download your digital membership card and certificate from your member dashboard.</p>
      <p>— All India Advocates Associations</p>
    `,
  });
}

module.exports = { sendEmail, generateOtp, sendOtpEmail, sendMembershipConfirmationEmail };
