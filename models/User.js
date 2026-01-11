const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    default: null // null = passwordless (OTP only), hashed password = password-enabled
  },
  authMethod: {
    type: String,
    enum: ['otp', 'password', 'both'],
    default: 'otp'
  },
  verified: {
    type: Boolean,
    default: false
  },
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    required: true
  },
  loginCount: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: null
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  },
  activeSessions: [{
    token: String,
    createdAt: Date,
    expiresAt: Date,
    deviceInfo: String
  }]
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1, domain: 1 });
userSchema.index({ domain: 1, createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
