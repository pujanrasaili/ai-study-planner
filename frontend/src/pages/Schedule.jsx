
import { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Sparkles, Calendar, Clock, Lightbulb, RefreshCw } from 'lucide-react'

export default function Schedule() {
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(false)
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    api.get('/subjects/').then(res => setSubjects(res.data))
  }, [])

  const generateSchedule = async () => {
    if (subjects.length === 0) {
      toast.error('Add subjects first!')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/schedule/generate')
      setSchedule(res.data.schedule)
      if (!res.data.ai_generated) {
        toast('Add GROQ_API_KEY in backend .env for AI schedules', { icon: '⚡' })
      } else {
        toast.success('AI schedule generated!')
      }
    } catch (err) {
      toast.error('Failed to generate schedule')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>AI Schedule</h1>
          <p style={{ color: 'var(--text2)', marginTop: 4 }}>Let AI build your personalized study plan</p>
        </div>
        <button className="btn btn-primary" onClick={generateSchedule} disabled={loading}>
          {loading ? <><span className="spinner" /> Generating...</> : <><Sparkles size={18} /> Generate Schedule</>}
        </button>
      </div>

      {!schedule && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: 80 }}>
          <div style={{
            width: 80, height: 80, background: 'var(--accent)22', borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
          }}>
            <Sparkles size={40} color="var(--accent)" />
          </div>
          <h2 style={{ marginBottom: 12 }}>Ready to plan your week?</h2>
          <p style={{ color: 'var(--text2)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
            Our AI analyzes your subjects, deadlines, and difficulty levels to create the perfect study schedule.
          </p>
          <button className="btn btn-primary" onClick={generateSchedule} disabled={subjects.length === 0}
            style={{ padding: '14px 32px', fontSize: 16 }}>
            <Sparkles size={20} /> Generate My Schedule
          </button>
          {subjects.length === 0 && (
            <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 12 }}>Add subjects first to generate a schedule</p>
          )}
        </div>
      )}

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto 20px', borderWidth: 3 }} />
          <p style={{ color: 'var(--text2)' }}>AI is crafting your personalized schedule...</p>
        </div>
      )}

      {schedule && !loading && (
        <div className="fade-in">
          {schedule.week_summary && (
            <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #7c6af720, #7c6af705)', borderColor: '#7c6af740' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Sparkles size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ color: 'var(--text)', lineHeight: 1.6 }}>{schedule.week_summary}</p>
              </div>
            </div>
          )}

          {schedule.daily_plans && schedule.daily_plans.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {schedule.daily_plans.map((day, i) => (
                <div key={i} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 10, background: 'var(--accent)22',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Calendar size={20} color="var(--accent)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontFamily: 'Syne' }}>{day.day}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)' }}>{day.date}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)' }}>
                      <Clock size={14} /> {day.total_hours}h planned
                    </div>
                  </div>

                  {day.sessions && day.sessions.map((session, j) => (
                    <div key={j} style={{
                      padding: '12px 16px', background: 'var(--bg3)', borderRadius: 10,
                      marginBottom: 8, borderLeft: '3px solid var(--accent)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontWeight: 500 }}>{session.subject}</span>
                          <span style={{ color: 'var(--text2)', fontSize: 13 }}> — {session.topic}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap', marginLeft: 12 }}>
                          {session.time_slot}
                        </div>
                      </div>
                      {session.tips && (
                        <div style={{ fontSize: 12, color: 'var(--accent2)', marginTop: 6 }}>
                          💡 {session.tips}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {schedule.tips && schedule.tips.length > 0 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Lightbulb size={20} color="#f59e0b" />
                <h3>Study Tips</h3>
              </div>
              {schedule.tips.map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < schedule.tips.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ fontSize: 14, color: 'var(--text2)' }}>{tip}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button className="btn btn-outline" onClick={generateSchedule}>
              <RefreshCw size={16} /> Regenerate Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
