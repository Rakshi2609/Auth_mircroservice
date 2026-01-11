const mongoose = require('mongoose');

const loginEventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  success: {
    type: Boolean,
    default: true
  },
  ipAddress: String,
  userAgent: String,
  deviceInfo: String
}, {
  timestamps: true
});

// Index for analytics queries
loginEventSchema.index({ domain: 1, timestamp: -1 });
loginEventSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('LoginEvent', loginEventSchema);
