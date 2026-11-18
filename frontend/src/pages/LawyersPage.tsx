import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, Edit3, Gavel } from 'lucide-react'
import { createLawyer, deleteLawyer, getLawyers, updateLawyer } from '../api'
import type { Lawyer } from '../types'

const empty: Omit<Lawyer, 'id'> = {
  fullName: '',
  email: '',
  phone: '',
  specialization: '',
  yearsOfExperience: 5,
  barRegistrationNumber: '',
  availabilityStatus: 'Available'
}

export default function LawyersPage() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getLawyers()
      setLawyers(res.data)
      setError(null)
    } catch (err) {
      setError('Failed to load lawyers.')
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
        await updateLawyer(editingId, form)
      } else {
        await createLawyer(form)
      }
      setForm(empty)
      setEditingId(null)
      await load()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save lawyer details.')
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (id: number) => {
    if (window.confirm('Delete this lawyer? They will also be unassigned from any linked cases.')) {
      try {
        await deleteLawyer(id)
        await load()
      } catch (err) {
        alert('Failed to delete lawyer.')
      }
    }
  }

  const startEdit = (l: Lawyer) => {
    setEditingId(l.id)
    setForm({
      fullName: l.fullName,
      email: l.email,
      phone: l.phone,
      specialization: l.specialization,
      yearsOfExperience: l.yearsOfExperience,
      barRegistrationNumber: l.barRegistrationNumber,
      availabilityStatus: l.availabilityStatus
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(empty)
  }

  const filtered = lawyers.filter((l) =>
    l.fullName.toLowerCase().includes(search.toLowerCase()) ||
    l.specialization.toLowerCase().includes(search.toLowerCase()) ||
    l.barRegistrationNumber.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Busy':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'On Call':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Lawyers</h2>
          <p className="text-sm text-slate-500">Manage legal counsel and bar accreditations</p>
        </div>
        <button
          className="btn btn-primary text-sm flex items-center gap-2 self-start"
          onClick={cancelEdit}
        >
          <Plus size={16} /> New Lawyer
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
              <Gavel size={18} className="text-blue-600" />
              {editingId ? 'Edit Lawyer' : 'Add Legal Counsel'}
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
              placeholder="e.g. Adv. Jane Smith"
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
              placeholder="e.g. jane@lawfirm.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Phone Number *</label>
            <input
              required
              className="input text-sm"
              placeholder="e.g. +1-555-0200"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Specialization *</label>
            <input
              required
              className="input text-sm"
              placeholder="e.g. Criminal, Corporate, Civil"
              value={form.specialization}
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Experience (Years)</label>
              <input
                required
                type="number"
                min="0"
                max="60"
                className="input text-sm"
                value={form.yearsOfExperience}
                onChange={(e) => setForm({ ...form, yearsOfExperience: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Bar Reg. Number *</label>
              <input
                required
                className="input text-sm"
                placeholder="BAR-12345"
                value={form.barRegistrationNumber}
                onChange={(e) => setForm({ ...form, barRegistrationNumber: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Availability Status</label>
            <select
              className="input text-sm"
              value={form.availabilityStatus}
              onChange={(e) => setForm({ ...form, availabilityStatus: e.target.value })}
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="On Call">On Call</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>

          <button className="btn btn-primary w-full text-sm py-2.5" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : editingId ? 'Update Lawyer' : 'Save Lawyer'}
          </button>
        </form>

        <div className="card lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-slate-50">
            <Search size={16} className="text-slate-400" />
            <input
              className="bg-transparent text-sm outline-none w-full"
              placeholder="Search by lawyer name, specialization, or bar number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-2">Counsel Name</th>
                  <th className="px-2">Specialization</th>
                  <th className="px-2">Bar Reg</th>
                  <th className="px-2">Status</th>
                  <th className="text-right px-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">Loading lawyers...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      {search ? 'No lawyers match your search' : 'No lawyers registered yet'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((lawyer) => (
                    <tr key={lawyer.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-2">
                        <div className="font-medium text-slate-900">{lawyer.fullName}</div>
                        <div className="text-xs text-slate-500">{lawyer.email} · {lawyer.phone}</div>
                      </td>
                      <td className="px-2 text-slate-700">
                        {lawyer.specialization}
                        <div className="text-xs text-slate-400">{lawyer.yearsOfExperience} yrs experience</div>
                      </td>
                      <td className="px-2 text-xs font-mono text-slate-600">{lawyer.barRegistrationNumber}</td>
                      <td className="px-2">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs border ${getStatusBadge(lawyer.availabilityStatus)}`}>
                          {lawyer.availabilityStatus}
                        </span>
                      </td>
                      <td className="text-right px-2 space-x-1 whitespace-nowrap">
                        <button
                          className="btn btn-secondary text-xs px-2.5 py-1 text-slate-700 hover:text-blue-600"
                          onClick={() => startEdit(lawyer)}
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="btn btn-secondary text-xs px-2.5 py-1 text-slate-700 hover:text-red-600"
                          onClick={() => remove(lawyer.id)}
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
