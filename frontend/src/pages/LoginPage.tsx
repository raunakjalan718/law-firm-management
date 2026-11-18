import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@lawfirm.com')
  const [password, setPassword] = useState('Admin@123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await login(email, password)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user_email', response.data.email)
      localStorage.setItem('user_role', response.data.role)
      localStorage.setItem('user_id', String(response.data.userId))
      navigate('/')
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message)
      } else {
        setError('Invalid credentials or backend not running on port 8081')
      }
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => {
    setEmail('admin@lawfirm.com')
    setPassword('Admin@123')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-2xl shadow-lg mb-3">
            ⚖️
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">LegalFlow</h1>
          <p className="text-sm text-slate-500 mt-1">Cloud-based law firm management</p>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@firm.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}
          <button className="btn btn-primary w-full py-2.5 shadow-md" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 border-t pt-4 text-center">
          <button
            type="button"
            onClick={fillDemo}
            className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
          >
            Use Demo Admin Credentials (admin@lawfirm.com / Admin@123)
          </button>
        </div>
      </div>
    </div>
  )
}
