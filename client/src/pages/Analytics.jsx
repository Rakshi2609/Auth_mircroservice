import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  LogIn,
  Activity,
  Shield,
  Calendar
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Analytics() {
  const { domainId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [overview, setOverview] = useState(null)
  const [chartData, setChartData] = useState([])
  const [recentLogins, setRecentLogins] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(7)

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else {
      fetchAnalytics()
    }
  }, [user, domainId, period])

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, chartRes] = await Promise.all([
        axios.get(`/api/v1/analytics/overview/${domainId}`),
        axios.get(`/api/v1/analytics/chart/${domainId}`, {
          params: { days: period }
        })
      ])

      setOverview(overviewRes.data.overview)
      setRecentLogins(overviewRes.data.recentLogins)
      setChartData(chartRes.data.chartData)
    } catch (error) {
      toast.error('Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon, label, value, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-2 flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>{trend}</span>
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${color.replace('text', 'bg').replace('600', '100')} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-purple-600" />
              <span className="font-semibold">Universal Auth</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
          </div>
          <p className="text-gray-600">Monitor your authentication metrics and user activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6 text-purple-600" />}
            label="Total Users"
            value={overview?.totalUsers || 0}
            color="text-purple-600"
          />
          <StatCard
            icon={<Activity className="w-6 h-6 text-green-600" />}
            label="Active Users (24h)"
            value={overview?.activeUsers || 0}
            color="text-green-600"
          />
          <StatCard
            icon={<LogIn className="w-6 h-6 text-blue-600" />}
            label="Logins Today"
            value={overview?.loginsToday || 0}
            color="text-blue-600"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-indigo-600" />}
            label="Total Logins"
            value={overview?.totalLogins || 0}
            color="text-indigo-600"
          />
        </div>

        {/* Chart Section */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Login Activity</h2>
            <div className="flex space-x-2">
              {[7, 14, 30].map(days => (
                <button
                  key={days}
                  onClick={() => setPeriod(days)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    period === days
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Logins */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Recent Login Events</h2>
          
          {recentLogins.length === 0 ? (
            <div className="text-center py-12">
              <LogIn className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No recent login events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogins.map((login, index) => (
                <motion.div
                  key={login._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {login.user?.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {login.user?.email || login.email}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(login.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    login.success 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {login.success ? 'Success' : 'Failed'}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
