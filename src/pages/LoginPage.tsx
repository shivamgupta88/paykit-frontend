import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ slug: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const tenantRes = await authApi.getTenantBySlug(form.slug)
      const tenantId = tenantRes.data.id

      const loginRes = await authApi.login({
        tenantId,
        email: form.email,
        password: form.password,
      })

      login({
        token: loginRes.data.token,
        userId: loginRes.data.userId,
        tenantId,
        email: form.email,
      })

      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1.5px solid #e2e8f0',
    fontSize: 14,
    color: '#0f172a',
    background: '#fff',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr', background: '#fff' }}>
      <div style={{ display: 'contents' }}>
        {/* Two column layout on large screens */}
        <div style={{ display: 'flex', minHeight: '100vh' }}>

          {/* Left: Dark brand panel */}
          <div className="lg-panel" style={{ display: 'none', width: '42%', background: '#0f172a', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', position: 'sticky', top: 0, height: '100vh' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                Pay<span style={{ color: '#818cf8' }}>Kit</span>
              </span>
            </Link>

            <div>
              <div style={{ width: 48, height: 4, background: '#4f46e5', borderRadius: 999, marginBottom: 32 }} />
              <blockquote style={{ fontSize: 22, fontWeight: 600, color: '#f8fafc', lineHeight: 1.5, marginBottom: 28 }}>
                "We cleared ₹2.4L in overdue invoices in our first week with PayKit."
              </blockquote>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  RS
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>Rahul Sharma</p>
                  <p style={{ fontSize: 13, color: '#64748b' }}>Founder, DesignStudio</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: '🧾', text: 'Professional PDF invoices in one click' },
                { icon: '💳', text: 'Razorpay payment collection built-in' },
                { icon: '🔒', text: 'AES-256 encrypted customer data' },
              ].map((item) => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{item.text}</span>
                </div>
              ))}
              <p style={{ fontSize: 12, color: '#334155', marginTop: 8 }}>© 2026 PayKit. All rights reserved.</p>
            </div>
          </div>

          {/* Right: Form */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: '#fff' }}>
            <div style={{ width: '100%', maxWidth: 400 }}>

              {/* Mobile logo */}
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    Pay<span style={{ color: '#4f46e5' }}>Kit</span>
                  </span>
                </Link>
              </div>

              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.02em' }}>
                Welcome back
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32 }}>
                Sign in to your workspace to continue.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Workspace slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="your-workspace"
                    required
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                </div>

                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', background: loading ? '#6366f1' : '#4f46e5', color: '#fff', fontWeight: 700, padding: '11px', borderRadius: 8, border: 'none', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(79,70,229,0.3)' }}
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 28 }}>
                Don't have a workspace?{' '}
                <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive style for left panel */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-panel { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
