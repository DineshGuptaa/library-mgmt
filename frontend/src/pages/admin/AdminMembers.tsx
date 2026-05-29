import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { membersApi } from '../../api/client'
import type { Member } from '../../types'

const LIMIT = 10

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
  })

  const totalPages = Math.ceil(total / LIMIT)

  const fetchMembers = () => {
    setLoading(true)
    membersApi.getAll({ page, limit: LIMIT })
      .then((res) => {
        setMembers(res.data.data ?? [])
        setTotal(res.data.meta?.totalItems ?? 0)
      })
      .catch(() => setError('Failed to load members'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMembers()
  }, [page])

  const openAddForm = () => {
    setEditId(null)
    setForm({ email: '', name: '', phone: '', address: '' })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const openEditForm = (member: Member) => {
    setEditId(member.id)
    setForm({
      email: member.user?.email || '',
      name: member.name || '',
      phone: member.phone || '',
      address: member.address || '',
    })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      if (editId) {
        const { email: _, ...updateData } = form
        await membersApi.update(editId, updateData)
        setSuccess('Member updated successfully!')
      } else {
        await membersApi.create(form)
        setSuccess('Member added successfully!')
      }
      setShowForm(false)
      setEditId(null)
      setPage(1)
      fetchMembers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return
    setError('')
    setSuccess('')
    try {
      await membersApi.remove(id)
      setSuccess('Member deleted successfully!')
      if (members.length === 1 && page > 1) {
        setPage((p) => p - 1)
      } else {
        fetchMembers()
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/admin" className="text-sm text-amber-600 font-medium hover:text-amber-700 mb-6 inline-block">
        &larr; Back to Admin
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Members</h1>
          <p className="text-gray-500 mt-1">View, add, and update library members</p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-amber-700 transition-colors"
        >
          Add Member
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
            {editId ? 'Edit Member' : 'Add New Member'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                disabled={!!editId}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                rows={2}
                value={form.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Saving...' : editId ? 'Update Member' : 'Add Member'}
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No members found.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">ID</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Phone</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Address</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">{member.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{member.name || '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{member.phone || '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{member.address || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEditForm(member)}
                          className="text-amber-600 font-medium hover:text-amber-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
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
