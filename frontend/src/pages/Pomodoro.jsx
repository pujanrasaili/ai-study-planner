import { useState, useEffect, useRef } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Play, Pause, RotateCcw, Coffee, Brain, Battery } from 'lucide-react'

const MODES = {
  focus: { label: 'Focus', duration: 25 * 60, color: '#7c6af7' },
  short: { label: 'Short Break', duration: 5 * 60, color: '#10b981' },
  long: { label: 'Long Break', duration: 15 * 60, color: '#06b6d4' },
}

export default function Pomodoro() {
  const [mode, setMode] = useState('focus')
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const intervalRef = useRef(null)

  useEffect(() => {
    api.get('/subjects/').then(res => {
      setSubjects(res.data)
      if (res.data.length > 0) setSelectedSubject(res.data[0].id)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setTimeLeft(MODES[mode].duration)
    setRunning(false)
    clearInterval(intervalRef.current)
  }, [mode])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            handleComplete()
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const handleComplete = () => {
    if (mode === 'focus') {
      const newSessions = sessions + 1
      setSessions(newSessions)
      toast.success(`Pomodoro ${newSessions} complete! 🎉 Take a break.`)
      setMode(newSessions % 4 === 0 ? 'long' : 'short')
    } else {
      toast('Break over! Time to focus 💪', { icon: '⏱️' })
      setMode('focus')
    }
  }

  const reset = () => {
    setRunning(false)
    setTimeLeft(MODES[mode].duration)
  }

  const total = MODES[mode].duration
  const progress = (total - timeLeft) / total
  const radius = 110
  const circumference = 2 * Math.PI * radius
  const strokeDash = circumference * (1 - progress)

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const color = MODES[mode].color

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Pomodoro Timer</h1>
        <p style={{ color: 'var(--text2)', marginTop: 4 }}>Stay focused with timed study sessions</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Timer */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 32px' }}>
          {/* Mode selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 40, background: 'var(--bg3)', padding: 4, borderRadius: 12 }}>
            {Object.entries(MODES).map(([key, val]) => (
              <button key={key} onClick={() => setMode(key)} style={{
                padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: mode === key ? color : 'transparent',
                color: mode === key ? 'white' : 'var(--text2)',
                fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500,
                transition: 'all 0.2s'
              }}>{val.label}</button>
            ))}
          </div>

          {/* Circular timer */}
          <div style={{ position: 'relative', width: 280, height: 280, marginBottom: 40 }}>
            <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="140" cy="140" r={radius} fill="none" stroke="var(--bg3)" strokeWidth="10" />
              <circle cx="140" cy="140" r={radius} fill="none" stroke={color}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ fontSize: 56, fontWeight: 800, fontFamily: 'Syne', letterSpacing: -2, color }}>
                {mins}:{secs}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>
                {MODES[mode].label}
              </div>
            </div>
          </div>

          {/* Subject selector */}
          {subjects.length > 0 && (
            <div style={{ width: '100%', maxWidth: 300, marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Studying:</label>
              <select className="input" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button onClick={reset} className="btn btn-outline" style={{ width: 48, height: 48, padding: 0, justifyContent: 'center', borderRadius: '50%' }}>
              <RotateCcw size={18} />
            </button>
            <button onClick={() => setRunning(r => !r)} style={{
              width: 72, height: 72, borderRadius: '50%', border: 'none',
              background: color, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.1s',
              boxShadow: `0 0 30px ${color}55`
            }}>
              {running ? <Pause size={28} color="white" /> : <Play size={28} color="white" style={{ marginLeft: 3 }} />}
            </button>
            <div style={{ width: 48, height: 48 }} />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div style={{ fontSize: 48, fontWeight: 800, fontFamily: 'Syne', color }}>{sessions}</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Pomodoros today</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8 }}>≈ {sessions * 25} min focused</div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 15, marginBottom: 16 }}>How it works</h3>
            {[
              { icon: Brain, color: '#7c6af7', label: 'Focus 25 min', desc: 'Work on one task' },
              { icon: Coffee, color: '#10b981', label: 'Short break 5 min', desc: 'Rest your mind' },
              { icon: Battery, color: '#06b6d4', label: 'Long break 15 min', desc: 'After 4 pomodoros' },
            ].map(({ icon: Icon, color: c, label, desc }) => (
              <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: c + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={c} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>Tips</h3>
            {['Close all distracting tabs', 'Put your phone face down', 'Have water nearby', 'One task per pomodoro'].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
                <span style={{ color, fontWeight: 700 }}>{i + 1}.</span> {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}