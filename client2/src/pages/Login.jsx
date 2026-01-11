import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Mail, Lock, CheckCircle2 } from 'lucide-react'

// IMPORTANT: Replace with your actual domain API key from the dashboard
const API_KEY = 'uauth_da68e3b06451a7c38119683273e3b77deb831093405b4b3701913264e556eaab'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [authType, setAuthType] = useState('password') // 'password' or 'otp'
  const [step, setStep] = useState(1) // For multi-step flows
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  })
  const [loading, setLoading] = useState(false)

  // Login with password
  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/api/v1/users/login', {
        email: formData.email,
        password: formData.password
      }, {
        headers: { 'X-API-Key': API_KEY }
      })

      if (response.data.success) {
        toast.success('Login successful!')
        onLogin(response.data.token, response.data.user)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // OTP Login - Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/api/v1/users/send-otp', {
        email: formData.email
      }, {
        headers: { 'X-API-Key': API_KEY }
      })

      if (response.data.success) {
        toast.success('OTP sent to your email!')
        setStep(2)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // OTP Login - Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/api/v1/users/verify-otp', {
        email: formData.email,
        otp: formData.otp
      }, {
        headers: { 'X-API-Key': API_KEY }
      })

      if (response.data.success) {
        toast.success('Login successful!')
        onLogin(response.data.token, response.data.user)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP')
      setFormData({ ...formData, otp: '' })
    } finally {
      setLoading(false)
    }
  }

  // Register - Step 1: Send OTP for verification
  const handleRegisterSendOTP = async (e) => {
    e.preventDefault()
    
    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match')
    }

    setLoading(true)

    try {
      const response = await axios.post('/api/v1/users/send-otp', {
        email: formData.email
      }, {
        headers: { 'X-API-Key': API_KEY }
      })

      if (response.data.success) {
        toast.success('Verification code sent to your email!')
        setStep(2)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  // Register - Step 2: Complete registration with OTP
  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/api/v1/users/register', {
        email: formData.email,
        password: formData.password,
        otp: formData.otp
      }, {
        headers: { 'X-API-Key': API_KEY }
      })

      if (response.data.success) {
        toast.success('Registration successful! Please login')
        setMode('login')
        setStep(1)
        setFormData({ email: formData.email, password: '', confirmPassword: '', otp: '' })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      setFormData({ ...formData, otp: '' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Todo App</h1>
          <p className="text-gray-600">Powered by Universal Auth</p>
        </div>

        {/* Login/Register Card */}
        <div className="card">
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => {
                setMode('login')
                setStep(1)
                setAuthType('password')
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setMode('register')
                setStep(1)
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Register
            </button>
          </div>

          {/* LOGIN MODE */}
          {mode === 'login' && (
            <>
              {/* Auth Type Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  onClick={() => {
                    setAuthType('password')
                    setStep(1)
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    authType === 'password'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  🔑 Password
                </button>
                <button
                  onClick={() => {
                    setAuthType('otp')
                    setStep(1)
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    authType === 'otp'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  🔐 OTP
                </button>
              </div>

              {/* Password Login Form */}
              {authType === 'password' && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="input pl-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter password"
                        className="input pl-12"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>
              )}

              {/* OTP Login Form */}
              {authType === 'otp' && (
                <>
                  {step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="you@example.com"
                            className="input pl-12"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-primary disabled:opacity-50"
                      >
                        {loading ? 'Sending...' : 'Send OTP'}
                      </button>
                    </form>
                  )}

                  {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter OTP
                        </label>
                        <input
                          type="text"
                          value={formData.otp}
                          onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                          placeholder="000000"
                          className="input text-center text-2xl tracking-widest font-mono"
                          maxLength={6}
                          required
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Sent to: <span className="font-medium">{formData.email}</span>
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || formData.otp.length !== 6}
                        className="w-full btn btn-primary disabled:opacity-50"
                      >
                        {loading ? 'Verifying...' : 'Verify & Login'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full text-sm text-gray-600 hover:text-primary-600"
                      >
                        Use different email
                      </button>
                    </form>
                  )}
                </>
              )}
            </>
          )}

          {/* REGISTER MODE */}
          {mode === 'register' && (
            <>
              {step === 1 && (
                <form onSubmit={handleRegisterSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="input pl-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Minimum 6 characters"
                        className="input pl-12"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Re-enter password"
                        className="input pl-12"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Continue'}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      placeholder="000000"
                      className="input text-center text-2xl tracking-widest font-mono"
                      maxLength={6}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Sent to: <span className="font-medium">{formData.email}</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || formData.otp.length !== 6}
                    className="w-full btn btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-sm text-gray-600 hover:text-primary-600"
                  >
                    Back
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* API Key Warning */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Important:</strong> Update the <code className="bg-yellow-100 px-1 rounded">API_KEY</code> in <code className="bg-yellow-100 px-1 rounded">Login.jsx</code> with your domain's API key from the Universal Auth dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}
