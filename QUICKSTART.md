# Quick Start Guide

## Getting Started in 5 Minutes

### 1. Prerequisites Check

```bash
# Check Node.js version (need 16+)
node --version

# Check MongoDB
mongod --version
```

### 2. Install Dependencies

```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### 3. Setup Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings (use notepad or any editor)
notepad .env
```

**Minimum required settings:**
```env
MONGODB_URI=mongodb://localhost:27017/universal-auth
JWT_SECRET=change-this-to-random-string
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
```

### 4. Start MongoDB

```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

### 5. Run the Application

```bash
# Option 1: Run both backend and frontend together
npm run dev:all

# Option 2: Run separately
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
npm run client
```

### 6. Access the Application

Open your browser:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/health

### 7. First Login (Platform Owner)

**Method 1: Passwordless (OTP)**
1. Go to http://localhost:3000
2. Click "Get Started" or "Login"
3. Select "Passwordless (OTP)" tab
4. Enter your email
5. Check your email for OTP
6. Enter OTP to login

**Method 2: Password (First create account)**
1. Go to http://localhost:3000/register
2. Enter email → OTP sent
3. Set password
4. Verify with OTP → Account created
5. Login with email + password

### 8. Register Your Domain

After login:
1. Click "Add Domain"
2. Enter your domain name (e.g., myapp.com)
3. Copy the API key
4. Use this API key to integrate authentication

### 8. Register Your First Domain

1. Click "Register New Domain"
2. Enter your domain name (e.g., example.com)
3. Copy the API key
4. Use the API key in your application

## Gmail App Password Setup

1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Search for "App Passwords"
4. Generate password for "Mail"
5. Copy 16-character password
6. Use in `.env` as `EMAIL_PASS`

## Testing API

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test passwordless OTP flow
curl -X POST http://localhost:5000/api/v1/users/send-otp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"email":"test@example.com"}'

# Test password registration
curl -X POST http://localhost:5000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "email":"test@example.com",
    "password":"Test1234",
    "otp":"123456"
  }'

# Test password login
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "email":"test@example.com",
    "password":"Test1234"
  }'
```

## Common Issues

**MongoDB not found:**
```bash
# Install MongoDB Community Edition
# Windows: https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb
```

**Port 5000 already in use:**
```env
# Change in .env
PORT=5001
```

**Email not sending:**
- Use Gmail App Password (not regular password)
- Enable "Less secure app access" if using older Gmail settings

## Next Steps

✅ Explore the dashboard
✅ Check API documentation at /docs
✅ Integrate with your application
✅ Monitor analytics

## Need Help?

- Check README.md for detailed documentation
- Visit http://localhost:3000/docs for API guide
- Open an issue on GitHub

---

🎉 You're all set! Start building with Universal Auth.
