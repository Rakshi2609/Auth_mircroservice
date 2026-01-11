const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const validator = require('validator');
const OTP = require('../models/OTP');
const Domain = require('../models/Domain');
const { generateOTP, generateAPIKey } = require('../utils/generators');
const { sendOTPEmail } = require('../utils/email');
const { verifyToken } = require('../middleware/auth');

// Platform owner login - Send OTP
router.post('/platform/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }

    // Create a temporary domain reference for platform authentication
    let platformDomain = await Domain.findOne({ domainName: 'platform.internal' });
    if (!platformDomain) {
      platformDomain = await Domain.create({
        owner: { email: 'system@platform.internal', verified: true },
        domainName: 'platform.internal',
        apiKey: generateAPIKey(),
        active: true
      });
    }

    const otp = generateOTP(6);
    const expiresAt = new Date(Date.now() + (process.env.OTP_EXPIRES_IN || 10) * 60 * 1000);

    // Delete old OTPs for this email
    await OTP.deleteMany({ email, domain: platformDomain._id });

    await OTP.create({
      email,
      otp,
      domain: platformDomain._id,
      purpose: 'login',
      expiresAt
    });

    await sendOTPEmail(email, otp, 'login');

    res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: process.env.OTP_EXPIRES_IN || 10
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// Platform owner login - Verify OTP
router.post('/platform/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const platformDomain = await Domain.findOne({ domainName: 'platform.internal' });
    
    const otpRecord = await OTP.findOne({
      email,
      otp,
      domain: platformDomain._id,
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    // Generate JWT token
    const token = jwt.sign(
      { email, type: 'platform' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { email }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
});

// Get current user info
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user info'
    });
  }
});

module.exports = router;
