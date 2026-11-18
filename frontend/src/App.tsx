import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/ClientsPage'
import LawyersPage from './pages/LawyersPage'
import CasesPage from './pages/CasesPage'
import AppointmentsPage from './pages/AppointmentsPage'
import DocumentsPage from './pages/DocumentsPage'
import Layout from './pages/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
      />
      <Route
        path="/clients"
        element={<ProtectedRoute><ClientsPage /></ProtectedRoute>}
      />
      <Route
        path="/lawyers"
        element={<ProtectedRoute><LawyersPage /></ProtectedRoute>}
      />
      <Route
        path="/cases"
        element={<ProtectedRoute><CasesPage /></ProtectedRoute>}
      />
      <Route
        path="/appointments"
        element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>}
      />
      <Route
        path="/documents"
        element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
