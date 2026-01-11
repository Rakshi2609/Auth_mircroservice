# Universal Auth - Centralized Email Verification & Authentication System

🔐 **Complete authentication system with both passwordless (OTP) and password-based authentication**

## 🚀 Features

### Authentication Methods
- **Passwordless Authentication** - Email-based OTP system (no passwords to remember!)
- **Password Authentication** - Traditional email + password login
- **Dual Authentication** - Users can choose their preferred method
- **Email Verification** - OTP verification for all registrations

### Platform Features
- **Multi-Domain Support** - Manage authentication for unlimited domains
- **Secure API Keys** - Each domain gets unique API credentials
- **User Management Dashboard** - Complete user data and analytics
- **Real-time Analytics** - Track logins, user growth, and activity
- **REST API** - Easy integration with any tech stack
- **Session Management** - JWT-based secure sessions
- **Login Event Tracking** - Monitor all authentication attempts

## 📋 Prerequisites

- Node.js 16+ 
- MongoDB 4.4+
- npm or yarn
- Email account for SMTP (Gmail, SendGrid, etc.)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd microservice
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Install frontend dependencies

```bash
cd client
npm install
cd ..
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/universal-auth

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
CLIENT_URL=http://localhost:3000

# OTP Configuration
OTP_EXPIRES_IN=10
OTP_LENGTH=6
```

### 5. Setup Email (Gmail Example)

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an "App Password" for email
4. Use this app password in `EMAIL_PASS`

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

Or run both concurrently:
```bash
npm run dev:all
```

### Production Mode

```bash
npm start
```

### Access the application:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/health

## 📚 API Documentation

Complete API documentation is available at: http://localhost:3000/docs  
Detailed password auth guide: See `PASSWORD_AUTH.md`

### Authentication Methods

#### Method 1: Passwordless (OTP)
```javascript
// Step 1: Send OTP
const response = await fetch('http://localhost:5000/api/v1/users/send-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_DOMAIN_API_KEY'
  },
  body: JSON.stringify({ email: 'user@example.com' })
});

// Step 2: Verify OTP
const loginResponse = await fetch('http://localhost:5000/api/v1/users/verify-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_DOMAIN_API_KEY'
  },
  body: JSON.stringify({ 
    email: 'user@example.com',
    otp: '123456'
  })
});
```

#### Method 2: Password-Based
```javascript
// Step 1: Register with password (requires OTP for email verification)
const registerResponse = await fetch('http://localhost:5000/api/v1/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_DOMAIN_API_KEY'
  },
  body: JSON.stringify({ 
    email: 'user@example.com',
    password: 'securePassword123',
    otp: '123456'  // OTP sent to email for verification
  })
});

// Step 2: Login with password
const loginResponse = await fetch('http://localhost:5000/api/v1/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_DOMAIN_API_KEY'
  },
  body: JSON.stringify({ 
    email: 'user@example.com',
    password: 'securePassword123'
  })
});
```

## 🏗️ Project Structure

```
microservice/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   └── App.jsx        # Main app component
│   └── package.json
├── models/                # MongoDB models
│   ├── User.js
│   ├── Domain.js
│   ├── OTP.js
│   └── LoginEvent.js
├── routes/                # Express routes
│   ├── auth.js
│   ├── domains.js
│   ├── users.js
│   └── analytics.js
├── middleware/            # Custom middleware
│   └── auth.js
├── utils/                 # Utility functions
│   ├── email.js
│   └── generators.js
├── server.js              # Express server
└── package.json
```

## 🎯 Usage Flow

1. **Sign in** - Visit the app and login with your email
2. **Register Domain** - Add your website domain (e.g., example.com)
3. **Get API Key** - Copy your domain's unique API key
4. **Integrate** - Use the API endpoints in your application
5. **Monitor** - Track users and analytics in your dashboard

## 🔒 Security Features

- JWT-based authentication
- API key validation per domain
- **bcrypt password hashing** (10 salt rounds)
- **Email verification** for all registrations
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- CORS protection
- OTP expiration (10 minutes)
- Secure session management
- **Login event tracking** (success/failure monitoring)
- Failed login attempt logging

## 🌟 Key Endpoints

### Platform Authentication
- `POST /api/v1/auth/platform/send-otp` - Platform owner login
- `POST /api/v1/auth/platform/verify-otp` - Verify platform OTP
- `GET /api/v1/auth/me` - Get current user info

### Domain Management
- `POST /api/v1/domains/register` - Register new domain
- `GET /api/v1/domains/my-domains` - Get all your domains
- `GET /api/v1/domains/:domainId` - Get domain details
- `PATCH /api/v1/domains/:domainId` - Update domain settings
- `DELETE /api/v1/domains/:domainId` - Delete domain

### User Authentication (Domain API)
- `POST /api/v1/users/send-otp` - Send OTP to user
- `POST /api/v1/users/verify-otp` - Verify OTP and authenticate (passwordless)
- `POST /api/v1/users/register` - **NEW!** Register user with password (requires OTP)
- `POST /api/v1/users/login` - **NEW!** Login with email + password
- `GET /api/v1/users` - Get all users for domain
- `GET /api/v1/users/:userId` - Get specific user details
- `POST /api/v1/users/verify-otp` - Verify user OTP
- `GET /api/v1/users` - Get all users for domain

### Analytics
- `GET /api/v1/analytics/overview/:domainId` - Dashboard overview
- `GET /api/v1/analytics/chart/:domainId` - Login chart data
- `GET /api/v1/analytics/growth/:domainId` - User growth data

## 🎨 Frontend Pages

- **Landing Page** - Marketing and feature showcase
- **Login** - Passwordless OTP authentication
- **Dashboard** - Domain management overview
- **Users** - User list and management
- **Analytics** - Charts and metrics
- **API Docs** - Complete integration guide

## 🔧 Configuration Options

### Domain Settings (Customizable per domain)
- OTP length (default: 6 digits)
- OTP expiry (default: 10 minutes)
- Max login attempts (default: 5)
- Allowed origins (CORS)

## 📊 Database Models

### User
- Email, verification status
- Login count, last login
- Active sessions
- Metadata

### Domain
- Owner email, domain name
- API key (unique)
- Settings (OTP config)
- Statistics (users, logins)

### OTP
- Email, code
- Purpose, expiration
- Verification status

### LoginEvent
- User, domain references
- Timestamp, success status
- IP address, device info

## 🐛 Troubleshooting

**MongoDB Connection Error:**
```bash
# Make sure MongoDB is running
mongod
```

**Email Not Sending:**
- Check SMTP credentials
- For Gmail, use App Password (not regular password)
- Verify EMAIL_HOST and EMAIL_PORT

**Port Already in Use:**
```bash
# Change PORT in .env file
PORT=5001
```

## 📈 Scaling Considerations

- Use Redis for session storage
- Implement queue system for emails (Bull, BullMQ)
- Add CDN for frontend assets
- Database indexing for large user bases
- Load balancer for multiple instances

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Support

For questions or issues:
- Open an issue on GitHub
- Email: support@universalauth.com

## 🎉 What's Next?

- [ ] Two-factor authentication (2FA)
- [ ] Social login integration
- [ ] Webhook support for events
- [ ] Advanced analytics and reports
- [ ] Mobile SDKs (React Native, Flutter)
- [ ] Enterprise SSO integration

---

Built with ❤️ using Node.js, Express, React, MongoDB, and Tailwind CSS
