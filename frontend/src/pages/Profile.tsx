import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Profile() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-3xl">
            {user.email[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user.email}</h2>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
              user.role === 'MEMBER' ? 'bg-green-100 text-green-700' :
              user.role === 'AUTHOR' ? 'bg-purple-100 text-purple-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {user.role}
            </span>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-500">User ID</span>
            <span className="font-medium text-gray-900">{user.id}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-900">{user.email}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-500">Role</span>
            <span className="font-medium text-gray-900">{user.role}</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            to="/dashboard"
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            &larr; Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
