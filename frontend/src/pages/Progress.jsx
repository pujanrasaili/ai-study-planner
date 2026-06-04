
import { useState, useEffect } from 'react'
import api from '../utils/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Flame, Clock, CheckCircle2, TrendingUp } from 'lucide-react'

export default function Progress() {
  const [stats, setStats] = useState({ streak: 0, weekly_hours: 0, sessions_completed: 0 })
  const [subjects, setSubjects] = useState([])
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/progress/stats'),
      api.get('/subjects/'),
      api.get('/progress/sessions')
    ]).then(([s, sub, sess]) => {
      setStats(s.data)
      setSubjects(sub.data)
      setSessions(sess.data)
    })
  }, [])

  // Build weekly bar chart data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const daySessions = sessions.filter(s => s.date === dateStr && s.completed)
    const hours = daySessions.reduce((sum, s) => sum + (s.actual_hours || 0), 0)
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      hours: Math.round(hours * 10) / 10
    }
  })

  const pieData = subjects.map(s => ({
    name: s.name,
    value: s.completed_topics,
    color: s.color
  })).filter(d => d.value > 0)

  const statCards = [
    { label: 'Current Streak', value: `${stats.streak} days`, icon: Flame, color: '#f59e0b' },
    { label: 'Hours This Week', value: `${stats.weekly_hours}h`, icon: Clock, color: '#7c6af7' },
    { label: 'Sessions Completed', value: stats.sessions_completed, icon: CheckCircle2, color: '#10b981' },
    { label: 'Subjects Tracked', value: subjects.length, icon: TrendingUp, color: '#06b6d4' },
  ]

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
          <p style={{ fontSize: 13 }}>{payload[0].value}h studied</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Progress</h1>
        <p style={{ color: 'var(--text2)', marginTop: 4 }}>Track your study journey</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Syne' }}>{value}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{label}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Bar Chart */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Study Hours — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData}>
              <XAxis dataKey="day" tick={{ fill: '#9898b0', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9898b0', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="hours" fill="#7c6af7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Topics Completed</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(val, name) => [val + ' topics', name]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {pieData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text2)' }}>{d.name}</span>
                    <span style={{ marginLeft: 'auto' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)', fontSize: 14 }}>
              Complete some topics to see the chart
            </div>
          )}
        </div>
      </div>

      {/* Subject Progress */}
      {subjects.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 20 }}>Subject Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {subjects.map(s => {
              const pct = s.total_topics > 0 ? (s.completed_topics / s.total_topics) * 100 : 0
              return (
                <div key={s.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                      {s.completed_topics}/{s.total_topics} • {Math.round(pct)}%
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 4 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
