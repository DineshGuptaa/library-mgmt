import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { booksApi, authorsApi } from '../api/client'
import BookCard from '../components/BookCard'
import type { Book, Author } from '../types'

export default function Home() {
  const [books, setBooks] = useState<Book[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      booksApi.getAll({ page: 1, limit: 6 }),
      authorsApi.getAll(),
    ]).then(([booksRes, authorsRes]) => {
      setBooks(booksRes.data.data ?? [])
      setAuthors(authorsRes.data.data ?? [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Library Management System
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            Discover books, explore authors, and manage your library experience all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/books"
              className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
            >
              Browse Books
            </Link>
            <Link
              to="/register"
              className="bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold border border-indigo-400 hover:bg-indigo-400 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {books.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Recent Books</h2>
            <Link to="/books" className="text-indigo-600 font-medium hover:text-indigo-700">
              View all &rarr;
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {authors.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Authors</h2>
              <Link to="/authors" className="text-indigo-600 font-medium hover:text-indigo-700">
                View all &rarr;
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {authors.map((author) => (
                <Link
                  key={author.id}
                  to={`/authors/${author.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">
                      {(author.name || 'A')[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{author.name || `Author #${author.id}`}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
