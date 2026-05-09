import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { invoicesApi, type InvoiceStatus } from '../api/invoices'
import { useToast } from '../context/ToastContext'

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

const tabs: { label: string; value: InvoiceStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

function fmt(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

function Skeleton({ w, h, radius = 6 }: { w: number | string; h: number; radius?: number }) {
  return <div style={{ width: w, height: h, borderRadius: radius, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '400% 100%', animation: 'shimmer 1.5s infinite' }} />
}

function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [headers, ...rows]
    .map(r => r.map(cell => `"${(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function InvoicesPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<InvoiceStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setLoading(true)
      try {
        const res = await invoicesApi.list(undefined, 0, 200)
        if (!controller.signal.aborted) {
          setInvoices(res.data.content ?? res.data ?? [])
        }
      } catch {
        if (!controller.signal.aborted) {
          setError('Failed to load invoices.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }
    load()
    return () => controller.abort()
  }, [])

  const byStatus = activeTab === 'ALL'
    ? invoices
    : invoices.filter(i => i.status === activeTab)

  const filtered = search.trim()
    ? byStatus.filter(i =>
        i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        i.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        i.customer?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : byStatus

  const counts: Record<string, number> = { ALL: invoices.length }
  tabs.slice(1).forEach(t => {
    counts[t.value] = invoices.filter(i => i.status === t.value).length
  })

  const handleExportCSV = () => {
    const rows = filtered.map(i => [
      i.invoiceNumber,
      i.customer?.name ?? '',
      i.customer?.email ?? '',
      String(i.totalAmount),
      i.currency,
      i.status,
      i.issueDate,
      i.dueDate,
    ])
    exportCSV(
      `invoices-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Invoice #', 'Customer', 'Email', 'Amount', 'Currency', 'Status', 'Issue Date', 'Due Date'],
      rows
    )
    toast('Invoices exported to CSV')
  }

  return (
    <div style={{ padding: '32px 36px', minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`@keyframes shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>Invoices</h1>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>
            {loading ? 'Loading…' : `${invoices.length} invoice${invoices.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {invoices.length > 0 && (
            <button
              onClick={handleExportCSV}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v7M4 5.5l2.5 2.5L9 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1 10v1a1 1 0 001 1h9a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Export CSV
            </button>
          )}
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
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '11px 16px', fontSize: 13, color: '#dc2626', marginBottom: 20 }}>{error}</div>
      )}

      {/* Search + Tabs row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '0 0 280px' }}>
          <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="#94a3b8" strokeWidth="1.4" />
            <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search invoices…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '7px 12px 7px 32px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s' }}
            onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 2, background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
          {tabs.map(t => {
            const isActive = activeTab === t.value
            return (
              <button
                key={t.value}
                onClick={() => setActiveTab(t.value)}
                style={{
                  padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s',
                  background: isActive ? '#fff' : 'transparent',
                  color: isActive ? '#0f172a' : '#94a3b8',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {t.label}
                {counts[t.value] > 0 && (
                  <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 800, background: isActive ? '#f1f5f9' : 'transparent', color: isActive ? '#64748b' : '#cbd5e1', padding: '1px 6px', borderRadius: 999 }}>
                    {counts[t.value]}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '20px 22px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: i < 5 ? '1px solid #f8fafc' : 'none' }}>
                <Skeleton w={80} h={13} />
                <Skeleton w={140} h={13} />
                <Skeleton w="20%" h={13} />
                <Skeleton w={70} h={22} radius={999} />
                <Skeleton w={90} h={13} />
                <Skeleton w={60} h={28} radius={8} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px 22px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🧾</div>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
              {search ? `No invoices match "${search}"` : activeTab === 'ALL' ? 'No invoices yet' : `No ${activeTab.toLowerCase()} invoices`}
            </p>
            {activeTab === 'ALL' && !search && (
              <Link to="/invoices/new" style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
                Create your first invoice →
              </Link>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Invoice', 'Customer', 'Amount', 'Status', 'Issue Date', 'Due Date', ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, idx) => {
                const cfg = statusConfig[inv.status]
                const isLast = idx === filtered.length - 1
                return (
                  <tr
                    key={inv.id}
                    style={{ borderBottom: isLast ? 'none' : '1px solid #f8fafc', transition: 'background 0.1s', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                  >
                    <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 700, color: '#4f46e5', fontFamily: 'monospace' }}>
                      {inv.invoiceNumber}
                    </td>
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{inv.customer?.name ?? '—'}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{inv.customer?.email ?? ''}</div>
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {fmt(inv.totalAmount, inv.currency)}
                    </td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '3px 10px', borderRadius: 999 }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(inv.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: 12, color: inv.status === 'OVERDUE' ? '#dc2626' : '#64748b', fontWeight: inv.status === 'OVERDUE' ? 600 : 400, whiteSpace: 'nowrap' }}>
                      {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '13px 20px' }} onClick={e => e.stopPropagation()}>
                      <Link
                        to={`/invoices/${inv.id}`}
                        style={{ padding: '5px 12px', borderRadius: 6, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 12, fontWeight: 600, color: '#374151', textDecoration: 'none', display: 'inline-block', transition: 'all 0.15s' }}
                      >
                        View
                      </Link>
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
