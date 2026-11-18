import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { getDashboard } from '../api'
import type { DashboardData } from '../types'

const COLORS = ['#2563eb', '#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444']

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = () => {
    setLoading(true)
    setError(null)
    getDashboard()
      .then((res) => {
        setData(res.data)
        setLoading(false)
      })
      .catch((err) => {
        setError('Failed to fetch dashboard data. Ensure the Spring Boot backend is running on port 8081.')
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-sm text-slate-500">Loading dashboard analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
        <h3 className="text-lg font-bold text-red-900">Dashboard Unavailable</h3>
        <p className="text-sm text-red-700 mt-1 max-w-md mx-auto">{error}</p>
        <button onClick={loadData} className="btn btn-primary mt-4 text-sm inline-flex items-center gap-2">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    )
  }

  const pieData = Object.entries(data.caseStatusDistribution || {})
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">Overview of law firm metrics and cases</p>
        </div>
        <button
          onClick={loadData}
          className="btn btn-secondary text-sm flex items-center gap-2"
          title="Refresh metrics"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          ['Clients', data.totalClients, 'bg-blue-500'],
          ['Lawyers', data.totalLawyers, 'bg-indigo-500'],
          ['Active Cases', data.totalActiveCases, 'bg-emerald-500'],
          ['Closed Cases', data.totalClosedCases, 'bg-slate-500'],
          ['Upcoming Hearings', data.upcomingHearings, 'bg-amber-500'],
          ["Today's Appointments", data.todaysAppointments, 'bg-rose-500'],
        ].map(([label, value, barColor]) => (
          <div key={label as string} className="card hover:shadow-md transition">
            <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{value as number}</div>
            <div className={`mt-2 h-1 w-10 rounded ${barColor as string}`} />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="mb-4 text-base font-semibold text-slate-800">Case Status Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-slate-400">
              No case status data available
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="mb-4 text-base font-semibold text-slate-800">Monthly Case Registrations</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.monthlyCaseRegistrations || []}>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="mb-4 text-base font-semibold text-slate-800">Recent Cases</h3>
          <div className="space-y-3">
            {(data.recentCases || []).length > 0 ? (
              data.recentCases.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{c.title}</div>
                    <div className="text-xs text-slate-500">{c.caseNumber} · {c.clientName || 'No client'}</div>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200">
                    {c.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No cases found</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4 text-base font-semibold text-slate-800">Recent Activities</h3>
          <div className="space-y-3">
            {(data.recentActivities || []).length > 0 ? (
              data.recentActivities.slice(0, 5).map((a) => (
                <div key={a.id} className="border-b border-slate-100 pb-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 text-sm">{a.action}</span>
                    <span className="text-[11px] text-slate-400">{new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{a.details}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">By {a.actor}</div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No activity recorded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
