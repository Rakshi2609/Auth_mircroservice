# Universal Auth System Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATIONS                      │
│                  (Your websites/apps)                        │
└─────────────────┬───────────────────────────────────────────┘
                  │ API Calls (send-otp, verify-otp)
                  │ with API Key
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              UNIVERSAL AUTH PLATFORM                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           React Frontend (Port 3000)                │   │
│  │  • Landing Page                                      │   │
│  │  • Login (OTP)                                       │   │
│  │  • Dashboard                                         │   │
│  │  • User Management                                   │   │
│  │  • Analytics                                         │   │
│  │  • API Documentation                                 │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │ REST API Calls                         │
│                     ▼                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Express Backend (Port 5000)                 │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │         API Routes                          │   │   │
│  │  │  • /api/v1/auth                            │   │   │
│  │  │  • /api/v1/domains                         │   │   │
│  │  │  • /api/v1/users                           │   │   │
│  │  │  • /api/v1/analytics                       │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │         Middleware                          │   │   │
│  │  │  • JWT Verification                        │   │   │
│  │  │  • API Key Validation                      │   │   │
│  │  │  • Rate Limiting                           │   │   │
│  │  │  • CORS                                    │   │   │
│  │  │  • Helmet Security                         │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └──────────────────┬──────────────────────────────────┘   │
└────────────────────┼────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌────────┐  ┌─────────┐  ┌──────────┐
   │MongoDB │  │  SMTP   │  │  Redis   │
   │Database│  │  Email  │  │  Cache   │
   └────────┘  └─────────┘  └──────────┘
                            (Optional)
```

## 📊 Data Flow

### User Authentication Flow

```
1. User enters email on client website
   ↓
2. Client app calls /send-otp with API key
   ↓
3. Backend validates API key & domain
   ↓
4. Generate 6-digit OTP
   ↓
5. Save OTP to database with expiry
   ↓
6. Send email via SMTP
   ↓
7. User receives OTP email
   ↓
8. User enters OTP
   ↓
9. Client app calls /verify-otp
   ↓
10. Backend validates OTP
   ↓
11. Create/update user record
   ↓
12. Generate JWT token
   ↓
13. Log login event
   ↓
14. Return token + user data
   ↓
15. Client stores token & authenticates user
```

### Dashboard Access Flow

```
1. Platform owner visits dashboard
   ↓
2. Enters email on login page
   ↓
3. Receives OTP via platform auth
   ↓
4. Verifies OTP
   ↓
5. Receives JWT token
   ↓
6. Token stored in localStorage
   ↓
7. All dashboard API calls include token
   ↓
8. Backend verifies token on each request
   ↓
