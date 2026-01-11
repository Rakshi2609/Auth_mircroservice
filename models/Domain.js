const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
  owner: {
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  domainName: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  apiKey: {
    type: String,
    required: true,
    unique: true
  },
  active: {
    type: Boolean,
    default: true
  },
  allowedOrigins: [{
    type: String
  }],
  settings: {
    otpLength: {
      type: Number,
      default: 6
    },
    otpExpiryMinutes: {
      type: Number,
      default: 10
    },
    maxLoginAttempts: {
      type: Number,
      default: 5
    }
  },
  statistics: {
    totalUsers: {
      type: Number,
      default: 0
    },
    totalLogins: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

domainSchema.index({ apiKey: 1 });
domainSchema.index({ 'owner.email': 1 });

module.exports = mongoose.model('Domain', domainSchema);
