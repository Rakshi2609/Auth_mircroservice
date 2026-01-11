import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Plus, 
  LogOut, 
  Globe, 
  Key, 
  Users, 
  BarChart3,
  Copy,
  Check,
  Trash2,
  Settings
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout, loading: authLoading } = useAuth()
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [copiedKey, setCopiedKey] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    } else if (user) {
      fetchDomains()
    }
  }, [user, authLoading])

  const fetchDomains = async () => {
    try {
      const response = await axios.get('/api/v1/domains/my-domains')
      setDomains(response.data.domains)
    } catch (error) {
      toast.error('Failed to fetch domains')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDomain = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/v1/domains/register', {
        domainName: newDomain
      })
      if (response.data.success) {
        toast.success('Domain registered successfully!')
        setShowModal(false)
        setNewDomain('')
        fetchDomains()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register domain')
    }
  }

  const handleCopyKey = (apiKey) => {
    navigator.clipboard.writeText(apiKey)
    setCopiedKey(apiKey)
    toast.success('API key copied!')
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleDeleteDomain = async (domainId, domainName) => {
    if (window.confirm(`Delete domain ${domainName}? This will delete all associated users.`)) {
      try {
        await axios.delete(`/api/v1/domains/${domainId}`)
        toast.success('Domain deleted')
        fetchDomains()
      } catch (error) {
        toast.error('Failed to delete domain')
      }
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold gradient-text">Universal Auth</span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-gray-600">👋 {user?.email}</span>
              <button onClick={() => navigate('/docs')} className="text-gray-600 hover:text-purple-600">
                Documentation
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Domains</h1>
          <p className="text-gray-600">Manage your registered domains and API keys</p>
        </div>

        {/* Add Domain Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          className="btn-primary mb-8 inline-flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Register New Domain</span>
        </motion.button>

        {/* Domains Grid */}
        {domains.length === 0 ? (
          <div className="text-center py-20">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No domains yet</h3>
            <p className="text-gray-600 mb-6">Register your first domain to get started</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Register Domain
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {domains.map((domain) => (
              <motion.div
                key={domain._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{domain.domainName}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(domain.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDomain(domain._id, domain.domainName)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* API Key */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">API Key</label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-gray-50 px-3 py-2 rounded border border-gray-200 text-sm font-mono truncate">
                      {domain.apiKey}
                    </code>
                    <button
                      onClick={() => handleCopyKey(domain.apiKey)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      {copiedKey === domain.apiKey ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-600">
                      {domain.statistics.totalUsers}
                    </div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-indigo-600">
                      {domain.statistics.totalLogins}
                    </div>
                    <div className="text-sm text-gray-600">Total Logins</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/users/${domain._id}`)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>Users</span>
                  </button>
                  <button
                    onClick={() => navigate(`/analytics/${domain._id}`)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Domain Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-4">Register New Domain</h2>
            <form onSubmit={handleAddDomain} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain Name
                </label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  className="input-field"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter your website domain (e.g., rakshithganjimut.xyz)
                </p>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="flex-1 btn-primary">
                  Register Domain
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
