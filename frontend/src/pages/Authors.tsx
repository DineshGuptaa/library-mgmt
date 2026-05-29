import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { authorsApi } from '../api/client'
import type { Author } from '../types'

const LIMIT = 12

export default function Authors() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const totalPages = Math.ceil(total / LIMIT)

  useEffect(() => {
    setLoading(true)
    authorsApi.getAll({ page, limit: LIMIT })
      .then((res) => {
        setAuthors(res.data.data ?? [])
        setTotal(res.data.meta?.totalItems ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Authors</h1>
        <p className="text-gray-500 mt-1">Meet our authors and explore their work</p>
      </div>

      {authors.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No authors yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {authors.map((author) => (
              <Link
                key={author.id}
                to={`/authors/${author.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-purple-200 transition-all"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                    {(author.name || 'A')[0]}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mt-3">{author.name || `Author #${author.id}`}</h3>
                  {author.bio && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{author.bio}</p>}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
