import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Code, 
  Send, 
  CheckCircle, 
  Copy,
  Shield,
  Key,
  Mail,
  Lock,
  Globe,
  Book
} from 'lucide-react'

export default function ApiDocs() {
  const navigate = useNavigate()
  const [copiedCode, setCopiedCode] = useState(null)

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const CodeBlock = ({ code, language = 'javascript', id }) => (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copyCode(code, id)}
        className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors opacity-0 group-hover:opacity-100"
      >
        {copiedCode === id ? (
          <CheckCircle className="w-5 h-5 text-green-400" />
        ) : (
          <Copy className="w-5 h-5 text-gray-400" />
        )}
      </button>
    </div>
  )

  const Endpoint = ({ method, path, description, children }) => (
    <div className="card mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <span className={`px-3 py-1 rounded font-mono text-sm font-semibold ${
          method === 'POST' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {method}
        </span>
        <code className="text-lg font-mono text-gray-800">{path}</code>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      {children}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-purple-600" />
              <span className="font-semibold">Universal Auth API</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Book className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">API Documentation</h1>
          <p className="text-xl text-gray-600">
            Complete guide to integrating Universal Auth into your application
          </p>
        </motion.div>

        {/* Quick Start */}
        <div className="card mb-8 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <Key className="w-6 h-6 text-purple-600" />
            <span>Quick Start</span>
          </h2>
          <ol className="space-y-3">
            <li className="flex items-start space-x-3">
              <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <span>Sign in to your dashboard and register your domain</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <span>Copy your domain's API key from the dashboard</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <span>Use the endpoints below to authenticate users</span>
            </li>
          </ol>
        </div>

        {/* Authentication */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center space-x-2">
            <Lock className="w-8 h-8 text-purple-600" />
            <span>Authentication</span>
          </h2>
          <p className="text-gray-600 mb-6">
            All API requests must include your domain API key in the headers:
          </p>
          <CodeBlock id="auth-header" code={`// Add this header to all requests
Authorization: Bearer YOUR_DOMAIN_API_KEY

// Or use X-API-Key header
X-API-Key: YOUR_DOMAIN_API_KEY`} />
        </div>

        {/* Base URL */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-3 flex items-center space-x-2">
            <Globe className="w-6 h-6 text-purple-600" />
            <span>Base URL</span>
          </h3>
          <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg">
            https://your-api-domain.com/api/v1
          </code>
        </div>

        {/* Endpoints */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">API Endpoints</h2>

          {/* Send OTP */}
          <Endpoint
            method="POST"
            path="/users/send-otp"
            description="Send a one-time password to the user's email address"
          >
            <h4 className="font-semibold mb-2">Request Body:</h4>
            <CodeBlock id="send-otp-request" code={`{
  "email": "user@example.com"
}`} />
            
            <h4 className="font-semibold mt-4 mb-2">Response:</h4>
            <CodeBlock id="send-otp-response" code={`{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 10
}`} />

            <h4 className="font-semibold mt-4 mb-2">Example:</h4>
            <CodeBlock id="send-otp-example" code={`// JavaScript Example
const response = await fetch('https://your-api-domain.com/api/v1/users/send-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_DOMAIN_API_KEY'
  },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});

const data = await response.json();
console.log(data);`} />
          </Endpoint>

          {/* Verify OTP */}
          <Endpoint
            method="POST"
            path="/users/verify-otp"
            description="Verify the OTP and authenticate the user"
          >
            <h4 className="font-semibold mb-2">Request Body:</h4>
            <CodeBlock id="verify-otp-request" code={`{
  "email": "user@example.com",
  "otp": "123456",
  "deviceInfo": "Chrome on Windows" // optional
}`} />
            
            <h4 className="font-semibold mt-4 mb-2">Response:</h4>
            <CodeBlock id="verify-otp-response" code={`{
  "success": true,
  "message": "Authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "verified": true,
    "loginCount": 5,
    "lastLogin": "2025-11-20T14:20:02Z"
  }
}`} />

            <h4 className="font-semibold mt-4 mb-2">Example:</h4>
            <CodeBlock id="verify-otp-example" code={`// JavaScript Example
const response = await fetch('https://your-api-domain.com/api/v1/users/verify-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_DOMAIN_API_KEY'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    otp: '123456'
  })
});

const data = await response.json();
if (data.success) {
  // Store the token and user data
  localStorage.setItem('userToken', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
}
`} />
          </Endpoint>

          {/* Get Users */}
          <Endpoint
            method="GET"
            path="/users"
            description="Retrieve all users authenticated via your domain"
          >
            <h4 className="font-semibold mb-2">Query Parameters:</h4>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <ul className="space-y-2">
                <li><code className="text-sm bg-white px-2 py-1 rounded">page</code> - Page number (default: 1)</li>
                <li><code className="text-sm bg-white px-2 py-1 rounded">limit</code> - Items per page (default: 20)</li>
                <li><code className="text-sm bg-white px-2 py-1 rounded">search</code> - Search users by email</li>
              </ul>
            </div>
            
            <h4 className="font-semibold mb-2">Response:</h4>
            <CodeBlock id="get-users-response" code={`{
  "success": true,
  "users": [
    {
      "email": "john@example.com",
      "verified": true,
      "lastLogin": "2025-11-20T14:20:02Z",
      "loginCount": 12,
      "createdAt": "2025-03-11T09:22:00Z"
    },
    {
      "email": "jane@example.com",
      "verified": true,
      "lastLogin": "2025-11-19T10:15:30Z",
      "loginCount": 8,
      "createdAt": "2025-05-15T14:10:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "pages": 8
  }
}`} />

            <h4 className="font-semibold mt-4 mb-2">Example:</h4>
            <CodeBlock id="get-users-example" code={`// JavaScript Example
const response = await fetch('https://your-api-domain.com/api/v1/users?page=1&limit=20', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_DOMAIN_API_KEY'
  }
});

const data = await response.json();
console.log('Total users:', data.pagination.total);
console.log('Users:', data.users);`} />
          </Endpoint>
        </div>

        {/* Complete Integration Example */}
        <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <Code className="w-6 h-6 text-indigo-600" />
            <span>Complete React Integration Example</span>
          </h2>
          <CodeBlock id="react-example" code={`import React, { useState } from 'react';
import axios from 'axios';

const API_KEY = 'YOUR_DOMAIN_API_KEY';
const BASE_URL = 'https://your-api-domain.com/api/v1';

function AuthComponent() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);

  const sendOTP = async () => {
    try {
      const response = await axios.post(
        \`\${BASE_URL}/users/send-otp\`,
        { email },
        { headers: { 'Authorization': \`Bearer \${API_KEY}\` } }
      );
      
      if (response.data.success) {
        alert('OTP sent to your email!');
        setStep(2);
      }
    } catch (error) {
      alert('Failed to send OTP');
    }
  };

  const verifyOTP = async () => {
    try {
      const response = await axios.post(
        \`\${BASE_URL}/users/verify-otp\`,
        { email, otp },
        { headers: { 'Authorization': \`Bearer \${API_KEY}\` } }
      );
      
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        alert('Login successful!');
      }
    } catch (error) {
      alert('Invalid OTP');
    }
  };

  if (user) {
    return (
      <div>
        <h2>Welcome, {user.email}!</h2>
        <p>Login count: {user.loginCount}</p>
      </div>
    );
  }

  return (
    <div>
      {step === 1 ? (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <button onClick={sendOTP}>Send OTP</button>
        </>
      ) : (
        <>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            maxLength={6}
          />
          <button onClick={verifyOTP}>Verify</button>
        </>
      )}
    </div>
  );
}

export default AuthComponent;`} />
        </div>

        {/* Error Codes */}
        <div className="mt-12 card">
          <h2 className="text-2xl font-bold mb-6">Error Codes</h2>
          <div className="space-y-4">
            {[
              { code: 400, message: 'Bad Request', description: 'Invalid parameters or missing required fields' },
              { code: 401, message: 'Unauthorized', description: 'Invalid or missing API key' },
              { code: 404, message: 'Not Found', description: 'Resource not found' },
              { code: 429, message: 'Too Many Requests', description: 'Rate limit exceeded' },
              { code: 500, message: 'Internal Server Error', description: 'Server error occurred' }
            ].map((error) => (
              <div key={error.code} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <span className="font-bold text-lg text-red-600">{error.code}</span>
                <div>
                  <div className="font-semibold">{error.message}</div>
                  <div className="text-sm text-gray-600">{error.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="mt-12 text-center">
          <div className="card inline-block">
            <h3 className="text-xl font-bold mb-2">Need Help?</h3>
            <p className="text-gray-600">
              Contact our support team at <a href="mailto:support@universalauth.com" className="text-purple-600 hover:underline">support@universalauth.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
