const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (email, otp, purpose = 'login') => {
  const subject = purpose === 'domain_verification' 
    ? 'Verify Your Domain' 
    : 'Your Login Code';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .otp-box { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
        .otp { font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
        .expires { color: #666; font-size: 14px; margin-top: 15px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; color: #856404; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Universal Auth</h1>
        </div>
        <div class="content">
          <h2 style="color: #333; margin-top: 0;">Your Verification Code</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We received a request to ${purpose === 'domain_verification' ? 'verify your domain' : 'sign in to your account'}. 
            Use the code below to continue:
          </p>
          
          <div class="otp-box">
            <div class="otp">${otp}</div>
            <div class="expires">⏱️ Expires in ${process.env.OTP_EXPIRES_IN || 10} minutes</div>
          </div>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong> Never share this code with anyone. 
            Our team will never ask for your verification code.
          </div>

          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
        <div class="footer">
          © 2025 Universal Auth System. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Universal Auth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendOTPEmail };
