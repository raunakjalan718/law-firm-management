import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, Edit3, CalendarDays } from 'lucide-react'
import { createAppointment, deleteAppointment, getAppointments, updateAppointment, getClients, getLawyers, getCases } from '../api'
import type { Appointment, Client, Lawyer, CaseItem } from '../types'

interface AppointmentFormState {
  clientId: number
  lawyerId: number
  caseId: number
  date: string
  time: string
  location: string
  appointmentType: string
  description: string
  status: string
}

const empty: AppointmentFormState = {
  clientId: 0,
  lawyerId: 0,
  caseId: 0,
  date: new Date().toISOString().split('T')[0],
  time: '10:00',
  location: 'Conference Room 1',
  appointmentType: 'Client Consultation',
  description: '',
  status: 'SCHEDULED'
}

export default function AppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [cases, setCases] = useState<CaseItem[]>([])
  const [form, setForm] = useState<AppointmentFormState>(empty)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [appRes, clientsRes, lawyersRes, casesRes] = await Promise.all([
        getAppointments(),
        getClients(),
        getLawyers(),
        getCases()
      ])
      setItems(appRes.data)
      setClients(clientsRes.data)
      setLawyers(lawyersRes.data)
      setCases(casesRes.data)

      setForm(prev => ({
        ...prev,
        clientId: prev.clientId || clientsRes.data[0]?.id || 0,
        lawyerId: prev.lawyerId || lawyersRes.data[0]?.id || 0
      }))
      setError(null)
    } catch (err) {
      setError('Failed to load appointments data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientId || !form.lawyerId) {
      setError('Please select both a client and a lawyer.')
      return
    }
    setSubmitting(true)
    setError(null)

    const payload = {
      ...form,
      caseId: form.caseId && form.caseId > 0 ? form.caseId : null
    }

    try {
      if (editingId) {
        await updateAppointment(editingId, payload)
      } else {
        await createAppointment(payload)
      }
      setForm({
        ...empty,
        clientId: clients[0]?.id || 0,
        lawyerId: lawyers[0]?.id || 0
      })
      setEditingId(null)
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save appointment.')
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel and delete this appointment?')) {
      try {
        await deleteAppointment(id)
        await loadData()
      } catch (err) {
        alert('Failed to delete appointment.')
      }
    }
  }

  const startEdit = (item: Appointment) => {
    setEditingId(item.id)
    setForm({
      clientId: item.clientId,
      lawyerId: item.lawyerId,
      caseId: item.caseId || 0,
      date: item.date,
      time: item.time,
      location: item.location,
      appointmentType: item.appointmentType,
      description: item.description || '',
      status: item.status
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({
      ...empty,
      clientId: clients[0]?.id || 0,
      lawyerId: lawyers[0]?.id || 0
    })
  }

  const filtered = items.filter(a =>
    (a.clientName && a.clientName.toLowerCase().includes(search.toLowerCase())) ||
    (a.lawyerName && a.lawyerName.toLowerCase().includes(search.toLowerCase())) ||
    a.location.toLowerCase().includes(search.toLowerCase()) ||
    a.appointmentType.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Appointments</h2>
          <p className="text-sm text-slate-500">Schedule meetings, hearings, and client consultations</p>
        </div>
        <button
          className="btn btn-primary text-sm flex items-center gap-2 self-start"
          onClick={cancelEdit}
        >
          <Plus size={16} /> New Appointment
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
              <CalendarDays size={18} className="text-blue-600" />
              {editingId ? 'Edit Appointment' : 'Book Appointment'}
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
            <label className="label">Client *</label>
            <select
              required
              className="input text-sm"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: Number(e.target.value) })}
            >
              <option value={0} disabled>Select client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.fullName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Counsel / Lawyer *</label>
            <select
              required
              className="input text-sm"
              value={form.lawyerId}
              onChange={(e) => setForm({ ...form, lawyerId: Number(e.target.value) })}
            >
              <option value={0} disabled>Select lawyer...</option>
              {lawyers.map(l => (
                <option key={l.id} value={l.id}>{l.fullName} ({l.specialization})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Associated Case (Optional)</label>
            <select
              className="input text-sm"
              value={form.caseId}
              onChange={(e) => setForm({ ...form, caseId: Number(e.target.value) })}
            >
              <option value={0}>None / General Consultation</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date *</label>
              <input
                required
                type="date"
                className="input text-sm"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Time *</label>
              <input
                required
                type="time"
                className="input text-sm"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Location / Room *</label>
            <input
              required
              className="input text-sm"
              placeholder="e.g. Conference Room A or Video Link"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <input
                className="input text-sm"
                placeholder="Hearing, Discovery..."
                value={form.appointmentType}
                onChange={(e) => setForm({ ...form, appointmentType: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Notes / Description</label>
            <textarea
              className="input text-sm h-18"
              placeholder="Meeting agenda, documents required..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <button className="btn btn-primary w-full text-sm py-2.5" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : editingId ? 'Update Appointment' : 'Save Appointment'}
          </button>
        </form>

        <div className="card lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-slate-50">
            <Search size={16} className="text-slate-400" />
            <input
              className="bg-transparent text-sm outline-none w-full"
              placeholder="Search appointments by client, lawyer, or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-2">Client / Lawyer</th>
                  <th className="px-2">Date & Time</th>
                  <th className="px-2">Location / Type</th>
                  <th className="px-2">Status</th>
                  <th className="text-right px-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">Loading appointments...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      {search ? 'No appointments match your search' : 'No appointments scheduled yet'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-2">
                        <div className="font-medium text-slate-900">{item.clientName || 'Client ID: ' + item.clientId}</div>
                        <div className="text-xs text-slate-500">Counsel: {item.lawyerName || 'Lawyer ID: ' + item.lawyerId}</div>
                      </td>
                      <td className="px-2">
                        <div className="font-medium text-slate-800">{item.date}</div>
                        <div className="text-xs text-slate-500">{item.time}</div>
                      </td>
                      <td className="px-2 text-slate-700">
                        <div>{item.location}</div>
                        <div className="text-xs text-slate-400">{item.appointmentType}</div>
                      </td>
                      <td className="px-2">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs border ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="text-right px-2 space-x-1 whitespace-nowrap">
                        <button
                          className="btn btn-secondary text-xs px-2.5 py-1 text-slate-700 hover:text-blue-600"
                          onClick={() => startEdit(item)}
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="btn btn-secondary text-xs px-2.5 py-1 text-slate-700 hover:text-red-600"
                          onClick={() => remove(item.id)}
                          title="Cancel/Delete"
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
