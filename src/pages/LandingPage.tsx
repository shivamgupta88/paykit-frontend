import { Link } from 'react-router-dom'

const features = [
  {
    icon: '🧾',
    color: 'bg-violet-50',
    title: 'Smart Invoicing',
    desc: 'Create professional invoices with line items, tax calculation, and PDF export in seconds.',
  },
  {
    icon: '💳',
    color: 'bg-blue-50',
    title: 'Payment Collection',
    desc: 'Accept payments via Razorpay. Track every transaction with real-time status updates.',
  },
  {
    icon: '👥',
    color: 'bg-emerald-50',
    title: 'Customer Management',
    desc: 'Manage your client database with billing addresses, GSTIN, and full history.',
  },
  {
    icon: '🏢',
    color: 'bg-orange-50',
    title: 'Multi-Tenant',
    desc: 'Built for teams and agencies. Each workspace is fully isolated and secure.',
  },
  {
    icon: '📊',
    color: 'bg-pink-50',
    title: 'Dashboard Analytics',
    desc: "Get a bird's-eye view of revenue, outstanding invoices, and payment trends.",
  },
  {
    icon: '🔒',
    color: 'bg-indigo-50',
    title: 'Secure by Default',
    desc: 'JWT auth, AES-256 encryption, and rate limiting — security baked in from day one.',
  },
]

const steps = [
  { step: '01', title: 'Create your workspace', desc: 'Set up your tenant and invite your team in under a minute.' },
  { step: '02', title: 'Add your customers', desc: 'Import or add clients with billing details and GSTIN.' },
  { step: '03', title: 'Send invoices', desc: 'Generate professional PDFs and send them instantly.' },
  { step: '04', title: 'Get paid', desc: 'Accept payments and auto-mark invoices as settled.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
            Pay<span style={{ color: '#4f46e5' }}>Kit</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              to="/login"
              style={{ fontSize: 14, color: '#6b7280', fontWeight: 500, padding: '8px 16px', borderRadius: 8, textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              style={{ fontSize: 14, background: '#4f46e5', color: '#fff', fontWeight: 600, padding: '8px 18px', borderRadius: 8, textDecoration: 'none', transition: 'all 0.15s' }}
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 120, paddingBottom: 100, paddingLeft: 24, paddingRight: 24, background: 'linear-gradient(145deg, #fafafe 0%, #f0f0ff 40%, #fff 100%)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', background: '#ede9fe', color: '#5b21b6', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, marginBottom: 24, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Invoice & Payment Platform
          </span>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24 }}>
            Invoice smarter,<br />
            <span style={{ color: '#4f46e5' }}>get paid faster</span>
          </h1>
          <p style={{ fontSize: 18, color: '#64748b', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            PayKit is a multi-tenant invoicing platform built for modern businesses.
            Create invoices, collect payments, and manage clients — all in one place.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <Link
              to="/register"
              style={{ display: 'inline-block', background: '#4f46e5', color: '#fff', fontWeight: 700, padding: '14px 32px', borderRadius: 12, textDecoration: 'none', fontSize: 15, boxShadow: '0 4px 24px rgba(79,70,229,0.3)' }}
            >
              Start for free →
            </Link>
            <Link
              to="/login"
              style={{ display: 'inline-block', background: '#fff', color: '#374151', fontWeight: 600, padding: '14px 32px', borderRadius: 12, textDecoration: 'none', fontSize: 15, border: '1.5px solid #e5e7eb' }}
            >
              Sign in to dashboard
            </Link>
          </div>
        </div>

        {/* Mock UI preview */}
        <div style={{ maxWidth: 720, margin: '64px auto 0', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fca5a5' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fde68a' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#86efac' }} />
            <span style={{ marginLeft: 8, fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>PayKit Dashboard</span>
          </div>
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'Total Revenue', value: '₹4,28,500', change: '+12.5%', up: true },
              { label: 'Invoices Sent', value: '142', change: '+8 this month', up: true },
              { label: 'Outstanding', value: '₹86,200', change: '6 invoices', up: false },
            ].map((s) => (
              <div key={s.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '16px', border: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: s.up ? '#059669' : '#f59e0b', fontWeight: 500 }}>{s.change}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: '0 24px 24px' }}>
            <div style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Recent Invoices</span>
                <span style={{ fontSize: 12, color: '#4f46e5', fontWeight: 500, cursor: 'pointer' }}>View all</span>
              </div>
              {[
                { id: 'INV-042', client: 'Acme Corp', amount: '₹24,000', status: 'PAID', color: '#059669', bg: '#ecfdf5' },
                { id: 'INV-041', client: 'TechStart Inc', amount: '₹18,500', status: 'SENT', color: '#2563eb', bg: '#eff6ff' },
                { id: 'INV-040', client: 'Nova Designs', amount: '₹9,200', status: 'OVERDUE', color: '#dc2626', bg: '#fef2f2' },
              ].map((inv) => (
                <div key={inv.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{inv.id}</span>
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{inv.client}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{inv.amount}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: inv.color, background: inv.bg, padding: '2px 8px', borderRadius: 999 }}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: '#fff', padding: '40px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
          {[
            { value: '₹0 setup', label: 'No upfront cost' },
            { value: '< 1 min', label: 'Invoice creation time' },
            { value: 'AES-256', label: 'Data encryption standard' },
          ].map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center', padding: '0 24px', borderRight: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '96px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 12 }}>
              Everything you need to run billing
            </h2>
            <p style={{ color: '#64748b', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
              No spreadsheets. No chasing clients. Just clean, automated invoicing.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {features.map((f) => (
              <div
                key={f.title}
                style={{ padding: '28px', borderRadius: 16, border: '1px solid #f1f5f9', background: '#fff', transition: 'all 0.2s', cursor: 'default' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#e0e7ff'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(79,70,229,0.08)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#f1f5f9'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: f.color === 'bg-violet-50' ? '#f5f3ff' : f.color === 'bg-blue-50' ? '#eff6ff' : f.color === 'bg-emerald-50' ? '#ecfdf5' : f.color === 'bg-orange-50' ? '#fff7ed' : f.color === 'bg-pink-50' ? '#fdf2f8' : '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '96px 24px', background: '#fafafe' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 12 }}>
              Get started in minutes
            </h2>
            <p style={{ color: '#64748b', fontSize: 17 }}>Four simple steps to your first paid invoice.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {steps.map((s, i) => (
              <div key={s.step} style={{ position: 'relative', background: '#fff', borderRadius: 16, padding: '28px 24px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#4f46e5', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Step {s.step}
                </div>
                <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>{s.desc}</p>
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', top: '50%', right: -12, transform: 'translateY(-50%)', color: '#c7d2fe', fontSize: 18, display: window.innerWidth < 640 ? 'none' : 'block' }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 24px', background: '#0f172a' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 12 }}>
            Ready to simplify your billing?
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: 36, fontSize: 16 }}>
            Join businesses using PayKit to manage invoices and payments effortlessly.
          </p>
          <Link
            to="/register"
            style={{ display: 'inline-block', background: '#4f46e5', color: '#fff', fontWeight: 700, padding: '14px 36px', borderRadius: 12, textDecoration: 'none', fontSize: 15, boxShadow: '0 4px 24px rgba(79,70,229,0.4)' }}
          >
            Create your workspace →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e293b', background: '#0f172a', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#475569' }}>© 2026 PayKit. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link to="/login" style={{ fontSize: 13, color: '#475569', textDecoration: 'none' }}>Sign in</Link>
            <Link to="/register" style={{ fontSize: 13, color: '#475569', textDecoration: 'none' }}>Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
