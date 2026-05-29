import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { booksApi, borrowingsApi, membersApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Book } from '../types'
import BookCover from '../components/BookCover'

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [borrowing, setBorrowing] = useState(false)
  const [memberId, setMemberId] = useState<number | null>(null)
  const [borrowMsg, setBorrowMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isMember = user?.role === 'MEMBER'

  useEffect(() => {
    if (!id) return
    setLoading(true)
    booksApi.getOne(parseInt(id))
      .then((res) => setBook(res.data.data))
      .catch(() => setError('Book not found'))
      .finally(() => setLoading(false))

    if (isMember) {
      membersApi.getMyProfile()
        .then((res) => setMemberId(res.data.data?.id ?? null))
        .catch(() => {})
    }
  }, [id, isMember])

  const handleBorrow = async () => {
    if (!memberId || !book) return
    setBorrowing(true)
    setBorrowMsg(null)
    try {
      await borrowingsApi.borrow({ memberId, bookId: book.id })
      setBorrowMsg({ type: 'success', text: `"${book.title}" borrowed successfully!` })
    } catch (err: any) {
      setBorrowMsg({ type: 'error', text: err.response?.data?.message || 'Failed to borrow book' })
    } finally {
      setBorrowing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">{error || 'Book not found'}</p>
        <Link to="/books" className="text-indigo-600 font-medium mt-4 inline-block hover:text-indigo-700">
          &larr; Back to books
        </Link>
      </div>
    )
  }

  const authorNames = book.author?.name || book.bookAuthors?.map((ba) => ba.author?.name).filter(Boolean).join(', ') || 'Unknown'

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/books" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 mb-6 inline-block">
        &larr; Back to books
      </Link>

      {borrowMsg && (
        <div className={`mb-6 text-sm p-4 rounded-xl ${borrowMsg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {borrowMsg.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <BookCover src={book.imageUrlL || book.imageUrlM} alt={book.title} className="w-48 h-64" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
            <p className="text-lg text-gray-600 mt-2">by {authorNames}</p>
            {book.publishYear && (
              <p className="text-gray-500 mt-2">Published: {book.publishYear}</p>
            )}
            {book.publisher && (
              <p className="text-gray-500 mt-1">Publisher: {book.publisher.name}</p>
            )}
            {book.category && (
              <p className="text-gray-500 mt-1">Category: {book.category.name}</p>
            )}
            <p className="text-gray-500 mt-1">ISBN: {book.isbn}</p>

            {isMember && memberId && (
              <button
                onClick={handleBorrow}
                disabled={borrowing}
                className="mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {borrowing ? 'Borrowing...' : 'Borrow This Book'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
