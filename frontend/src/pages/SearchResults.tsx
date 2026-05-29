import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { booksApi } from '../api/client'
import type { Book } from '../types'
import BookCover from '../components/BookCover'

const LIMIT = 20

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const [books, setBooks] = useState<Book[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const totalPages = Math.ceil(total / LIMIT)

  useEffect(() => {
    if (!query.trim()) {
      setBooks([])
      setTotal(0)
      setLoading(false)
      return
    }
    setLoading(true)
    booksApi.getAll({ search: query, page, limit: LIMIT })
      .then((res) => {
        setBooks(res.data.data ?? [])
        setTotal(res.data.meta?.totalItems ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [query, page])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/dashboard" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 mb-6 inline-block">
        &larr; Back to Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
        <p className="text-gray-500 mt-1">
          {query ? `Showing results for "${query}"` : 'Enter a search term to find books'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No books found.</p>
          <Link to="/dashboard" className="text-indigo-600 font-medium mt-2 inline-block hover:text-indigo-700">
            Go back to Dashboard
          </Link>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-indigo-300 transition-all"
              >
                <div className="flex items-start gap-4">
                  <BookCover src={book.imageUrlS} alt={book.title} className="w-12 h-16" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{book.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">by {book.author?.name || 'Unknown'}</p>
                    <div className="mt-3 text-xs text-gray-400 space-y-1">
                      <p>ISBN: {book.isbn || '—'}</p>
                      <p>Publisher: {book.publisher?.name || '—'}</p>
                      <p>Year: {book.publishYear || '—'}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
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
