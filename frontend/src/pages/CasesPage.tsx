import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, Edit3, BriefcaseBusiness } from 'lucide-react'
import { createCase, deleteCase, getCases, updateCase, getClients, getLawyers } from '../api'
import type { CaseItem, Client, Lawyer } from '../types'

interface CaseFormState {
  caseNumber: string
  title: string
  caseType: string
  clientId: number
  lawyerIds: number[]
  courtName: string
  filingDate: string
  nextHearingDate: string
  description: string
  status: string
}

const empty: CaseFormState = {
  caseNumber: '',
  title: '',
  caseType: 'Commercial Litigation',
  clientId: 0,
  lawyerIds: [],
  courtName: '',
  filingDate: new Date().toISOString().split('T')[0],
  nextHearingDate: '',
  description: '',
  status: 'ACTIVE'
}

export default function CasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [form, setForm] = useState<CaseFormState>(empty)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [casesRes, clientsRes, lawyersRes] = await Promise.all([
        getCases(),
        getClients(),
        getLawyers()
      ])
      setCases(casesRes.data)
      setClients(clientsRes.data)
      setLawyers(lawyersRes.data)
      if (clientsRes.data.length > 0 && form.clientId === 0) {
        setForm(prev => ({ ...prev, clientId: clientsRes.data[0].id }))
      }
      setError(null)
    } catch (err) {
      setError('Failed to load cases data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientId) {
      setError('Please select a client for this case.')
      return
    }
    setSubmitting(true)
    setError(null)

    const payload = {
      ...form,
      nextHearingDate: form.nextHearingDate ? form.nextHearingDate : null
    }

    try {
      if (editingId) {
        await updateCase(editingId, payload)
      } else {
        await createCase(payload)
      }
      setForm({ ...empty, clientId: clients[0]?.id || 0 })
      setEditingId(null)
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save case.')
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this case? Linked appointments will also be removed.')) {
      try {
        await deleteCase(id)
        await loadData()
      } catch (err) {
        alert('Failed to delete case.')
      }
    }
  }

  const startEdit = (c: CaseItem) => {
    setEditingId(c.id)
    setForm({
      caseNumber: c.caseNumber,
      title: c.title,
      caseType: c.caseType,
      clientId: c.clientId,
      lawyerIds: c.lawyerIds || [],
      courtName: c.courtName,
      filingDate: c.filingDate || '',
      nextHearingDate: c.nextHearingDate || '',
      description: c.description || '',
      status: c.status
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ ...empty, clientId: clients[0]?.id || 0 })
  }

  const toggleLawyer = (lawyerId: number) => {
    setForm(prev => {
      const exists = prev.lawyerIds.includes(lawyerId)
      return {
        ...prev,
        lawyerIds: exists ? prev.lawyerIds.filter(id => id !== lawyerId) : [...prev.lawyerIds, lawyerId]
      }
    })
  }

  const filtered = cases.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
    (c.clientName && c.clientName.toLowerCase().includes(search.toLowerCase())) ||
    c.courtName.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'UNDER_REVIEW':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'HEARING_SCHEDULED':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'CLOSED':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'ARCHIVED':
        return 'bg-zinc-100 text-zinc-600 border-zinc-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Cases</h2>
          <p className="text-sm text-slate-500">Track court filings, assigned counsel, and hearings</p>
        </div>
        <button
          className="btn btn-primary text-sm flex items-center gap-2 self-start"
          onClick={cancelEdit}
        >
          <Plus size={16} /> New Case
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
              <BriefcaseBusiness size={18} className="text-blue-600" />
              {editingId ? 'Edit Case' : 'Register New Case'}
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
            <label className="label">Case Number *</label>
            <input
              required
              className="input text-sm"
              placeholder="e.g. LF-2026-002"
              value={form.caseNumber}
              onChange={(e) => setForm({ ...form, caseNumber: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Case Title *</label>
            <input
              required
              className="input text-sm"
              placeholder="e.g. Acme Corp vs. Supplier Ltd"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Client *</label>
            <select
              required
              className="input text-sm"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: Number(e.target.value) })}
            >
              <option value={0} disabled>Select a client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.fullName} ({c.clientType})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Case Type</label>
              <input
                className="input text-sm"
                placeholder="e.g. Civil, Commercial"
                value={form.caseType}
                onChange={(e) => setForm({ ...form, caseType: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="UNDER_REVIEW">UNDER REVIEW</option>
                <option value="HEARING_SCHEDULED">HEARING SCHEDULED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Court Name *</label>
            <input
              required
              className="input text-sm"
              placeholder="e.g. High Court of Mumbai"
              value={form.courtName}
              onChange={(e) => setForm({ ...form, courtName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Filing Date</label>
              <input
                type="date"
                className="input text-sm"
                value={form.filingDate}
                onChange={(e) => setForm({ ...form, filingDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Next Hearing</label>
              <input
                type="date"
                className="input text-sm"
                value={form.nextHearingDate}
                onChange={(e) => setForm({ ...form, nextHearingDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Assigned Lawyers</label>
            <div className="max-h-28 overflow-y-auto rounded-xl border border-slate-200 p-2 space-y-1 bg-slate-50">
              {lawyers.length === 0 ? (
                <p className="text-xs text-slate-400">No lawyers registered</p>
              ) : (
                lawyers.map(l => (
                  <label key={l.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.lawyerIds.includes(l.id)}
                      onChange={() => toggleLawyer(l.id)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span>{l.fullName} <span className="text-slate-400">({l.specialization})</span></span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input text-sm h-18"
              placeholder="Case summary, claims, notes..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <button className="btn btn-primary w-full text-sm py-2.5" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : editingId ? 'Update Case' : 'Save Case'}
          </button>
        </form>

        <div className="card lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-slate-50">
            <Search size={16} className="text-slate-400" />
            <input
              className="bg-transparent text-sm outline-none w-full"
              placeholder="Search by case number, title, client, or court..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-2">Case</th>
                  <th className="px-2">Client / Court</th>
                  <th className="px-2">Hearing Date</th>
                  <th className="px-2">Status</th>
                  <th className="text-right px-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">Loading cases...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      {search ? 'No cases match your search' : 'No cases filed yet'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-2">
                        <div className="font-medium text-slate-900">{c.title}</div>
                        <div className="text-xs font-mono text-slate-500">{c.caseNumber} · {c.caseType}</div>
                      </td>
                      <td className="px-2 text-slate-700">
                        <div>{c.clientName || 'Unassigned'}</div>
                        <div className="text-xs text-slate-400">{c.courtName}</div>
                      </td>
                      <td className="px-2 text-slate-600 text-xs">
                        {c.nextHearingDate ? (
                          <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {c.nextHearingDate}
                          </span>
                        ) : (
                          <span className="text-slate-400">Not scheduled</span>
                        )}
                      </td>
                      <td className="px-2">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs border ${getStatusBadge(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="text-right px-2 space-x-1 whitespace-nowrap">
                        <button
                          className="btn btn-secondary text-xs px-2.5 py-1 text-slate-700 hover:text-blue-600"
                          onClick={() => startEdit(c)}
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="btn btn-secondary text-xs px-2.5 py-1 text-slate-700 hover:text-red-600"
                          onClick={() => remove(c.id)}
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
