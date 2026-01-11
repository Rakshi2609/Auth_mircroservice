const express = require('express');
const router = express.Router();
const validator = require('validator');
const Domain = require('../models/Domain');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateAPIKey, generateOTP } = require('../utils/generators');
const { sendOTPEmail } = require('../utils/email');
const { verifyToken, verifyDomainAPI } = require('../middleware/auth');

// Register a new domain
router.post('/register', verifyToken, async (req, res) => {
  try {
    const { domainName, allowedOrigins } = req.body;

    if (!domainName) {
      return res.status(400).json({
        success: false,
        message: 'Domain name is required'
      });
    }

    // Validate domain format
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
    if (!domainRegex.test(domainName)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid domain format'
      });
    }

    // Check if domain already exists
    const existingDomain = await Domain.findOne({ domainName: domainName.toLowerCase() });
    if (existingDomain) {
      return res.status(400).json({
        success: false,
        message: 'Domain already registered'
      });
    }

    const apiKey = generateAPIKey();

    const domain = await Domain.create({
      owner: {
        email: req.user.email,
        verified: true
      },
      domainName: domainName.toLowerCase(),
      apiKey,
      allowedOrigins: allowedOrigins || [],
      active: true
    });

    res.status(201).json({
      success: true,
      message: 'Domain registered successfully',
      domain: {
        id: domain._id,
        domainName: domain.domainName,
        apiKey: domain.apiKey,
        createdAt: domain.createdAt
      }
    });
  } catch (error) {
    console.error('Domain registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register domain'
    });
  }
});

// Get all domains for current user
router.get('/my-domains', verifyToken, async (req, res) => {
  try {
    const domains = await Domain.find({ 'owner.email': req.user.email })
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: domains.length,
      domains
    });
  } catch (error) {
    console.error('Get domains error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch domains'
    });
  }
});

// Get domain details
router.get('/:domainId', verifyToken, async (req, res) => {
  try {
    const domain = await Domain.findOne({
      _id: req.params.domainId,
      'owner.email': req.user.email
    });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    res.json({
      success: true,
      domain
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch domain'
    });
  }
});

// Update domain settings
router.patch('/:domainId', verifyToken, async (req, res) => {
  try {
    const { allowedOrigins, settings } = req.body;

    const domain = await Domain.findOne({
      _id: req.params.domainId,
      'owner.email': req.user.email
    });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    if (allowedOrigins) domain.allowedOrigins = allowedOrigins;
    if (settings) domain.settings = { ...domain.settings, ...settings };

    await domain.save();

    res.json({
      success: true,
      message: 'Domain updated successfully',
      domain
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update domain'
    });
  }
});

// Delete domain
router.delete('/:domainId', verifyToken, async (req, res) => {
  try {
    const domain = await Domain.findOneAndDelete({
      _id: req.params.domainId,
      'owner.email': req.user.email
    });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    // Delete all users associated with this domain
    await User.deleteMany({ domain: domain._id });

    res.json({
      success: true,
      message: 'Domain deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete domain'
    });
  }
});

module.exports = router;
