import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import TodoApp from './pages/TodoApp'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('todoAppToken'))

  useEffect(() => {
    if (token) {
      const userData = localStorage.getItem('todoAppUser')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
  }, [token])

  const handleLogin = (authToken, userData) => {
    setToken(authToken)
    setUser(userData)
    localStorage.setItem('todoAppToken', authToken)
    localStorage.setItem('todoAppUser', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('todoAppToken')
    localStorage.removeItem('todoAppUser')
  }

  return (
    <>
      <Toaster position="top-right" />
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <TodoApp user={user} onLogout={handleLogout} />
      )}
    </>
  )
}

export default App
