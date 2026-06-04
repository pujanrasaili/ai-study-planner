
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, BookOpen, Calendar, BarChart3, LogOut, Zap, Timer } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/subjects', icon: BookOpen, label: 'Subjects' },
    { to: '/schedule', icon: Calendar, label: 'Schedule' },
    { to: '/progress', icon: BarChart3, label: 'Progress' },
    { to: '/pomodoro', icon: Timer, label: 'Pomodoro' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '24px 16px',
        position: 'fixed', height: '100vh', zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, paddingLeft: 8 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--accent)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18 }}>StudyAI</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
              color: isActive ? 'white' : 'var(--text2)',
              background: isActive ? 'var(--accent)' : 'transparent',
              fontWeight: isActive ? 500 : 400,
              transition: 'all 0.2s',
              fontSize: 14
            })}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div style={{ padding: '8px 12px', marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{user?.email}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 240, padding: '32px', overflowY: 'auto', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  )
}
