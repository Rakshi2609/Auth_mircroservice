# Development & Testing Scripts

This document contains useful commands and scripts for development and testing.

## 🧪 Testing API Endpoints

### Using curl (Command Line)

#### 1. Health Check
```bash
curl http://localhost:5000/health
```

#### 2. Platform Login - Send OTP
```bash
curl -X POST http://localhost:5000/api/v1/auth/platform/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

#### 3. Platform Login - Verify OTP
```bash
curl -X POST http://localhost:5000/api/v1/auth/platform/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","otp":"123456"}'
```

#### 4. Register Domain (requires JWT token)
```bash
curl -X POST http://localhost:5000/api/v1/domains/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"domainName":"example.com"}'
```

#### 5. Send User OTP (requires Domain API Key)
```bash
curl -X POST http://localhost:5000/api/v1/users/send-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DOMAIN_API_KEY" \
  -d '{"email":"user@example.com"}'
```

#### 6. Verify User OTP
```bash
curl -X POST http://localhost:5000/api/v1/users/verify-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DOMAIN_API_KEY" \
  -d '{"email":"user@example.com","otp":"123456"}'
```

#### 7. Get Users List
```bash
curl -X GET "http://localhost:5000/api/v1/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_DOMAIN_API_KEY"
```

#### 8. Get Analytics Overview
```bash
curl -X GET http://localhost:5000/api/v1/analytics/overview/DOMAIN_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔧 Development Scripts

### Database Scripts

#### Connect to MongoDB
```bash
# Local MongoDB
mongo

# MongoDB Atlas
mongo "mongodb+srv://cluster0.xxxxx.mongodb.net/universal-auth" --username youruser
```

#### Clear All Data (Development Only!)
```javascript
// In MongoDB shell
use universal-auth
db.users.deleteMany({})
db.domains.deleteMany({})
db.otps.deleteMany({})
db.loginevents.deleteMany({})
```

#### Create Test Data
```javascript
// In MongoDB shell
use universal-auth

// Insert test domain
db.domains.insertOne({
  owner: { email: "test@example.com", verified: true },
  domainName: "test.com",
  apiKey: "test_api_key_12345",
  active: true,
  statistics: { totalUsers: 0, totalLogins: 0 },
  createdAt: new Date(),
  updatedAt: new Date()
})

// Insert test user
db.users.insertOne({
  email: "user@test.com",
  verified: true,
  domain: ObjectId("YOUR_DOMAIN_ID"),
  loginCount: 5,
  lastLogin: new Date(),
  activeSessions: [],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## 📊 Monitoring Scripts

### Check Server Status
```bash
# Check if server is running
curl http://localhost:5000/health

# Check specific endpoint
curl -I http://localhost:5000/api/v1/auth/me
```

### View Logs
```bash
# Real-time logs (if using PM2)
pm2 logs

# Heroku logs
heroku logs --tail

# Docker logs
docker logs -f container_name
```

### Database Health
```bash
# Check MongoDB connection
mongosh --eval "db.adminCommand('ping')"

# Check collection counts
mongosh universal-auth --eval "
  print('Users:', db.users.countDocuments({}));
  print('Domains:', db.domains.countDocuments({}));
  print('OTPs:', db.otps.countDocuments({}));
  print('Events:', db.loginevents.countDocuments({}));
"
```

---

## 🧹 Cleanup Scripts

### Clear Expired OTPs (Manual)
```javascript
// MongoDB shell
use universal-auth
db.otps.deleteMany({ expiresAt: { $lt: new Date() } })
```

### Clear Old Login Events (Keep last 30 days)
```javascript
// MongoDB shell
use universal-auth
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
db.loginevents.deleteMany({ timestamp: { $lt: thirtyDaysAgo } })
```

### Reset User Sessions
```javascript
// MongoDB shell
use universal-auth
db.users.updateMany({}, { $set: { activeSessions: [] } })
```

---

## 🐛 Debugging Helpers

### Enable Debug Mode
```bash
# In .env file
NODE_ENV=development
DEBUG=express:*

# Run with debug
DEBUG=* npm run dev
```

### Test Email Delivery
```javascript
// Create test-email.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: 'test@example.com',
  subject: 'Test Email',
  text: 'If you receive this, email is working!'
}).then(() => console.log('✅ Email sent'))
  .catch(err => console.error('❌ Error:', err));
```

```bash
# Run test
node test-email.js
```

### Test Database Connection
```javascript
// Create test-db.js
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err);
    process.exit(1);
  });
```

```bash
# Run test
node test-db.js
```

---

## 📝 Quick Reference

### Environment Variables Template
```env
# Copy and fill in your values
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/universal-auth
JWT_SECRET=your-random-secret-key
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLIENT_URL=http://localhost:3000
OTP_EXPIRES_IN=10
OTP_LENGTH=6
```

### Common MongoDB Queries
```javascript
// Find all users for a domain
db.users.find({ domain: ObjectId("DOMAIN_ID") })

// Get user by email
db.users.findOne({ email: "user@example.com" })

// Count total users per domain
db.users.aggregate([
  { $group: { _id: "$domain", count: { $sum: 1 } } }
])

// Recent login events
db.loginevents.find().sort({ timestamp: -1 }).limit(10)

// Active OTPs
db.otps.find({ expiresAt: { $gt: new Date() }, verified: false })
```

### Git Workflow
```bash
# Create new feature
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Deploy to production
git checkout main
git merge feature/new-feature
git push origin main
git push heroku main  # If using Heroku
```

---

## 🚀 Performance Testing

### Load Testing with Artillery
```bash
# Install
npm install -g artillery

# Create test file: load-test.yml
# config:
#   target: 'http://localhost:5000'
#   phases:
#     - duration: 60
#       arrivalRate: 10
# scenarios:
#   - flow:
#     - get:
#         url: '/health'

# Run test
artillery run load-test.yml
```

### Benchmark API Response Time
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:5000/health

# n = number of requests
# c = concurrent requests
```

---

## 📦 Backup & Restore

### Backup MongoDB
```bash
# Local backup
mongodump --db universal-auth --out ./backup

# Restore backup
mongorestore --db universal-auth ./backup/universal-auth
```

### Export Data
```bash
# Export users to JSON
mongoexport --db universal-auth --collection users --out users.json

# Import users
mongoimport --db universal-auth --collection users --file users.json
```

---

## 🔐 Security Checks

### Audit Dependencies
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix
npm audit fix --force
```

### Check Environment Variables
```bash
# Verify all required vars are set
node -e "
const required = ['MONGODB_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
const missing = required.filter(v => !process.env[v]);
if (missing.length) {
  console.error('Missing vars:', missing);
  process.exit(1);
} else {
  console.log('✅ All variables set');
}
"
```

---

## 🎯 Quick Fixes

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Clear Node Modules
```bash
# If having dependency issues
rm -rf node_modules package-lock.json
npm install
```

### Reset Git to Last Commit
```bash
git reset --hard HEAD
git clean -fd
```

---

## 📞 Support Commands

### System Info
```bash
# Node version
node --version

# NPM version
npm --version

# MongoDB version
mongod --version

# Git version
git --version

# List global packages
npm list -g --depth=0
```

### Project Info
```bash
# List dependencies
npm list --depth=0

# Check outdated packages
npm outdated

# Find package info
npm info package-name
```

---

These scripts and commands should help you develop, test, debug, and maintain the Universal Auth system efficiently! 🚀
