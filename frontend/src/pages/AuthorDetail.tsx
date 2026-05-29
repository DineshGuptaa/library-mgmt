import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { authorsApi, booksApi } from '../api/client'
import BookCard from '../components/BookCard'
import type { Author, Book } from '../types'

export default function AuthorDetail() {
  const { id } = useParams<{ id: string }>()
  const [author, setAuthor] = useState<Author | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      authorsApi.getOne(parseInt(id)),
      booksApi.getAll(),
    ])
      .then(([authorRes, booksRes]) => {
        const auth = authorRes.data.data
        setAuthor(auth)
        const allBooks: Book[] = booksRes.data.data ?? []
        setBooks(allBooks.filter((b) =>
          b.author?.id === auth.id || b.bookAuthors?.some((ba) => ba.authorId === auth.id)
        ))
      })
      .catch(() => setError('Author not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (error || !author) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">{error || 'Author not found'}</p>
        <Link to="/authors" className="text-indigo-600 font-medium mt-4 inline-block hover:text-indigo-700">
          &larr; Back to authors
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/authors" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 mb-6 inline-block">
        &larr; Back to authors
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-3xl">
            {(author.name || 'A')[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{author.name || `Author #${author.id}`}</h1>
            {author.bio && <p className="text-gray-600 mt-3">{author.bio}</p>}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Books by {author.name || `Author #${author.id}`}
      </h2>

      {books.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No books by this author yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}
