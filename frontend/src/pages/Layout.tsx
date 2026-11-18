import { BarChart3, BriefcaseBusiness, CalendarDays, FolderOpen, Gavel, LogOut, Users } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', to: '/', icon: BarChart3 },
  { label: 'Clients', to: '/clients', icon: Users },
  { label: 'Lawyers', to: '/lawyers', icon: Gavel },
  { label: 'Cases', to: '/cases', icon: BriefcaseBusiness },
  { label: 'Appointments', to: '/appointments', icon: CalendarDays },
  { label: 'Documents', to: '/documents', icon: FolderOpen },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  const userEmail = localStorage.getItem('user_email') || 'admin@lawfirm.com'
  const userRole = localStorage.getItem('user_role') || 'ADMIN'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_id')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl shadow">
              ⚖️
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">LegalFlow</h1>
              <p className="text-xs text-slate-400">Law Practice ERP</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map(({ label, to, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 mt-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <div className="truncate mr-2">
              <p className="font-semibold text-slate-200 truncate">{userEmail}</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 text-[10px] font-medium border border-blue-700/50">
                {userRole}
              </span>
            </div>
          </div>

          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-red-950/40 hover:text-red-400 transition"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  )
}
