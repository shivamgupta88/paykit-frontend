import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'

type Step = 'workspace' | 'account'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState<Step>('workspace')
  const [tenantId, setTenantId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [workspace, setWorkspace] = useState({ name: '', slug: '', contactEmail: '' })
  const [account, setAccount] = useState({ fullName: '', email: '', password: '' })

  const handleWorkspaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setWorkspace((prev) => ({
      ...prev,
      [name]: name === 'slug' ? value.toLowerCase().replace(/[^a-z0-9-]/g, '-') : value,
    }))
  }

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccount((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleWorkspaceSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.createTenant(workspace)
      setTenantId(res.data.id)
      setStep('account')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not create workspace. Slug may be taken.')
    } finally {
      setLoading(false)
    }
  }

  const handleAccountSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.register({ tenantId, ...account })
      const loginRes = await authApi.login({ tenantId, email: account.email, password: account.password })
      login({ token: loginRes.data.token, userId: loginRes.data.userId, tenantId, email: account.email })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.')
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

  const steps = [
    { key: 'workspace', label: 'Workspace', num: 1 },
    { key: 'account', label: 'Account', num: 2 },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#fff' }}>

      {/* Left: Dark brand panel */}
      <div
        className="lg-panel"
        style={{ display: 'none', width: '42%', background: '#0f172a', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', position: 'sticky', top: 0, height: '100vh' }}
        ref={(el) => {
          if (el) el.style.display = window.innerWidth >= 1024 ? 'flex' : 'none'
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Pay<span style={{ color: '#818cf8' }}>Kit</span>
          </span>
        </Link>

        <div>
          <div style={{ width: 48, height: 4, background: '#4f46e5', borderRadius: 999, marginBottom: 32 }} />
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#f8fafc', lineHeight: 1.4, marginBottom: 36 }}>
            Your business billing,<br />
            <span style={{ color: '#818cf8' }}>finally under control.</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { step: '01', title: 'Create your workspace', desc: 'Isolated, secure billing environment for your team.' },
              { step: '02', title: 'Add customers & invoices', desc: 'Professional PDFs sent in under a minute.' },
              { step: '03', title: 'Collect payments', desc: 'Razorpay built-in. Auto-track everything.' },
            ].map((item) => (
              <div key={item.step} style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#4f46e5', letterSpacing: '0.08em', paddingTop: 2, flexShrink: 0 }}>
                  {item.step}
                </span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 2 }}>{item.title}</p>
                  <p style={{ fontSize: 13, color: '#64748b' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#334155' }}>© 2026 PayKit. All rights reserved.</p>
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

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            {steps.map((s, i) => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                  background: step === s.key ? '#4f46e5' : (s.key === 'account' && step === 'account') ? '#4f46e5' : s.key === 'workspace' && step === 'account' ? '#ecfdf5' : '#f1f5f9',
                  color: step === s.key ? '#fff' : s.key === 'workspace' && step === 'account' ? '#059669' : '#94a3b8',
                  border: step === s.key ? 'none' : '1.5px solid #e2e8f0',
                }}>
                  {s.key === 'workspace' && step === 'account' ? '✓' : s.num}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: step === s.key ? '#0f172a' : '#94a3b8' }}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 1.5, background: step === 'account' ? '#4f46e5' : '#e2e8f0', borderRadius: 999 }} />
                )}
              </div>
            ))}
          </div>

          {step === 'workspace' ? (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.02em' }}>
                Create your workspace
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>
                Your workspace is your isolated billing environment.
              </p>
              <form onSubmit={handleWorkspaceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Workspace name</label>
                  <input
                    type="text" name="name" value={workspace.name}
                    onChange={handleWorkspaceChange} placeholder="Acme Corp" required
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Workspace slug</label>
                  <div style={{ display: 'flex', border: '1.5px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                    onFocusCapture={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#4f46e5'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)' }}
                    onBlurCapture={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
                  >
                    <span style={{ padding: '10px 12px', background: '#f8fafc', fontSize: 13, color: '#94a3b8', borderRight: '1.5px solid #e2e8f0', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                      app/
                    </span>
                    <input
                      type="text" name="slug" value={workspace.slug}
                      onChange={handleWorkspaceChange} placeholder="acme-corp" required
                      style={{ flex: 1, padding: '10px 12px', fontSize: 14, color: '#0f172a', background: '#fff', border: 'none', outline: 'none', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Contact email</label>
                  <input
                    type="email" name="contactEmail" value={workspace.contactEmail}
                    onChange={handleWorkspaceChange} placeholder="billing@acme.com" required
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                </div>

                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>{error}</div>
                )}

                <button type="submit" disabled={loading}
                  style={{ width: '100%', background: '#4f46e5', color: '#fff', fontWeight: 700, padding: '11px', borderRadius: 8, border: 'none', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(79,70,229,0.3)', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Creating workspace…' : 'Continue →'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.02em' }}>
                Create your account
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>
                You'll be the admin of <strong style={{ color: '#4f46e5' }}>/{workspace.slug}</strong>
              </p>
              <form onSubmit={handleAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Full name</label>
                  <input
                    type="text" name="fullName" value={account.fullName}
                    onChange={handleAccountChange} placeholder="John Doe" required
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email address</label>
                  <input
                    type="email" name="email" value={account.email}
                    onChange={handleAccountChange} placeholder="you@example.com" required
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <input
                    type="password" name="password" value={account.password}
                    onChange={handleAccountChange} placeholder="Min. 8 characters" required minLength={8}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                </div>

                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>{error}</div>
                )}

                <button type="submit" disabled={loading}
                  style={{ width: '100%', background: '#4f46e5', color: '#fff', fontWeight: 700, padding: '11px', borderRadius: 8, border: 'none', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(79,70,229,0.3)', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Creating account…' : 'Create account'}
                </button>

                <button type="button" onClick={() => { setStep('workspace'); setError('') }}
                  style={{ width: '100%', background: 'none', border: 'none', fontSize: 13, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', padding: '4px' }}>
                  ← Back to workspace setup
                </button>
              </form>
            </>
          )}

          <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 32 }}>
            Already have a workspace?{' '}
            <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-panel { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
