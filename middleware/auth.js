const jwt = require('jsonwebtoken');
const Domain = require('../models/Domain');

// Verify domain API key
const verifyDomainAPI = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required'
      });
    }

    const domain = await Domain.findOne({ apiKey, active: true });
    
    if (!domain) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    req.domain = domain;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Verify JWT token for dashboard access
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = {
  verifyDomainAPI,
  verifyToken
};
