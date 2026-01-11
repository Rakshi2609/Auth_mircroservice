# 📝 Todo App - Universal Auth Integration Example

A simple, beautiful todo application demonstrating how to integrate **Universal Auth** for user authentication.

## 🌟 Features

### Authentication
- ✅ **Password-based login** - Email + Password
- ✅ **Passwordless (OTP) login** - Email verification via OTP
- ✅ **User registration** - Create account with email verification
- ✅ **Persistent sessions** - Stay logged in across page refreshes
- ✅ **Secure logout** - Clear session data

### Todo Management
- ✅ Add, complete, and delete todos
- ✅ Filter by: All, Active, Completed
- ✅ Statistics dashboard (Total, Active, Completed counts)
- ✅ Clear all completed todos at once
- ✅ **User-specific todos** - Each user has their own todo list
- ✅ LocalStorage persistence - Todos saved per user

### Design
- ✅ Modern, clean UI with Tailwind CSS
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Toast notifications

---

## 🚀 Quick Start

### Prerequisites

1. **Universal Auth backend running** on `http://localhost:5000`
2. **Domain registered** in Universal Auth dashboard
3. **API Key** from your domain

### Installation

```bash
# Navigate to todo app directory
cd client2

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will run on **http://localhost:3001**

---

## ⚙️ Configuration

### 1. Get Your API Key

1. Start Universal Auth platform:
   ```bash
   # In root directory
   npm run dev:all
   ```

2. Visit http://localhost:3000
3. Login to dashboard
4. Register a new domain (e.g., "todoapp.local")
5. **Copy the API Key**

### 2. Update API Key in Code

Open `src/pages/Login.jsx` and update:

```javascript
// Line 5: Replace with your actual API key
const API_KEY = 'YOUR_DOMAIN_API_KEY_HERE'
```

Paste your copied API key here.

---

## 📖 How It Works

### Authentication Flow

#### **Registration**
1. User enters email + password
2. System sends OTP to email via Universal Auth
3. User enters OTP to verify email
4. Account created with password
5. User can now login

#### **Login (Password)**
1. User enters email + password
2. Universal Auth validates credentials
3. Returns JWT token
4. App stores token and user data
5. User redirected to todo list

#### **Login (OTP)**
1. User enters email
2. Universal Auth sends OTP
3. User enters OTP
4. Returns JWT token
5. App stores token and user data
6. User redirected to todo list

### Todo Data Storage

- Todos stored in **localStorage** per user email
- Key format: `todos_{user.email}`
- Survives page refreshes
- Isolated per user account

---

## 🎨 UI Components

### Login Page (`src/pages/Login.jsx`)
- Mode toggle: Login / Register
- Auth type toggle: Password / OTP
- Multi-step forms with validation
- Toast notifications for feedback
- API key warning banner

### Todo App (`src/pages/TodoApp.jsx`)
- Header with user info and logout
- Statistics cards (Total, Active, Completed)
- Add todo form
- Filter tabs (All, Active, Completed)
- Todo list with complete/delete actions
- Clear completed button

---

## 🔐 Security

- ✅ JWT tokens stored in localStorage
- ✅ Token sent with authenticated requests
- ✅ Logout clears all session data
- ✅ Password validation (min 6 characters)
- ✅ Email verification required for registration
- ✅ API key required for all auth requests

---

## 📁 Project Structure

```
client2/
├── public/
├── src/
│   ├── components/        # (Future: Reusable components)
│   ├── pages/
│   │   ├── Login.jsx      # Authentication page
│   │   └── TodoApp.jsx    # Main todo application
│   ├── App.jsx            # Root component with auth logic
│   ├── main.jsx           # Entry point
│   └── index.css          # Tailwind styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🎯 Integration Code Examples

### Making Authenticated Requests

```javascript
// Get current token
const token = localStorage.getItem('todoAppToken')

// Example: Fetch user data
const response = await axios.get('/api/v1/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### User Registration

```javascript
// Step 1: Send OTP
await axios.post('/api/v1/users/send-otp', 
  { email: 'user@example.com' },
  { headers: { 'X-API-Key': API_KEY } }
)

// Step 2: Register with OTP
await axios.post('/api/v1/users/register',
  { 
    email: 'user@example.com',
    password: 'password123',
    otp: '123456'
  },
  { headers: { 'X-API-Key': API_KEY } }
)
```

### Password Login

```javascript
const response = await axios.post('/api/v1/users/login',
  { 
    email: 'user@example.com',
    password: 'password123'
  },
  { headers: { 'X-API-Key': API_KEY } }
)

// Store token
localStorage.setItem('token', response.data.token)
```

---

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#8b5cf6',  // Change this
    600: '#7c3aed',
    // ... other shades
  }
}
```

### Add Backend API

You can extend this to save todos to a backend:

1. Create todo routes in backend
2. Store todos in MongoDB
3. Update `TodoApp.jsx` to use API calls instead of localStorage

---

## 🐛 Troubleshooting

### "API_KEY not configured" warning

Update the API key in `src/pages/Login.jsx` (line 5)

### "Network Error"

Ensure backend is running on http://localhost:5000:
```bash
npm run dev
```

### "Invalid API Key"

1. Check your domain is registered in Universal Auth
2. Copy the correct API key from dashboard
3. Paste it in `Login.jsx`

### Todos not saving

Check browser console for localStorage errors. Clear browser data if needed.

---

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "axios": "^1.6.2",
  "react-hot-toast": "^2.4.1",
  "lucide-react": "^0.294.0",
  "tailwindcss": "^3.3.6",
  "vite": "^5.0.8"
}
```

---

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

Output in `dist/` folder.

### Deploy

Deploy the `dist/` folder to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop `dist/` folder
- **GitHub Pages**: Push to gh-pages branch

### Environment Variables

Update API endpoint in production:
- Change proxy in `vite.config.js`
- Or use environment variables

---

## 🎓 Learning Points

This example demonstrates:

1. ✅ **How to integrate Universal Auth** in a React app
2. ✅ **Multiple authentication methods** (password + OTP)
3. ✅ **JWT token management**
4. ✅ **User registration with email verification**
5. ✅ **Session persistence** with localStorage
6. ✅ **User-specific data storage**
7. ✅ **Modern React patterns** (hooks, state management)
8. ✅ **API integration** with axios
9. ✅ **Form validation** and error handling
10. ✅ **Responsive UI** with Tailwind CSS

---

## 🔗 Links

- **Universal Auth Docs**: `../README.md`
- **Universal Auth Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **This App**: http://localhost:3001

---

## 📝 Next Steps

### Extend This App

- [ ] Add todo categories/tags
- [ ] Add due dates
- [ ] Add priority levels
- [ ] Add todo search
- [ ] Sync todos to backend database
- [ ] Add drag-and-drop reordering
- [ ] Add dark mode
- [ ] Add todo sharing between users

### Learn More

- See `PASSWORD_AUTH.md` for detailed auth documentation
- See `FEATURES_UPDATE.md` for latest features
- See `QUICKSTART.md` for setup guide

---

**Enjoy building with Universal Auth!** 🎉
