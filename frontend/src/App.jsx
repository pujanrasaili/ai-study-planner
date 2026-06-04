
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Subjects from './pages/Subjects'
import Schedule from './pages/Schedule'
import Progress from './pages/Progress'
import Pomodoro from './pages/Pomodoro'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a1a26', color: '#e8e8f0', border: '1px solid #2a2a3a' }
        }} />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="progress" element={<Progress />} />
            <Route path="pomodoro" element={<Pomodoro />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
