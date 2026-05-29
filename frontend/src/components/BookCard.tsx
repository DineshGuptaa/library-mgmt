import { Link } from 'react-router-dom'
import type { Book } from '../types'
import BookCover from './BookCover'

export default function BookCard({ book }: { book: Book }) {
  const authorName = book.author?.name || book.bookAuthors?.[0]?.author?.name || 'Unknown'

  return (
    <Link
      to={`/books/${book.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-200 transition-all"
    >
      <div className="flex items-start gap-4">
        <BookCover src={book.imageUrlS} alt={book.title} className="w-12 h-16" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 truncate">{book.title}</h3>
          <p className="text-sm text-gray-500 mt-1">by {authorName}</p>
          {book.publishYear && (
            <p className="text-xs text-gray-400 mt-1">{book.publishYear}</p>
          )}
        </div>
        <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
