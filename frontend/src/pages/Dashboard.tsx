import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { booksApi, borrowingsApi, membershipCardsApi, membersApi, categoriesApi, publishersApi } from '../api/client'
import SearchableSelect from '../components/SearchableSelect'
import type { Book, MembershipCard, Borrowing, BookCategory, Publisher } from '../types'

const BORROW_LIMIT = 5

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isMember = user?.role === 'MEMBER'
  const isAuthor = user?.role === 'AUTHOR'
  const isAdmin = user?.role === 'ADMIN'

  const [books, setBooks] = useState<Book[]>([])
  const [newBookTitle, setNewBookTitle] = useState('')
  const [newBookIsbn, setNewBookIsbn] = useState('')
  const [newBookYear, setNewBookYear] = useState('')
  const [newBookPublisherId, setNewBookPublisherId] = useState('')
  const [newBookCategoryId, setNewBookCategoryId] = useState('')
  const [newBookImageUrlS, setNewBookImageUrlS] = useState('')
  const [newBookImageUrlM, setNewBookImageUrlM] = useState('')
  const [newBookImageUrlL, setNewBookImageUrlL] = useState('')
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [categories, setCategories] = useState<BookCategory[]>([])
  const [membershipCard, setMembershipCard] = useState<MembershipCard | null>(null)
  const [myBorrowings, setMyBorrowings] = useState<Borrowing[]>([])
  const [memberId, setMemberId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Book[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const activeBorrowings = myBorrowings.filter((b) => !b.returnDate)
  const activeCount = activeBorrowings.length
  const canBorrow = activeCount < BORROW_LIMIT

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    categoriesApi.getAll().then((res) => setCategories(res.data.data ?? [])).catch(() => {})
    publishersApi.getAll().then((res) => setPublishers(res.data.data ?? [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setSearchResults([])
      setShowResults(false)
      setHighlightIdx(-1)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearching(true)
      booksApi.getAll({ search: searchQuery, limit: 10 })
        .then((res) => {
          setSearchResults(res.data.data ?? [])
          setShowResults(true)
          setHighlightIdx(-1)
        })
        .catch(() => {})
        .finally(() => setSearching(false))
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  const fetchData = () => {
    if (!user) return
    setLoading(true)

    if (isAuthor) {
      booksApi.getAll()
        .then((res) => setBooks(res.data.data ?? []))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else if (isMember) {
      Promise.all([
        booksApi.getAll(),
        membersApi.getMyProfile().catch(() => null),
        membershipCardsApi.getByMember(user.id).catch(() => null),
      ]).then(([bRes, profileRes, cardRes]) => {
        setBooks(bRes.data.data ?? [])
        if (profileRes?.data?.data) {
          const m = profileRes.data.data
          setMemberId(m.id)
          borrowingsApi.getByMember(m.id)
            .then((brRes) => setMyBorrowings(brRes.data.data ?? []))
            .catch(() => {})
        }
        if (cardRes?.data?.data) setMembershipCard(cardRes.data.data)
      }).catch(() => {}).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const goToBookDetail = (bookId: number) => {
    setShowResults(false)
    navigate(`/books/${bookId}`)
  }

  const goToSearchPage = () => {
    const q = searchQuery.trim()
    if (!q) return
    setShowResults(false)
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx((prev) => Math.min(prev + 1, searchResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIdx >= 0 && highlightIdx < searchResults.length) {
        goToBookDetail(searchResults[highlightIdx].id)
      } else {
        goToSearchPage()
      }
    }
  }

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await booksApi.create({
        title: newBookTitle,
        isbn: newBookIsbn,
        publishYear: newBookYear ? parseInt(newBookYear) : undefined,
        publisherId: newBookPublisherId ? parseInt(newBookPublisherId) : undefined,
        categoryId: newBookCategoryId ? parseInt(newBookCategoryId) : undefined,
        imageUrlS: newBookImageUrlS || undefined,
        imageUrlM: newBookImageUrlM || undefined,
        imageUrlL: newBookImageUrlL || undefined,
      })
      setBooks((prev) => [res.data, ...prev])
      setNewBookTitle('')
      setNewBookIsbn('')
      setNewBookYear('')
      setNewBookPublisherId('')
      setNewBookCategoryId('')
      setNewBookImageUrlS('')
      setNewBookImageUrlM('')
      setNewBookImageUrlL('')
      setSuccess('Book added successfully!')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add book')
    }
  }

  const handleReturn = async (borrowingId: number) => {
    if (!window.confirm('Return this book?')) return
    setError('')
    setSuccess('')
    try {
      await borrowingsApi.returnBook(borrowingId)
      setSuccess('Book returned successfully!')
      if (memberId) {
        const brRes = await borrowingsApi.getByMember(memberId)
        setMyBorrowings(brRes.data.data ?? [])
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to return book')
    }
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome, {user?.email} ({user?.role})
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 text-sm p-4 rounded-xl mb-6">{success}</div>
      )}

      {isAdmin && (
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
              <h2 className="text-xl font-semibold mb-3">Admin Panel</h2>
              <p className="text-amber-100 mb-4">Manage books, members, and more.</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/admin/books" className="bg-white text-amber-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors">Manage Books</Link>
                <Link to="/admin/authors" className="bg-white text-amber-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors">Manage Authors</Link>
                <Link to="/admin/members" className="bg-white text-amber-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors">Manage Members</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {isMember && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">My Borrowings</h2>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${canBorrow ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {activeCount} of {BORROW_LIMIT} borrowed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full transition-all ${activeCount >= BORROW_LIMIT ? 'bg-red-500' : 'bg-indigo-500'}`}
                  style={{ width: `${(activeCount / BORROW_LIMIT) * 100}%` }}
                />
              </div>

              {!canBorrow && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                  You have reached the maximum limit of {BORROW_LIMIT} books. Please return a book before borrowing another.
                </div>
              )}

              {myBorrowings.length === 0 ? (
                <p className="text-gray-400 text-sm py-4">No borrowings yet.</p>
              ) : (
                <div className="space-y-3">
                  {myBorrowings.map((b) => {
                    const isActive = !b.returnDate
                    return (
                      <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{b.book?.title || `Book #${b.bookId}`}</p>
                          <p className="text-xs text-gray-500">
                            Borrowed: {new Date(b.borrowDate).toLocaleDateString()}
                            {b.returnDate && ` | Returned: ${new Date(b.returnDate).toLocaleDateString()}`}
                          </p>
                        </div>
                        {isActive && (
                          <button
                            onClick={() => handleReturn(b.id)}
                            className="ml-3 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors shrink-0"
                          >
                            Return
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Borrow a Book</h2>

              <div ref={searchRef} className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search by title, ISBN, or publisher... (min 3 chars)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  disabled={!canBorrow}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {searching && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                  </div>
                )}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                    {searchResults.map((book, i) => (
                      <button
                        key={book.id}
                        type="button"
                        onClick={() => goToBookDetail(book.id)}
                        onMouseEnter={() => setHighlightIdx(i)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${i === highlightIdx ? 'bg-indigo-100' : 'hover:bg-indigo-50'}`}
                      >
                        <p className="text-sm font-medium text-gray-900">{book.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          ID: {book.id} | ISBN: {book.isbn || '—'} | {book.publisher?.name || '—'} | {book.publishYear || '—'}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                {showResults && searchQuery.trim() && !searching && searchResults.length === 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-500">
                    No books found matching "{searchQuery}"
                  </div>
                )}
              </div>

            </div>

            {membershipCard && (
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
                <h2 className="text-lg font-semibold mb-3">Your Membership Card</h2>
                <div className="space-y-1 text-indigo-100">
                  <p>Issued: {new Date(membershipCard.issueDate).toLocaleDateString()}</p>
                  <p>Expires: {new Date(membershipCard.expiryDate).toLocaleDateString()}</p>
                  <p className="text-xs mt-2 opacity-75">Card ID: #{membershipCard.id}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {isAuthor && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add a New Book</h2>
              <form onSubmit={handleAddBook} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <input type="text" required placeholder="Book title" value={newBookTitle} onChange={(e) => setNewBookTitle(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                  <input type="text" required placeholder="ISBN" value={newBookIsbn} onChange={(e) => setNewBookIsbn(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <SearchableSelect
                    label="Publisher"
                    placeholder="Type to search publisher..."
                    options={publishers.map((p) => ({ id: p.id, label: p.name }))}
                    value={newBookPublisherId}
                    onChange={(v) => setNewBookPublisherId(v)}
                  />
                  <SearchableSelect
                    label="Category"
                    placeholder="Type to search category..."
                    options={categories.map((c) => ({ id: c.id, label: c.name }))}
                    value={newBookCategoryId}
                    onChange={(v) => setNewBookCategoryId(v)}
                  />
                </div>
                <input type="number" placeholder="Published year (optional)" value={newBookYear} onChange={(e) => setNewBookYear(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs</label>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <input type="url" placeholder="Small image URL" value={newBookImageUrlS} onChange={(e) => setNewBookImageUrlS(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" />
                    <input type="url" placeholder="Medium image URL" value={newBookImageUrlM} onChange={(e) => setNewBookImageUrlM(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" />
                    <input type="url" placeholder="Large image URL" value={newBookImageUrlL} onChange={(e) => setNewBookImageUrlL(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" />
                  </div>
                </div>
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Add Book</button>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isAuthor ? 'My Books' : 'Available Books'}
          </h2>
          {isAuthor ? (
            <Link
              to="/author/books"
              className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-indigo-700 group-hover:text-indigo-800">Manage Your Books</p>
                <p className="text-xs text-indigo-500 mt-0.5">View, edit, and delete your books with pagination</p>
              </div>
              <span className="text-indigo-600 text-lg group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          ) : books.length === 0 ? (
            <p className="text-gray-400 text-sm">No books yet.</p>
          ) : (
            <ul className="space-y-3">
              {books.slice(0, 10).map((book) => (
                <li key={book.id} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center text-xs font-medium">
                    {book.id}
                  </span>
                  <span className="text-gray-700 truncate">{book.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
