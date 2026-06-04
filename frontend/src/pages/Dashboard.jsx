
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { Flame, Clock, BookOpen, Calendar, TrendingUp, ChevronRight } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [stats, setStats] = useState({ streak: 0, weekly_hours: 0, sessions_completed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/subjects/'),
      api.get('/progress/stats')
    ]).then(([subRes, statsRes]) => {
      setSubjects(subRes.data)
      setStats(statsRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const statCards = [
    { label: 'Day Streak', value: stats.streak, icon: Flame, color: '#f59e0b' },
    { label: 'Hours This Week', value: stats.weekly_hours, icon: Clock, color: '#7c6af7' },
    { label: 'Sessions Done', value: stats.sessions_completed, icon: TrendingUp, color: '#10b981' },
    { label: 'Subjects', value: subjects.length, icon: BookOpen, color: '#06b6d4' },
  ]

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 6 }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text2)' }}>Here's your study overview for today</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Syne' }}>{value}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{label}</div>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subjects */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20 }}>Your Subjects</h2>
            <Link to="/subjects" style={{ color: 'var(--accent2)', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Manage <ChevronRight size={16} />
            </Link>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : subjects.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <BookOpen size={40} style={{ margin: '0 auto 16px', color: 'var(--text2)' }} />
              <p style={{ color: 'var(--text2)', marginBottom: 16 }}>No subjects yet</p>
              <Link to="/subjects" className="btn btn-primary">Add Your First Subject</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {subjects.map(s => {
                const progress = s.total_topics > 0 ? (s.completed_topics / s.total_topics) * 100 : 0
                return (
                  <div key={s.id} className="card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.color }} />
                        <span style={{ fontWeight: 500 }}>{s.name}</span>
                        <span className={`badge badge-${s.difficulty}`}>{s.difficulty}</span>
                      </div>
                      <span style={{ fontSize: 13, color: s.days_until_exam < 7 ? '#ef4444' : 'var(--text2)' }}>
                        {s.days_until_exam}d left
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: s.color, borderRadius: 3, transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>
                      {s.completed_topics}/{s.total_topics} topics • {Math.round(progress)}% done
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { to: '/schedule', icon: Calendar, label: 'Generate AI Schedule', color: 'var(--accent)' },
              { to: '/subjects', icon: BookOpen, label: 'Add Subject', color: '#10b981' },
              { to: '/progress', icon: TrendingUp, label: 'View Progress', color: '#f59e0b' },
            ].map(({ to, icon: Icon, label, color }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div className="card" style={{
                  padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer', transition: 'border-color 0.2s', borderColor: 'var(--border)'
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={color} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
                  <ChevronRight size={16} style={{ marginLeft: 'auto', color: 'var(--text2)' }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
