import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 mt-1">Manage your library system</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/admin/books"
          className="block bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md hover:border-amber-300 transition-all"
        >
          <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Manage Books</h2>
          <p className="text-gray-500 text-sm">View, add, edit, and delete books</p>
        </Link>

        <Link
          to="/admin/authors"
          className="block bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md hover:border-amber-300 transition-all"
        >
          <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Manage Authors</h2>
          <p className="text-gray-500 text-sm">View, add, edit, and delete authors</p>
        </Link>

        <Link
          to="/admin/members"
          className="block bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md hover:border-amber-300 transition-all"
        >
          <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Manage Members</h2>
          <p className="text-gray-500 text-sm">View, add, edit, and delete members</p>
        </Link>
      </div>
    </div>
  )
}
