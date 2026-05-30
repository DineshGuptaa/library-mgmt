import { Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AuthorRoute from './components/AuthorRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Books from './pages/Books'
import BookDetail from './pages/BookDetail'
import Authors from './pages/Authors'
import AuthorDetail from './pages/AuthorDetail'
import Profile from './pages/Profile'
import SearchResults from './pages/SearchResults'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminBooks from './pages/admin/AdminBooks'
import AdminMembers from './pages/admin/AdminMembers'
import AdminAddAuthor from './pages/admin/AdminAddAuthor'
import AuthorBooks from './pages/author/AuthorBooks'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/authors" element={<Authors />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/authors/:id" element={<AuthorDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/books"
            element={
              <AdminRoute>
                <AdminBooks />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/books/add"
            element={
              <AdminRoute>
                <AdminBooks />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/members"
            element={
              <AdminRoute>
                <AdminMembers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/authors"
            element={
              <AdminRoute>
                <AdminAddAuthor />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/authors/add"
            element={
              <AdminRoute>
                <AdminAddAuthor />
              </AdminRoute>
            }
          />
          <Route
            path="/author/books"
            element={
              <AuthorRoute>
                <AuthorBooks />
              </AuthorRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
    </GoogleOAuthProvider>
  )
}
