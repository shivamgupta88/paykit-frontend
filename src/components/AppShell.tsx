import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  {
    to: '/customers',
    label: 'Customers',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6" cy="5" r="2.5" fill="currentColor" opacity="0.9" />
        <path d="M1 13c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
        <circle cx="12" cy="5" r="2" fill="currentColor" opacity="0.5" />
        <path d="M12 10c1.5 0 3 .9 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    to: '/invoices',
    label: 'Invoices',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="1" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        <line x1="5" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <line x1="5" y1="8" x2="9" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="5" y1="11" x2="7" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
    ),
  },
  {
    to: '/payments',
    label: 'Payments',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3.5" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        <line x1="1" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
        <rect x="3" y="9" width="3" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    to: '/wallet',
    label: 'Wallet',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="4" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        <path d="M1 7h13" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        <circle cx="11.5" cy="9.5" r="1" fill="currentColor" opacity="0.9" />
        <path d="M4 2l2-1h4l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
  },
]

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'U'

  const workspaceName = user?.workspaceName || 'Workspace'

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
          Pay<span style={{ color: '#818cf8' }}>Kit</span>
        </span>
        <div style={{ fontSize: 11, color: '#475569', marginTop: 2, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {workspaceName}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
              color: isActive ? '#fff' : '#94a3b8',
              background: isActive ? 'rgba(99,102,241,0.18)' : 'transparent',
              transition: 'all 0.15s ease-in-out',
            })}
            onMouseEnter={e => {
              const el = e.currentTarget
              if (el.getAttribute('aria-current') !== 'page') {
                el.style.background = 'rgba(255,255,255,0.06)'
                el.style.color = '#e2e8f0'
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              if (el.getAttribute('aria-current') !== 'page') {
                el.style.background = 'transparent'
                el.style.color = '#94a3b8'
              }
            }}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email ?? 'User'}
            </p>
            <p style={{ fontSize: 11, color: '#475569' }}>Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Sign out"
          style={{
            width: '100%', marginTop: 4, padding: '7px 12px', borderRadius: 8,
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, color: '#64748b', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
            transition: 'all 0.15s ease-in-out',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 1H2a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M9.5 10L13 7l-3.5-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="13" y1="7" x2="5" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>

      {/* Desktop sidebar */}
      <aside className="sidebar-desktop" style={{
        width: 232,
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 40,
        flexShrink: 0,
      }}>
        <SidebarContent />
      </aside>

      {/* Mobile: overlay sidebar */}
      {sidebarOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 49 }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside style={{
            width: 232, background: '#0f172a',
            display: 'flex', flexDirection: 'column',
            position: 'fixed', top: 0, left: 0, bottom: 0,
            zIndex: 50,
            animation: 'slide-in-left 0.2s ease-out',
          }}>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="main-content" style={{ marginLeft: 232, flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Mobile top bar */}
        <div className="mobile-topbar" style={{ display: 'none', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#0f172a', position: 'sticky', top: 0, zIndex: 30 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Pay<span style={{ color: '#818cf8' }}>Kit</span>
          </span>
        </div>

        <Outlet />
      </main>
    </div>
  )
}
