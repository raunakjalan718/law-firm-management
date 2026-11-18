import { useEffect, useState } from 'react'
import { Search, Plus, Trash2, Edit3, UserCheck } from 'lucide-react'
import { deleteClient, getClients, createClient, updateClient } from '../api'
import type { Client } from '../types'

const empty: Omit<Client, 'id'> = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  clientType: 'Individual',
  notes: ''
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getClients()
      setClients(res.data)
      setError(null)
    } catch (err) {
      setError('Failed to load clients.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      if (editingId) {
        await updateClient(editingId, form)
      } else {
        await createClient(form)
      }
      setForm(empty)
      setEditingId(null)
      await load()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save client.')
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this client? Related records may be affected.')) {
      try {
        await deleteClient(id)
        await load()
      } catch (err) {
        alert('Failed to delete client.')
      }
    }
  }

  const startEdit = (c: Client) => {
    setEditingId(c.id)
    setForm({
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      address: c.address,
      clientType: c.clientType,
      notes: c.notes || ''
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(empty)
  }

  const filtered = clients.filter((c) =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Clients</h2>
          <p className="text-sm text-slate-500">Manage client directory and case relationships</p>
        </div>
        <button
          className="btn btn-primary text-sm flex items-center gap-2 self-start"
          onClick={() => { cancelEdit() }}
        >
          <Plus size={16} /> New Client
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <form className="card lg:col-span-1 space-y-4 h-fit" onSubmit={submit}>
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <UserCheck size={18} className="text-blue-600" />
              {editingId ? 'Edit Client' : 'Register New Client'}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            )}
          </div>

          <div>
            <label className="label">Full Name *</label>
            <input
              required
              className="input text-sm"
              placeholder="e.g. John Doe"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Email *</label>
            <input
              required
              type="email"
              className="input text-sm"
              placeholder="e.g. john@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Phone Number *</label>
            <input
              required
              className="input text-sm"
              placeholder="e.g. +1-555-0100"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Client Type</label>
            <select
              className="input text-sm"
              value={form.clientType}
              onChange={(e) => setForm({ ...form, clientType: e.target.value })}
            >
              <option value="Individual">Individual</option>
              <option value="Corporate">Corporate</option>
              <option value="Non-Profit">Non-Profit</option>
              <option value="Government">Government</option>
            </select>
          </div>

          <div>
            <label className="label">Address *</label>
            <input
              required
              className="input text-sm"
              placeholder="e.g. 100 Main St, New York"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input text-sm h-20"
              placeholder="Consultation notes, case preferences..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <button className="btn btn-primary w-full text-sm py-2.5" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : editingId ? 'Update Client' : 'Save Client'}
          </button>
        </form>

        <div className="card lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-slate-50">
            <Search size={16} className="text-slate-400" />
            <input
              className="bg-transparent text-sm outline-none w-full"
              placeholder="Search clients by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-2">Name</th>
                  <th className="px-2">Email</th>
                  <th className="px-2">Phone</th>
                  <th className="px-2">Type</th>
                  <th className="text-right px-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">Loading clients...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      {search ? 'No clients match your search' : 'No clients registered yet'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-2 font-medium text-slate-900">{client.fullName}</td>
                      <td className="px-2 text-slate-600">{client.email}</td>
                      <td className="px-2 text-slate-600">{client.phone}</td>
                      <td className="px-2">
                        <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
                          {client.clientType}
                        </span>
                      </td>
                      <td className="text-right px-2 space-x-1 whitespace-nowrap">
                        <button
                          className="btn btn-secondary text-xs px-2.5 py-1 text-slate-700 hover:text-blue-600"
                          onClick={() => startEdit(client)}
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="btn btn-secondary text-xs px-2.5 py-1 text-slate-700 hover:text-red-600"
                          onClick={() => remove(client.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
