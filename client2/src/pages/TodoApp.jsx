import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Check, X, LogOut, User } from 'lucide-react'

export default function TodoApp({ user, onLogout }) {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'active', 'completed'

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem(`todos_${user.email}`)
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
  }, [user.email])

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (todos.length > 0 || localStorage.getItem(`todos_${user.email}`)) {
      localStorage.setItem(`todos_${user.email}`, JSON.stringify(todos))
    }
  }, [todos, user.email])

  const addTodo = (e) => {
    e.preventDefault()
    if (!newTodo.trim()) {
      return toast.error('Please enter a todo')
    }

    const todo = {
      id: Date.now(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }

    setTodos([todo, ...todos])
    setNewTodo('')
    toast.success('Todo added!')
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
    toast.success('Todo deleted')
  }

  const clearCompleted = () => {
    const completedCount = todos.filter(t => t.completed).length
    if (completedCount === 0) {
      return toast.error('No completed todos to clear')
    }
    setTodos(todos.filter(todo => !todo.completed))
    toast.success(`Cleared ${completedCount} completed todo${completedCount > 1 ? 's' : ''}`)
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Todos</h1>
            <p className="text-gray-600 flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{user.email}</span>
            </p>
          </div>
          <button
            onClick={onLogout}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="card mb-6">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="input flex-1"
            />
            <button type="submit" className="btn btn-primary flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === 'active'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === 'completed'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed ({stats.completed})
            </button>
          </div>

          {stats.completed > 0 && (
            <button
              onClick={clearCompleted}
              className="btn btn-secondary text-sm"
            >
              Clear Completed
            </button>
          )}
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400 text-lg">
                {filter === 'all' && 'No todos yet. Add one above!'}
                {filter === 'active' && 'No active todos'}
                {filter === 'completed' && 'No completed todos'}
              </p>
            </div>
          ) : (
            filteredTodos.map(todo => (
              <div
                key={todo.id}
                className={`card flex items-center space-x-4 transition-all ${
                  todo.completed ? 'bg-gray-50 opacity-75' : 'bg-white'
                }`}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    todo.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-primary-500'
                  }`}
                >
                  {todo.completed && <Check className="w-4 h-4 text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-lg ${todo.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {todo.text}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(todo.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Authenticated with{' '}
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Universal Auth
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
