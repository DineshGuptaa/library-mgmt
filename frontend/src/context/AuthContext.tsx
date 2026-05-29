import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '../types'
import { authApi, setOnUnauthorized } from '../api/client'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (res: { data: { user: User; accessToken: string; refreshToken: string } }) => void
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    setOnUnauthorized(() => {
      setToken(null)
      setUser(null)
      navigate('/login', { replace: true })
    })
  }, [navigate])

  const login = (res: { data: { user: User; accessToken: string; refreshToken: string } }) => {
    const { user: u, accessToken, refreshToken } = res.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(u))
    setToken(accessToken)
    setUser(u)
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
