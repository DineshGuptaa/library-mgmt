import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/client'

export default function Register() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<'MEMBER' | 'AUTHOR'>('MEMBER')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fn = role === 'MEMBER' ? authApi.registerMember : authApi.registerAuthor
      const res = await fn({ email, password, name: name || undefined })
      login(res.data)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
            <p className="text-gray-500 mt-2">Join the Library Management System</p>
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setRole('MEMBER')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'MEMBER' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              As Member
            </button>
            <button
              onClick={() => setRole('AUTHOR')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'AUTHOR' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              As Author
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {role === 'AUTHOR' ? '(min 8 chars)' : '(min 6 chars)'}
              </label>
              <input
                type="password"
                required
                minLength={role === 'AUTHOR' ? 8 : 6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Create a password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating account...' : `Register as ${role}`}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
