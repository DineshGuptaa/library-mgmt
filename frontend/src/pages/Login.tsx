import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/client'

type LoginRole = 'MEMBER' | 'AUTHOR' | 'ADMIN'

export default function Login() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const wantsAdmin = searchParams.get('role') === 'admin'

  const [role, setRole] = useState<LoginRole>(wantsAdmin ? 'ADMIN' : 'MEMBER')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    const target = wantsAdmin || user?.role === 'ADMIN' ? '/admin' : '/dashboard'
    navigate(target, { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let res
      if (role === 'ADMIN') {
        res = await authApi.loginAdmin({ email, password })
      } else {
        const fn = role === 'MEMBER' ? authApi.registerMember : authApi.registerAuthor
        res = await fn({ email, password })
      }
      login(res.data)
      navigate(role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-2">Sign in to your account</p>
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setRole('MEMBER')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'MEMBER' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Member
            </button>
            <button
              onClick={() => setRole('AUTHOR')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'AUTHOR' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Author
            </button>
            {wantsAdmin && (
              <button
                onClick={() => setRole('ADMIN')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'ADMIN' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Admin
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : `Sign in as ${role}`}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-medium hover:text-indigo-700">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
