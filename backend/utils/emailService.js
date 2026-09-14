const nodemailer = require('nodemailer');
const db = require('../db');

// Create transporter dynamically based on env or fallback
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const port = process.env.SMTP_PORT || 587;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host: host.trim(),
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user: user.trim(),
        pass: pass.trim()
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.trim(),
        pass: pass.trim().replace(/\s+/g, '')
      }
    });
  }

  return null;
};

// Send OTP function
const sendSignupOtp = async (email) => {
  // Ensure table exists
  await db.query(`
    CREATE TABLE IF NOT EXISTS email_otps (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      otp VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL
    )
  `);

  // Generate secure 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  // Delete previous OTPs for this email
  await db.query('DELETE FROM email_otps WHERE email = ?', [email]);

  // Save new OTP
  await db.query(
    'INSERT INTO email_otps (email, otp, expires_at) VALUES (?, ?, ?)',
    [email, otp, expiresAt]
  );

  const transporter = createTransporter();

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #e11d48, #be123c); padding: 30px 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 2px;">A2P COSMETICS</h1>
        <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Beauty Is A Ritual</p>
      </div>
      <div style="padding: 30px 25px; text-align: center; color: #334155;">
        <h2 style="margin-top: 0; color: #0f172a; font-size: 20px; font-weight: 700;">Verify Your Email Address</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 24px;">
          Thank you for joining A2P Cosmetics! Please use the following One-Time Password (OTP) to complete your account registration:
        </p>
        <div style="display: inline-block; background: #fff1f2; border: 2px dashed #f43f5e; border-radius: 12px; padding: 14px 28px; margin-bottom: 20px;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #e11d48;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          ⏱️ This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
        </p>
      </div>
      <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
        © ${new Date().getFullYear()} A2P Cosmetics. All rights reserved.
      </div>
    </div>
  `;

  if (transporter) {
    try {
      const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
      await transporter.sendMail({
        from: `"A2P Cosmetics" <${fromEmail}>`,
        to: email,
        subject: `${otp} is your A2P Cosmetics Verification Code`,
        html: htmlContent
      });
      console.log(`📧 [OTP SENT] Real email sent to ${email}`);
    } catch (err) {
      console.error(`❌ [OTP EMAIL FAILED] Error sending email:`, err.message);
    }
  } else {
    console.log(`\n=========================================`);
    console.log(`📩 [A2P EMAIL OTP] Verification code for ${email}: ${otp}`);
    console.log(`ℹ️ (To send real emails, set EMAIL_USER & EMAIL_PASS in backend/.env)`);
    console.log(`=========================================\n`);
  }

  return { success: true, otp: process.env.NODE_ENV === 'development' || !transporter ? otp : undefined };
};

// Verify OTP function
const verifySignupOtp = async (email, otp) => {
  const [rows] = await db.query(
    'SELECT * FROM email_otps WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
    [email, otp.toString().trim()]
  );

  if (rows.length === 0) {
    return { valid: false, message: 'Invalid or expired OTP. Please request a new one.' };
  }

  // Delete used OTP
  await db.query('DELETE FROM email_otps WHERE email = ?', [email]);

  return { valid: true };
};

module.exports = {
  sendSignupOtp,
  verifySignupOtp
};
