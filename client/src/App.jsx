import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DomainManagement from './pages/DomainManagement'
import UserManagement from './pages/UserManagement'
import Analytics from './pages/Analytics'
import ApiDocs from './pages/ApiDocs'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/domains" element={<DomainManagement />} />
          <Route path="/users/:domainId" element={<UserManagement />} />
          <Route path="/analytics/:domainId" element={<Analytics />} />
          <Route path="/docs" element={<ApiDocs />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
