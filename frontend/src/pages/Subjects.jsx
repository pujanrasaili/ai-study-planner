
import { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit3, BookOpen, X, Check } from 'lucide-react'

const COLORS = ['#7c6af7','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#8b5cf6','#14b8a6']

export default function Subjects() {
  const [subjects, setSubjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', exam_date: '', difficulty: 'medium',
    hours_per_week: 5, color: COLORS[0], total_topics: 10
  })

  const fetchSubjects = () => {
    api.get('/subjects/').then(res => setSubjects(res.data))
  }

  useEffect(() => { fetchSubjects() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editId) {
        await api.put(`/subjects/${editId}`, form)
        toast.success('Subject updated!')
      } else {
        await api.post('/subjects/', form)
        toast.success('Subject added!')
      }
      fetchSubjects()
      resetForm()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this subject?')) return
    await api.delete(`/subjects/${id}`)
    toast.success('Subject deleted')
    fetchSubjects()
  }

  const handleEdit = (s) => {
    setForm({
      name: s.name, exam_date: s.exam_date, difficulty: s.difficulty,
      hours_per_week: s.hours_per_week, color: s.color, total_topics: s.total_topics
    })
    setEditId(s.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setForm({ name: '', exam_date: '', difficulty: 'medium', hours_per_week: 5, color: COLORS[0], total_topics: 10 })
    setEditId(null)
    setShowForm(false)
  }

  const updateProgress = async (s, delta) => {
    const newVal = Math.max(0, Math.min(s.total_topics, s.completed_topics + delta))
    await api.put(`/subjects/${s.id}`, { completed_topics: newVal })
    fetchSubjects()
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Subjects</h1>
          <p style={{ color: 'var(--text2)', marginTop: 4 }}>Manage your exam subjects</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus size={18} /> Add Subject
        </button>
      </div>

      {showForm && (
        <div className="card fade-in" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3>{editId ? 'Edit Subject' : 'New Subject'}</h3>
            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)' }}>
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Subject Name</label>
              <input className="input" placeholder="e.g. Mathematics" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Exam Date</label>
              <input className="input" type="date" value={form.exam_date}
                onChange={e => setForm({ ...form, exam_date: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Difficulty</label>
              <select className="input" value={form.difficulty}
                onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Hours/Week Target</label>
              <input className="input" type="number" min="1" max="40" value={form.hours_per_week}
                onChange={e => setForm({ ...form, hours_per_week: parseFloat(e.target.value) })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Total Topics</label>
              <input className="input" type="number" min="1" max="100" value={form.total_topics}
                onChange={e => setForm({ ...form, total_topics: parseInt(e.target.value) })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setForm({ ...form, color: c })} style={{
                    width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: form.color === c ? '3px solid white' : '3px solid transparent',
                    transition: 'border 0.2s'
                  }} />
                ))}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : <><Check size={16} /> {editId ? 'Update' : 'Add Subject'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <BookOpen size={48} style={{ margin: '0 auto 16px', color: 'var(--text2)' }} />
          <h3 style={{ marginBottom: 8 }}>No subjects yet</h3>
          <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Add your first subject to get started</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Add Subject</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {subjects.map(s => {
            const progress = s.total_topics > 0 ? (s.completed_topics / s.total_topics) * 100 : 0
            return (
              <div key={s.id} className="card fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <h3 style={{ fontSize: 16 }}>{s.name}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleEdit(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)' }}><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <span className={`badge badge-${s.difficulty}`}>{s.difficulty}</span>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 12,
                    background: s.days_until_exam < 7 ? '#ef444422' : '#7c6af722',
                    color: s.days_until_exam < 7 ? '#ef4444' : '#7c6af7'
                  }}>
                    {s.days_until_exam}d until exam
                  </span>
                </div>

                <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 4, marginBottom: 10 }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: s.color, borderRadius: 4, transition: 'width 0.5s' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>{s.completed_topics}/{s.total_topics} topics</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => updateProgress(s, -1)} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 16 }}>−</button>
                    <button onClick={() => updateProgress(s, 1)} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 16 }}>+</button>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 10 }}>
                  {s.hours_per_week}h/week target • {Math.round(progress)}% complete
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
