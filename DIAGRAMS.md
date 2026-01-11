# Universal Auth - Visual System Diagrams

## 🎯 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR APPLICATIONS                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   App.xyz    │  │  Blog.com    │  │  Shop.io     │  ...    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                    │
│         └─────────────────┴─────────────────┘                   │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │ API Calls (with API Keys)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│               UNIVERSAL AUTH PLATFORM                            │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Dashboard (React App)                      │    │
│  │  • Login via OTP                                        │    │
│  │  • Manage Domains                                       │    │
│  │  • View Users                                           │    │
│  │  • Analytics & Reports                                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           Backend API (Node.js/Express)                │    │
│  │  ┌──────────────────────────────────────────────┐     │    │
│  │  │  Authentication Layer                         │     │    │
│  │  │  • JWT Tokens                                 │     │    │
│  │  │  • API Key Validation                         │     │    │
│  │  │  • Rate Limiting                              │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────┐     │    │
│  │  │  Core Services                                │     │    │
│  │  │  • OTP Generation                             │     │    │
│  │  │  • Email Delivery                             │     │    │
│  │  │  • User Management                            │     │    │
│  │  │  • Analytics Processing                       │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────────┘    │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐         ┌──────────┐        ┌─────────┐
   │ MongoDB │         │   SMTP   │        │  Redis  │
   │Database │         │  Server  │        │  Cache  │
   └─────────┘         └──────────┘        └─────────┘
```

---

## 🔄 User Authentication Flow Diagram

```
┌─────────────┐
│   Client    │
│ Application │
└──────┬──────┘
       │
       │ 1. User enters email
       │
       ▼
┌─────────────────────────────────────┐
│  POST /users/send-otp               │
│  {                                  │
│    email: "user@example.com"        │
│  }                                  │
│  Headers: Authorization: Bearer KEY │
└──────┬──────────────────────────────┘
       │
       │ 2. Validate API Key
       │
       ▼
┌─────────────────────────────────────┐
│  Universal Auth Backend              │
│  • Validates domain API key          │
│  • Generates 6-digit OTP             │
│  • Sets 10-minute expiry             │
│  • Saves to database                 │
└──────┬──────────────────────────────┘
       │
       │ 3. Send OTP via email
       │
       ▼
┌─────────────────────────────────────┐
│  Email Service (SMTP)                │
│  • Formats email template            │
│  • Sends to user's email             │
└──────┬──────────────────────────────┘
       │
       │ 4. User receives email
       │
       ▼
┌─────────────┐
│    User     │ ◄─── OTP: 123456
└──────┬──────┘
       │
       │ 5. User enters OTP
       │
       ▼
