
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Zap } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be 6+ chars'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
      toast.success('Account created! Let\'s plan your studies 🎓')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, #7c6af720 0%, transparent 60%), var(--bg)'
    }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, background: 'var(--accent)', borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <Zap size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Get started</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Create your StudyAI account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['name', 'email', 'password'].map(field => (
            <div key={field}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input className="input"
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                placeholder={field === 'name' ? 'Your full name' : field === 'email' ? 'you@example.com' : '••••••••'}
                value={form[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                required />
            </div>
          ))}
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 8 }}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text2)' }}>
          Have an account? <Link to="/login" style={{ color: 'var(--accent2)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
