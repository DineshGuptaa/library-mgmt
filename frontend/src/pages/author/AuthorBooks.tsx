import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { booksApi, authorsApi, categoriesApi, publishersApi } from '../../api/client'
import SearchableSelect from '../../components/SearchableSelect'
import type { Author, BookCategory, Publisher, Book } from '../../types'

const LIMIT = 10

export default function AuthorBooks() {
  const [authorId, setAuthorId] = useState<number | null>(null)
  const [categories, setCategories] = useState<BookCategory[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({
    title: '',
    isbn: '',
    publishYear: '',
    publisherId: '',
    categoryId: '',
    imageUrlS: '',
    imageUrlM: '',
    imageUrlL: '',
  })

  const totalPages = Math.ceil(total / LIMIT)

  const fetchBooks = () => {
    if (!authorId) return
    setLoading(true)
    booksApi.getAll({ page, limit: LIMIT, authorId })
      .then((res) => {
        setBooks(res.data.data ?? [])
        setTotal(res.data.meta?.totalItems ?? 0)
      })
      .catch(() => setError('Failed to load books'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    Promise.all([
      authorsApi.getMyProfile(),
      categoriesApi.getAll().catch(() => ({ data: { data: [] } })),
      publishersApi.getAll().catch(() => ({ data: { data: [] } })),
    ])
      .then(([profileRes, catsRes, pubsRes]) => {
        setAuthorId(profileRes.data.data.id)
        setCategories(catsRes.data.data ?? [])
        setPublishers(pubsRes.data.data ?? [])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (authorId) fetchBooks()
  }, [page, authorId])

  const resetForm = () => {
    setForm({
      title: '',
      isbn: '',
      publishYear: '',
      publisherId: '',
      categoryId: '',
      imageUrlS: '',
      imageUrlM: '',
      imageUrlL: '',
    })
  }

  const openAddForm = () => {
    setEditId(null)
    resetForm()
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const openEditForm = (book: Book) => {
    setEditId(book.id)
    setForm({
      title: book.title || '',
      isbn: book.isbn || '',
      publishYear: book.publishYear?.toString() || '',
      publisherId: book.publisher?.id?.toString() || '',
      categoryId: book.category?.id?.toString() || '',
      imageUrlS: book.imageUrlS || '',
      imageUrlM: book.imageUrlM || '',
      imageUrlL: book.imageUrlL || '',
    })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const buildPayload = () => {
    const payload: any = { title: form.title, isbn: form.isbn }
    if (form.publishYear) payload.publishYear = parseInt(form.publishYear)
    if (form.publisherId) payload.publisherId = parseInt(form.publisherId)
    if (form.categoryId) payload.categoryId = parseInt(form.categoryId)
    if (form.imageUrlS) payload.imageUrlS = form.imageUrlS
    if (form.imageUrlM) payload.imageUrlM = form.imageUrlM
    if (form.imageUrlL) payload.imageUrlL = form.imageUrlL
    return payload
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const payload = buildPayload()
      if (editId) {
        await booksApi.update(editId, payload)
        setSuccess('Book updated successfully!')
      } else {
        await booksApi.create(payload)
        setSuccess('Book added successfully!')
      }
      setShowForm(false)
      setEditId(null)
      setPage(1)
      fetchBooks()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return
    setError('')
    setSuccess('')
    try {
      await booksApi.remove(id)
      setSuccess('Book deleted successfully!')
      if (books.length === 1 && page > 1) {
        setPage((p) => p - 1)
      } else {
        fetchBooks()
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/dashboard" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 mb-6 inline-block">
        &larr; Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Books</h1>
          <p className="text-gray-500 mt-1">Manage your books</p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Add Book
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 text-sm p-4 rounded-xl mb-6">{success}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editId ? 'Edit Book' : 'Add New Book'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
                <input
                  type="text"
                  name="isbn"
                  required
                  value={form.isbn}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <SearchableSelect
                label="Publisher"
                placeholder="Type to search publisher..."
                options={publishers.map((p) => ({ id: p.id, label: p.name }))}
                value={form.publisherId}
                onChange={(v) => setForm((prev) => ({ ...prev, publisherId: v }))}
              />
              <SearchableSelect
                label="Category"
                placeholder="Type to search category..."
                options={categories.map((c) => ({ id: c.id, label: c.name }))}
                value={form.categoryId}
                onChange={(v) => setForm((prev) => ({ ...prev, categoryId: v }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publish Year</label>
              <input
                type="number"
                name="publishYear"
                value={form.publishYear}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs</label>
              <div className="grid sm:grid-cols-3 gap-3">
                <input
                  type="url"
                  name="imageUrlS"
                  placeholder="Small image URL"
                  value={form.imageUrlS}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                />
                <input
                  type="url"
                  name="imageUrlM"
                  placeholder="Medium image URL"
                  value={form.imageUrlM}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                />
                <input
                  type="url"
                  name="imageUrlL"
                  placeholder="Large image URL"
                  value={form.imageUrlL}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Saving...' : editId ? 'Update Book' : 'Add Book'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditId(null) }}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No books found.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">ID</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Title</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">ISBN</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Publisher</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">{book.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{book.title || '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{book.isbn || '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{book.publisher?.name || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEditForm(book)}
                          className="text-indigo-600 font-medium hover:text-indigo-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="text-red-500 font-medium hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
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