9. Returns requested data
```

## 🗄️ Database Schema

### Collections

**1. Users**
```javascript
{
  _id: ObjectId,
  email: String (indexed),
  verified: Boolean,
  domain: ObjectId (ref: Domain),
  loginCount: Number,
  lastLogin: Date,
  metadata: Map,
  activeSessions: [{
    token: String,
    createdAt: Date,
    expiresAt: Date,
    deviceInfo: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**2. Domains**
```javascript
{
  _id: ObjectId,
  owner: {
    email: String,
    verified: Boolean
  },
  domainName: String (unique, indexed),
  apiKey: String (unique, indexed),
  active: Boolean,
  allowedOrigins: [String],
  settings: {
    otpLength: Number,
    otpExpiryMinutes: Number,
    maxLoginAttempts: Number
  },
  statistics: {
    totalUsers: Number,
    totalLogins: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

**3. OTPs**
```javascript
{
  _id: ObjectId,
  email: String (indexed),
  otp: String,
  domain: ObjectId (ref: Domain),
  purpose: String (enum: login, registration, domain_verification),
  expiresAt: Date (TTL index),
  verified: Boolean,
  attempts: Number,
  createdAt: Date
}
```

**4. LoginEvents**
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  domain: ObjectId (ref: Domain),
  email: String,
  timestamp: Date (indexed),
  success: Boolean,
  ipAddress: String,
  userAgent: String,
  deviceInfo: String,
  createdAt: Date
}
```

## 🔒 Security Architecture

### Authentication Layers

1. **Platform Authentication (Dashboard)**
   - JWT-based session management
   - Email OTP verification
   - Token expiry: 7 days

2. **Domain API Authentication**
   - API Key validation
   - Rate limiting per domain
   - CORS origin validation

3. **User Authentication**
   - Time-limited OTP (10 min)
   - Max attempt limiting
   - Session token management

### Security Measures

- Helmet.js HTTP headers
- CORS configuration
- Rate limiting (100 req/15min)
- Input validation
- JWT secret rotation capability
- API key encryption
- Secure session storage
- XSS protection
- CSRF protection (for forms)

## 🚀 API Architecture

### REST API Design

**Base URL:** `/api/v1`

**Versioning:** URL-based (v1, v2, etc.)

**Authentication Methods:**
1. Bearer Token (JWT) - Dashboard access
2. API Key - Domain access

**Response Format:**
```javascript
{
  success: Boolean,
  message: String,
  data: Object,
  error: Object (on failure)
}
```

### Endpoint Categories

1. **Auth Routes** (`/auth`)
   - Platform login/verification
   - Token management

2. **Domain Routes** (`/domains`)
   - Domain registration
   - Settings management
   - API key operations

3. **User Routes** (`/users`)
   - OTP operations
   - User listing
   - User details

4. **Analytics Routes** (`/analytics`)
   - Dashboard metrics
   - Charts data
   - Growth statistics

## 📱 Frontend Architecture

### Component Structure

```
src/
├── pages/
│   ├── LandingPage.jsx       # Marketing homepage
│   ├── Login.jsx              # OTP-based login
│   ├── Dashboard.jsx          # Domain overview
│   ├── UserManagement.jsx     # User list & search
│   ├── Analytics.jsx          # Charts & metrics
│   └── ApiDocs.jsx            # Documentation
├── context/
│   └── AuthContext.jsx        # Global auth state
├── App.jsx                    # Router & layout
└── main.jsx                   # Entry point
```

### State Management

- **React Context API** for authentication state
- **Local State** for component-specific data
- **localStorage** for token persistence

### Styling

- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Recharts** - Data visualization

## 🔄 Email System

### SMTP Configuration

```javascript
{
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
}
```

### Email Templates

- **OTP Email** - Verification code delivery
- **Welcome Email** - New user registration (future)
- **Domain Verification** - Domain confirmation (future)

## 📈 Scalability Considerations

### Current Architecture (MVP)

- Single Node.js instance
- MongoDB single replica
- Direct SMTP connection
- In-memory rate limiting

### Production Scaling

1. **Application Layer**
   - Multiple Node.js instances
   - Load balancer (nginx/AWS ALB)
   - PM2 cluster mode

2. **Database Layer**
   - MongoDB replica set
   - Read replicas for analytics
   - Sharding for large user bases

3. **Caching Layer**
   - Redis for sessions
   - Redis for rate limiting
   - Cache frequently accessed data

4. **Email System**
   - Queue system (Bull/RabbitMQ)
   - Email service (SendGrid/AWS SES)
   - Retry mechanism

5. **Monitoring**
   - Application logs (Winston)
   - Error tracking (Sentry)
   - Performance monitoring (New Relic)
   - Uptime monitoring

## 🔧 Environment Configuration

### Development
- Local MongoDB
- Gmail SMTP
- No caching
- Debug logging

### Production
- MongoDB Atlas/Cluster
- SendGrid/AWS SES
- Redis cache
- Error-only logging
- CDN for frontend
- Environment-based configs

## 📊 Performance Metrics

### Target Metrics

- **API Response Time:** < 100ms (p95)
- **OTP Delivery:** < 2 seconds
- **Dashboard Load:** < 1 second
- **Database Queries:** < 50ms
- **Uptime:** 99.9%

### Optimization Strategies

1. Database indexing on frequent queries
2. Connection pooling
3. Query result caching
4. Asset minification & compression
5. CDN for static assets
6. Lazy loading components

## 🧪 Testing Strategy

### Backend Testing
- Unit tests for utilities
- Integration tests for APIs
- Load testing for scalability
- Security testing

### Frontend Testing
- Component tests
- E2E tests (Cypress)
- Accessibility tests
- Cross-browser testing

## 🚀 Deployment Strategy

### Backend Deployment
```bash
# Build
npm install --production

# Start
NODE_ENV=production node server.js
```

### Frontend Deployment
```bash
# Build
npm run build

# Serve static files (nginx/Vercel/Netlify)
```

### Recommended Platforms

- **Backend:** AWS EC2, Heroku, DigitalOcean, Railway
- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront
- **Database:** MongoDB Atlas
- **Email:** SendGrid, AWS SES, Mailgun

## 🔐 Compliance & Privacy

- GDPR compliant data handling
- User data encryption at rest
- Secure password-less authentication
- Data retention policies
- User data export capability
- Right to deletion support

---

This architecture is designed to be:
✅ Scalable
✅ Secure
✅ Maintainable
✅ Cost-effective
✅ Developer-friendly
