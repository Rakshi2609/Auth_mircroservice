# 🔐 Password Authentication Update

## Overview
The Universal Auth system now supports **both passwordless (OTP) and password-based authentication**!

Users can now:
1. **Register with password** (email verified via OTP)
2. **Login with password** (traditional username/password)
3. **Login with OTP** (passwordless, as before)

---

## New User Model

```javascript
{
  email: String,
  password: String (hashed with bcrypt),  // NEW!
  authMethod: 'otp' | 'password' | 'both',  // NEW!
  verified: Boolean,
  domain: ObjectId,
  loginCount: Number,
  lastLogin: Date,
  metadata: Map,
  activeSessions: [SessionObject]
}
```

---

## New API Endpoints

### 1. Register User with Password

**POST** `/api/v1/users/register`

**Headers:**
```
X-API-Key: YOUR_DOMAIN_API_KEY
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "otp": "123456"
}
```

**Flow:**
1. User requests OTP via `/users/send-otp`
2. User receives OTP in email
3. User submits registration with email, password, and OTP
4. System verifies OTP and creates account with hashed password

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "email": "user@example.com",
    "verified": true,
    "authMethod": "both"
  }
}
```

---

### 2. Login with Password

**POST** `/api/v1/users/login`

**Headers:**
```
X-API-Key: YOUR_DOMAIN_API_KEY
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "deviceInfo": "Chrome on Windows (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "verified": true,
    "authMethod": "both",
    "loginCount": 5,
    "lastLogin": "2025-11-20T14:20:02Z"
  }
}
```

---

### 3. Login with OTP (Passwordless)

**Still works as before!**

**POST** `/api/v1/users/send-otp` → `/api/v1/users/verify-otp`

---

## Frontend Integration Examples

### JavaScript/React Registration

```javascript
// Step 1: Send OTP for email verification
const sendVerificationOTP = async (email) => {
  const response = await fetch('/api/v1/users/send-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'YOUR_DOMAIN_API_KEY'
    },
    body: JSON.stringify({ email })
  });
  return response.json();
};

// Step 2: Register with password + OTP
const registerUser = async (email, password, otp) => {
  const response = await fetch('/api/v1/users/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'YOUR_DOMAIN_API_KEY'
    },
    body: JSON.stringify({ email, password, otp })
  });
  return response.json();
};

// Usage
await sendVerificationOTP('user@example.com');
// User receives OTP via email
const result = await registerUser('user@example.com', 'myPassword123', '123456');
```

### JavaScript/React Login

```javascript
const loginWithPassword = async (email, password) => {
  const response = await fetch('/api/v1/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'YOUR_DOMAIN_API_KEY'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
};
```

---

## cURL Examples

### Register User

```bash
# Step 1: Send verification OTP
curl -X POST http://localhost:5000/api/v1/users/send-otp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_DOMAIN_API_KEY" \
  -d '{"email": "user@example.com"}'

# Step 2: Register with password
curl -X POST http://localhost:5000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_DOMAIN_API_KEY" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "otp": "123456"
  }'
```

### Login with Password

```bash
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_DOMAIN_API_KEY" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

---

## Security Features

### Password Hashing
- Uses **bcrypt** with salt rounds = 10
- Passwords never stored in plain text
- Secure comparison using `bcrypt.compare()`

### Email Verification
- All registrations require email verification via OTP
- Prevents fake/bot registrations
- Confirms email ownership

### Login Event Tracking
- All login attempts logged (success/failure)
- Track IP address, user agent, device info
- Failed login attempts recorded for security monitoring

---

## Frontend Pages

### `/register` - Registration Page
- 3-step process:
  1. Enter email → OTP sent
  2. Set password
  3. Verify OTP → Account created

### `/login` - Login Page
- Toggle between:
  - **Passwordless (OTP)**: Email → OTP → Login
  - **Password**: Email + Password → Login

---

## Authentication Methods Comparison

| Feature | Passwordless (OTP) | Password-Based |
|---------|-------------------|----------------|
| **Security** | High (time-limited tokens) | High (bcrypt hashing) |
| **User Experience** | No password to remember | Traditional login |
| **Setup Required** | Email only | Email + Password |
| **Email Verification** | Built-in (OTP itself) | Separate OTP step |
| **Best For** | Quick access, mobile apps | Enterprise apps, dashboards |

---

## Migration Guide

### Existing Users
- Users created before this update have `authMethod: 'otp'`
- They can continue using OTP login
- No breaking changes!

### New Users
- Can register with password (gets `authMethod: 'both'`)
- Can use either password or OTP to login

---

## Updated Dependencies

Already included in `package.json`:
```json
{
  "bcryptjs": "^2.4.3"  // For password hashing
}
```

---

## Testing

### Test Registration
```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Send OTP
curl -X POST http://localhost:5000/api/v1/users/send-otp \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check email for OTP, then register:
curl -X POST http://localhost:5000/api/v1/users/register \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "otp": "YOUR_OTP"
  }'

# Test login with password:
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

---

## Error Handling

### Common Errors

**400 Bad Request**
```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**409 Conflict**
```json
{
  "success": false,
  "message": "User already exists"
}
```

---

## What's Next?

- ✅ Password authentication
- ✅ Email verification for registration
- ✅ Login event tracking
- ✅ bcrypt password hashing
- ✅ Dual authentication methods
- 🔜 Password reset functionality
- 🔜 2FA (Two-Factor Authentication)
- 🔜 OAuth social login (Google, GitHub)

---

**Now users have the flexibility to choose their preferred authentication method!** 🎉
