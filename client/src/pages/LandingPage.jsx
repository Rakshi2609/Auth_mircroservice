import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  Lock, 
  Mail, 
  Key, 
  Globe,
  CheckCircle,
  ArrowRight,
  Code,
  Sparkles,
  TrendingUp
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Passwordless Authentication",
      description: "Email-based OTP system. No passwords, no friction, just fast and secure authentication."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-Domain Support",
      description: "Register unlimited domains. One account manages authentication for all your apps."
    },
    {
      icon: <Key className="w-6 h-6" />,
      title: "Secure API Keys",
      description: "Each domain gets unique API keys. Full control over your authentication flow."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "User Management Dashboard",
      description: "Complete user data, login history, sessions, and analytics in one place."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-time Analytics",
      description: "Daily, weekly, monthly charts. Track user growth and login patterns."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "OTP delivered in seconds. Instant verification. Seamless user experience."
    }
  ]

  const steps = [
    {
      number: "01",
      title: "Sign in with your email",
      description: "Create an account using our OTP-based email login system. No passwords required.",
      icon: <Mail className="w-8 h-8" />
    },
    {
      number: "02",
      title: "Register your domain",
      description: "Add your website domain and get instant access to your workspace and API keys.",
      icon: <Globe className="w-8 h-8" />
    },
    {
      number: "03",
      title: "Integrate our Auth API",
      description: "Use our /send-otp and /verify-otp endpoints. We handle verification, tokens, and sessions.",
      icon: <Code className="w-8 h-8" />
    },
    {
      number: "04",
      title: "Manage from Dashboard",
      description: "Monitor users, track logins, view analytics, and manage everything from your control panel.",
      icon: <BarChart3 className="w-8 h-8" />
    }
  ]

  const benefits = [
    "Reduce development time by 80%",
    "Enterprise-grade security",
    "99.9% uptime guarantee",
    "GDPR compliant",
    "Unlimited API calls",
    "24/7 support"
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-purple-600" />
            <span className="text-xl font-bold gradient-text">Universal Auth</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors">How It Works</a>
            <button onClick={() => navigate('/docs')} className="text-gray-600 hover:text-purple-600 transition-colors">Docs</button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-purple-600 text-sm font-medium">Passwordless Auth Made Simple</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Authenticate Users Across
              <br />
              <span className="gradient-text">Any Domain</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              One centralized email verification system. Login once, register your domain, 
              get a powerful dashboard & secure authentication API for your app.
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <button 
                onClick={() => navigate('/login')}
                className="btn-primary flex items-center space-x-2 text-lg"
              >
                <span>Start Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/docs')}
                className="btn-secondary text-lg"
              >
                View Documentation
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-600">
              {benefits.slice(0, 3).map((benefit, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Universal Auth?</h2>
            <p className="text-xl text-gray-600">Everything you need for modern authentication</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card hover:scale-105 transition-transform duration-200"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in minutes, not hours</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="flex space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      {step.icon}
                    </div>
                    <div className="text-5xl font-bold text-purple-100 mt-2">{step.number}</div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            {[
              { label: "API Uptime", value: "99.9%", icon: <TrendingUp className="w-8 h-8" /> },
              { label: "Avg Response Time", value: "<50ms", icon: <Zap className="w-8 h-8" /> },
              { label: "OTP Delivery", value: "<2sec", icon: <Mail className="w-8 h-8" /> },
              { label: "Security Rating", value: "A+", icon: <Shield className="w-8 h-8" /> }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-purple-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join developers who trust Universal Auth for their authentication needs
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="btn-primary text-lg inline-flex items-center space-x-2"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="w-6 h-6 text-purple-500" />
            <span className="text-xl font-bold text-white">Universal Auth</span>
          </div>
          <p className="text-sm">© 2025 Universal Auth. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
