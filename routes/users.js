const express = require('express');
const router = express.Router();
const validator = require('validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const LoginEvent = require('../models/LoginEvent');
const { generateOTP } = require('../utils/generators');
const { sendOTPEmail } = require('../utils/email');
const { verifyToken, verifyDomainAPI } = require('../middleware/auth');

// Domain API: Send OTP for user authentication
router.post('/send-otp', verifyDomainAPI, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }

    const otp = generateOTP(req.domain.settings.otpLength || 6);
    const expiresAt = new Date(Date.now() + (req.domain.settings.otpExpiryMinutes || 10) * 60 * 1000);

    // Delete old OTPs
    await OTP.deleteMany({ email, domain: req.domain._id });

    await OTP.create({
      email,
      otp,
      domain: req.domain._id,
      purpose: 'login',
      expiresAt
    });

    await sendOTPEmail(email, otp, 'login');

    res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: req.domain.settings.otpExpiryMinutes || 10
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// Domain API: Register user with password (email verification via OTP)
router.post('/register', verifyDomainAPI, async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required for email verification'
      });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      domain: req.domain._id,
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email, domain: req.domain._id });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Create user with password
    const user = await User.create({
      email,
      password,
      domain: req.domain._id,
      verified: true,
      authMethod: 'both', // Support both password and OTP
      loginCount: 0
    });

    // Update domain statistics
    req.domain.statistics.totalUsers += 1;
    await req.domain.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        email: user.email,
        verified: user.verified,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Domain API: Login with password
router.post('/login', verifyDomainAPI, async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email, domain: req.domain._id });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Log failed login
      await LoginEvent.create({
        user: user._id,
        domain: req.domain._id,
        email: user.email,
        timestamp: new Date(),
        success: false,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        deviceInfo
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update user login info
    user.loginCount += 1;
    user.lastLogin = new Date();

    // Generate session token
    const sessionToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        domain: req.domain.domainName 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Add session to user
    user.activeSessions.push({
      token: sessionToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceInfo: deviceInfo || req.headers['user-agent']
    });

    await user.save();

    // Update domain statistics
    req.domain.statistics.totalLogins += 1;
    await req.domain.save();

    // Log successful login
    await LoginEvent.create({
      user: user._id,
      domain: req.domain._id,
      email: user.email,
      timestamp: new Date(),
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      deviceInfo
    });

    res.json({
      success: true,
      message: 'Login successful',
      token: sessionToken,
      user: {
        email: user.email,
        verified: user.verified,
        authMethod: user.authMethod,
        loginCount: user.loginCount,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Domain API: Verify OTP and create/login user (Passwordless)
router.post('/verify-otp', verifyDomainAPI, async (req, res) => {
  try {
    const { email, otp, deviceInfo } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const otpRecord = await OTP.findOne({
      email,
      otp,
      domain: req.domain._id,
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check max attempts
    if (otpRecord.attempts >= (req.domain.settings.maxLoginAttempts || 5)) {
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please request a new OTP.'
      });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    // Find or create user
    let user = await User.findOne({ email, domain: req.domain._id });
    
    if (!user) {
      user = await User.create({
        email,
        domain: req.domain._id,
        verified: true,
        loginCount: 0
      });

      // Update domain statistics
      req.domain.statistics.totalUsers += 1;
    }

    // Update user login info
    user.loginCount += 1;
    user.lastLogin = new Date();

    // Generate session token
    const sessionToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        domain: req.domain.domainName 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Add session to user
    user.activeSessions.push({
      token: sessionToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceInfo: deviceInfo || req.headers['user-agent']
    });

    await user.save();

    // Update domain statistics
    req.domain.statistics.totalLogins += 1;
    await req.domain.save();

    // Log login event
    await LoginEvent.create({
      user: user._id,
      domain: req.domain._id,
      email: user.email,
      timestamp: new Date(),
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      deviceInfo
    });

    res.json({
      success: true,
      message: 'Authentication successful',
      token: sessionToken,
      user: {
        email: user.email,
        verified: user.verified,
        loginCount: user.loginCount,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
});

// Domain API: Get all users for a domain
router.get('/', verifyDomainAPI, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const query = { domain: req.domain._id };
    
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    const users = await User.find(query)
      .select('-activeSessions -__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Dashboard: Get all users for domain owner
router.get('/dashboard/list', verifyToken, async (req, res) => {
  try {
    const { domainId, page = 1, limit = 20, search } = req.query;

    if (!domainId) {
      return res.status(400).json({
        success: false,
        message: 'Domain ID is required'
      });
    }

    const query = { domain: domainId };
    
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    const users = await User.find(query)
      .select('-activeSessions -__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get specific user details
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('domain', 'domainName');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

module.exports = router;
