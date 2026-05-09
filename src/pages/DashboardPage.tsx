import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { invoicesApi, type InvoiceStatus } from '../api/invoices'
import { customersApi } from '../api/customers'

interface Invoice {
  id: string
  invoiceNumber: string
  customer: { id: string; name: string; email: string }
  totalAmount: number
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  currency: string
}

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: 'Draft',     color: '#64748b', bg: '#f1f5f9' },
  SENT:      { label: 'Sent',      color: '#2563eb', bg: '#eff6ff' },
  PAID:      { label: 'Paid',      color: '#059669', bg: '#ecfdf5' },
  OVERDUE:   { label: 'Overdue',   color: '#dc2626', bg: '#fef2f2' },
  CANCELLED: { label: 'Cancelled', color: '#9ca3af', bg: '#f9fafb' },
}

function fmt(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

function Skeleton({ w, h, radius = 6 }: { w: number | string; h: number; radius?: number }) {
  return <div style={{ width: w, height: h, borderRadius: radius, background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '400% 100%', animation: 'shimmer 1.5s infinite' }} />
}

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [customerCount, setCustomerCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [invRes, custRes] = await Promise.all([
          invoicesApi.list(undefined, 0, 100),
          customersApi.list(0, 1),
        ])
        setInvoices(invRes.data.content ?? invRes.data ?? [])
        const custTotal = custRes.data.totalElements ?? custRes.data.length ?? 0
        setCustomerCount(custTotal)
      } catch {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Compute stats from invoices
  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.totalAmount, 0)
  const outstanding = invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').reduce((s, i) => s + i.totalAmount, 0)
  const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length
  const recentInvoices = [...invoices].sort((a, b) => b.issueDate.localeCompare(a.issueDate)).slice(0, 8)

  const stats = [
    {
      label: 'Total Revenue',
      value: loading ? null : fmt(totalRevenue),
      sub: `${invoices.filter(i => i.status === 'PAID').length} paid invoices`,
      icon: '₹',
      accent: '#059669',
      accentBg: '#ecfdf5',
    },
    {
      label: 'Total Invoices',
      value: loading ? null : String(invoices.length),
      sub: `${invoices.filter(i => i.status === 'DRAFT').length} drafts`,
      icon: '#',
      accent: '#4f46e5',
      accentBg: '#eef2ff',
    },
    {
      label: 'Outstanding',
      value: loading ? null : fmt(outstanding),
      sub: overdueCount > 0 ? `${overdueCount} overdue` : 'All on time',
      icon: '!',
      accent: overdueCount > 0 ? '#dc2626' : '#f59e0b',
      accentBg: overdueCount > 0 ? '#fef2f2' : '#fffbeb',
    },
    {
      label: 'Customers',
      value: loading ? null : String(customerCount ?? '—'),
      sub: 'in your workspace',
      icon: 'U',
      accent: '#0891b2',
      accentBg: '#ecfeff',
    },
  ]

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div style={{ padding: '32px 36px', minHeight: '100vh', background: '#f8fafc' }}>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 100% 0 }
          100% { background-position: -100% 0 }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>
            {greeting()} 👋
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          to="/invoices/new"
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#4f46e5', color: '#fff', fontWeight: 700, padding: '9px 18px', borderRadius: 8, textDecoration: 'none', fontSize: 13, boxShadow: '0 1px 3px rgba(79,70,229,0.3)' }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <line x1="6.5" y1="1" x2="6.5" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="1" y1="6.5" x2="12" y2="6.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Invoice
        </Link>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#dc2626', marginBottom: 24 }}>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {s.label}
              </span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: s.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: s.accent }}>
                {s.icon}
              </div>
            </div>
            {s.value === null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Skeleton w="60%" h={24} />
                <Skeleton w="45%" h={12} />
              </div>
            ) : (
              <>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.sub}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Recent invoices */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Recent Invoices</h2>
          <Link to="/invoices" style={{ fontSize: 12, color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
            View all →
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '22px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: i < 5 ? '1px solid #f8fafc' : 'none' }}>
                <Skeleton w={70} h={14} />
                <Skeleton w={120} h={14} />
                <Skeleton w="30%" h={14} />
                <Skeleton w={60} h={22} radius={999} />
                <Skeleton w={80} h={14} />
              </div>
            ))}
          </div>
        ) : recentInvoices.length === 0 ? (
          <div style={{ padding: '60px 22px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🧾</div>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>No invoices yet</p>
            <Link to="/invoices/new" style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
              Create your first invoice →
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Invoice', 'Customer', 'Amount', 'Status', 'Due Date'].map((h) => (
                  <th key={h} style={{ padding: '10px 22px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((inv, idx) => {
                const cfg = statusConfig[inv.status]
                return (
                  <tr
                    key={inv.id}
                    style={{ borderBottom: idx < recentInvoices.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => window.location.href = `/invoices/${inv.id}`}
                  >
                    <td style={{ padding: '13px 22px', fontSize: 13, fontWeight: 600, color: '#4f46e5', fontFamily: 'monospace' }}>
                      {inv.invoiceNumber}
                    </td>
                    <td style={{ padding: '13px 22px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{inv.customer?.name ?? '—'}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{inv.customer?.email ?? ''}</div>
                    </td>
                    <td style={{ padding: '13px 22px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {fmt(inv.totalAmount, inv.currency)}
                    </td>
                    <td style={{ padding: '13px 22px' }}>
                      <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '3px 10px', borderRadius: 999, letterSpacing: '0.03em' }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '13px 22px', fontSize: 12, color: inv.status === 'OVERDUE' ? '#dc2626' : '#64748b', fontWeight: inv.status === 'OVERDUE' ? 600 : 400 }}>
                      {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
