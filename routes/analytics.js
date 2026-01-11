const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LoginEvent = require('../models/LoginEvent');
const Domain = require('../models/Domain');
const { verifyToken } = require('../middleware/auth');

// Get dashboard overview
router.get('/overview/:domainId', verifyToken, async (req, res) => {
  try {
    const { domainId } = req.params;

    const domain = await Domain.findOne({
      _id: domainId,
      'owner.email': req.user.email
    });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    // Get statistics
    const totalUsers = await User.countDocuments({ domain: domainId });
    const verifiedUsers = await User.countDocuments({ domain: domainId, verified: true });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const loginsToday = await LoginEvent.countDocuments({
      domain: domainId,
      timestamp: { $gte: today }
    });

    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const loginsThisWeek = await LoginEvent.countDocuments({
      domain: domainId,
      timestamp: { $gte: lastWeek }
    });

    // Get recent logins
    const recentLogins = await LoginEvent.find({ domain: domainId })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('user', 'email');

    // Get active users (logged in last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      domain: domainId,
      lastLogin: { $gte: last24Hours }
    });

    res.json({
      success: true,
      overview: {
        totalUsers,
        verifiedUsers,
        activeUsers,
        loginsToday,
        loginsThisWeek,
        totalLogins: domain.statistics.totalLogins
      },
      recentLogins
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// Get login chart data (daily/weekly/monthly)
router.get('/chart/:domainId', verifyToken, async (req, res) => {
  try {
    const { domainId } = req.params;
    const { period = 'daily', days = 7 } = req.query;

    const domain = await Domain.findOne({
      _id: domainId,
      'owner.email': req.user.email
    });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const loginData = await LoginEvent.aggregate([
      {
        $match: {
          domain: domain._id,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing dates with 0 counts
    const chartData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const found = loginData.find(item => item._id === dateStr);
      chartData.push({
        date: dateStr,
        count: found ? found.count : 0
      });
    }

    res.json({
      success: true,
      chartData
    });
  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart data'
    });
  }
});

// Get user growth data
router.get('/growth/:domainId', verifyToken, async (req, res) => {
  try {
    const { domainId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const growthData = await User.aggregate([
      {
        $match: {
          domain: domainId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      growthData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch growth data'
    });
  }
});

module.exports = router;