┌─────────────────────────────────────┐
│  POST /users/verify-otp             │
│  {                                  │
│    email: "user@example.com",       │
│    otp: "123456"                    │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 6. Verify OTP
       │
       ▼
┌─────────────────────────────────────┐
│  Universal Auth Backend              │
│  • Validates OTP                     │
│  • Creates/updates user              │
│  • Generates JWT token               │
│  • Logs login event                  │
└──────┬──────────────────────────────┘
       │
       │ 7. Return auth token
       │
       ▼
┌─────────────────────────────────────┐
│  Response                            │
│  {                                  │
│    success: true,                   │
│    token: "eyJhbGc...",             │
│    user: { ... }                    │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 8. Store token
       │
       ▼
┌─────────────┐
│   Client    │ ✅ Authenticated!
└─────────────┘
```

---

## 📊 Data Model Relationships

```
┌────────────────────────────────────┐
│           Domain                   │
│ ┌────────────────────────────────┐ │
│ │ _id: ObjectId                  │ │
│ │ domainName: "example.com"      │ │
│ │ apiKey: "uauth_xxxxx"          │ │
│ │ owner: {                       │ │
│ │   email: "owner@email.com"     │ │
│ │ }                              │ │
│ └────────────────────────────────┘ │
└────────┬───────────────────────────┘
         │
         │ Has Many ───────────────────┐
         │                             │
         ▼                             ▼
┌────────────────────┐        ┌────────────────────┐
│       User         │        │    LoginEvent      │
│ ┌────────────────┐ │        │ ┌────────────────┐ │
│ │ email          │ │        │ │ timestamp      │ │
│ │ verified       │ │        │ │ success        │ │
│ │ loginCount     │ │        │ │ ipAddress      │ │
│ │ lastLogin      │ │        │ │ userAgent      │ │
│ │ domain: ───────┼─┘        │ │ user: ─────────┼─┘
│ └────────────────┘          │ │ domain: ───────┼─┘
│                             │ └────────────────┘
└─────────────────────────────┘
         │
         │ Has Many
         │
         ▼
┌────────────────────┐
│        OTP         │
│ ┌────────────────┐ │
│ │ email          │ │
│ │ otp: "123456"  │ │
│ │ expiresAt      │ │
│ │ verified       │ │
│ │ domain: ───────┼─┘
│ └────────────────┘
└─────────────────────────────┘
```

---

## 🎨 Dashboard Navigation Map

```
┌───────────────────────────────────────────────────────────┐
│                     Landing Page                          │
│                  (Marketing Homepage)                     │
└───────────┬───────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────┐
│                    Login Page                             │
│              (OTP Email Verification)                     │
└───────────┬───────────────────────────────────────────────┘
            │
            │ After Authentication
            │
            ▼
┌───────────────────────────────────────────────────────────┐
│                   Dashboard Home                          │
│            ┌─────────────────────────────┐                │
│            │   My Domains List           │                │
│            │  • Domain 1 → API Key       │                │
│            │  • Domain 2 → API Key       │                │
│            │  [+ Register New Domain]    │                │
│            └─────────────────────────────┘                │
└───────┬───────────────────┬───────────────────────────────┘
        │                   │
        │                   │
   ┌────▼────┐         ┌────▼─────┐
   │  Users  │         │Analytics │
   │  Page   │         │   Page   │
   └─────────┘         └──────────┘
        │                   │
        │                   │
   ┌────▼────────────────────▼─────┐
   │   • User List                 │
   │   • Search                    │
   │   • Login History             │
   │   • Verification Status       │
   │                               │
   │   • Login Charts              │
   │   • User Growth               │
   │   • Active Users              │
   │   • Daily/Weekly Stats        │
   └───────────────────────────────┘
```

---

## 🔐 Security Flow Diagram

```
┌────────────────────────────────────────────────────────┐
│              Incoming API Request                      │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │  Rate Limiter  │  ◄── Max 100 req/15min
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │  CORS Check    │  ◄── Validate origin
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │  Helmet.js     │  ◄── Security headers
        └────────┬───────┘
                 │
                 ▼
     ┌───────────────────────────┐
     │   Authentication Type?     │
     └───────┬───────────┬───────┘
             │           │
    ┌────────▼──┐    ┌──▼────────┐
    │ JWT Token │    │  API Key  │
    └────┬──────┘    └──┬────────┘
         │              │
         │ Verify       │ Validate
         │ Token        │ Against DB
         │              │
         └──────┬───────┘
                │
                ▼
      ┌─────────────────┐
      │ Request Valid?  │
      └────┬────────┬───┘
           │ No     │ Yes
           │        │
      ┌────▼──┐  ┌──▼────────┐
      │ 401   │  │  Process  │
      │ Error │  │  Request  │
      └───────┘  └───────────┘
```

---

## 📧 Email OTP Flow

```
┌─────────────────────────────────────────────────────┐
│           OTP Generation Process                    │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
         ┌──────────────────┐
         │  Generate Random  │
         │   6-digit Code    │
         │   (000000-999999) │
         └─────────┬─────────┘
                   │
                   ▼
         ┌──────────────────┐
         │  Save to MongoDB  │
         │  • email          │
         │  • otp            │
         │  • expiresAt      │
         │  • domain ref     │
         └─────────┬─────────┘
                   │
                   ▼
         ┌──────────────────┐
         │  Format Email     │
         │  HTML Template    │
         │  • OTP in box     │
         │  • Expiry info    │
         │  • Security note  │
         └─────────┬─────────┘
                   │
                   ▼
         ┌──────────────────┐
         │  Send via SMTP    │
         │  (Gmail/SendGrid) │
         └─────────┬─────────┘
                   │
                   ▼
      ┌────────────────────────┐
      │  Delivery Confirmation  │
      └────────────────────────┘
                   │
          ┌────────┴────────┐
          │                 │
    ┌─────▼─────┐    ┌──────▼──────┐
    │ Success   │    │   Failed    │
    │ Return OK │    │ Return Error│
    └───────────┘    └─────────────┘
```

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Users/Clients                      │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ HTTPS
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│               CDN / CloudFlare                          │
│          (Static Assets, SSL, DDoS Protection)          │
└────────────────┬───────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌───────────────┐  ┌──────────────┐
│   Frontend    │  │   Backend    │
│  React App    │  │  Node.js API │
│               │  │              │
│ Vercel/Netlify│  │ Heroku/AWS   │
└───────────────┘  └──────┬───────┘
                          │
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌─────────────┐   ┌──────────────┐   ┌────────────┐
│  MongoDB    │   │    SMTP      │   │   Redis    │
│   Atlas     │   │   Service    │   │   Cache    │
│  Database   │   │  SendGrid/   │   │ (Optional) │
│             │   │   AWS SES    │   │            │
└─────────────┘   └──────────────┘   └────────────┘
```

---

## 📈 Analytics Data Collection

```
┌──────────────────────────────────────────┐
│        User Logs In                      │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│  Create LoginEvent Document               │
│  • user_id                                │
│  • domain_id                              │
│  • timestamp                              │
│  • ip_address                             │
│  • user_agent                             │
│  • success: true                          │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│  Update User Record                       │
│  • loginCount++                           │
│  • lastLogin = now()                      │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│  Update Domain Statistics                 │
│  • totalLogins++                          │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│  Data Available in Dashboard              │
│  • Login charts (by date)                 │
│  • User growth graphs                     │
│  • Active users count                     │
│  • Recent login events                    │
└──────────────────────────────────────────┘
```

---

## 🎯 Integration Workflow

```
Developer Integrates Universal Auth

Step 1: Register
    │
    ├─► Login to dashboard
    │
    └─► Register domain (e.g., myapp.com)
         │
         └─► Receive API Key

Step 2: Frontend Integration
    │
    ├─► Create login form
    │   (Email input field)
    │
    ├─► Add "Send OTP" button
    │   └─► Calls: POST /users/send-otp
    │
    └─► Add "Verify OTP" form
        └─► Calls: POST /users/verify-otp
             │
             └─► Receive JWT token
                  │
                  └─► Store in localStorage
                       │
                       └─► User authenticated! ✅

Step 3: Monitor
    │
    ├─► View users in dashboard
    │
    ├─► Check analytics
    │
    └─► Monitor login events
```

---

These diagrams should help visualize how the Universal Auth system works! 🎨
