import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            LibMS
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/books" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
              Books
            </Link>
            <Link to="/authors" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
              Authors
            </Link>
            <Link
              to={isAuthenticated ? '/admin' : '/login?role=admin'}
              className="text-amber-600 hover:text-amber-700 transition-colors font-medium border border-amber-200 rounded-lg px-3 py-1.5 hover:bg-amber-50"
            >
              Admin
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                  Dashboard
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                  Profile
                </Link>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-500">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-3">
          <Link to="/books" className="block text-gray-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>
            Books
          </Link>
          <Link to="/authors" className="block text-gray-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>
            Authors
          </Link>
          <Link
            to={isAuthenticated ? '/admin' : '/login?role=admin'}
            className="block text-amber-600 font-medium hover:text-amber-700"
            onClick={() => setMenuOpen(false)}
          >
            Admin
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="block text-gray-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/profile" className="block text-gray-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="block w-full text-left text-red-600 font-medium">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-gray-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="block text-indigo-600 font-medium" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
