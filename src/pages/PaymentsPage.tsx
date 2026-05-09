import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { invoicesApi, type InvoiceStatus } from '../api/invoices'
import { paymentsApi } from '../api/payments'

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

interface Payment {
  id: string
  razorpayOrderId: string
  razorpayPaymentId?: string
  status: string
  amount: number
  currency: string
  createdAt: string
}

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: 'Draft',     color: '#64748b', bg: '#f1f5f9' },
  SENT:      { label: 'Sent',      color: '#2563eb', bg: '#eff6ff' },
  PAID:      { label: 'Paid',      color: '#059669', bg: '#ecfdf5' },
  OVERDUE:   { label: 'Overdue',   color: '#dc2626', bg: '#fef2f2' },
  CANCELLED: { label: 'Cancelled', color: '#9ca3af', bg: '#f9fafb' },
}

function fmt(n: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

function Skeleton({ w, h, radius = 6 }: { w: number | string; h: number; radius?: number }) {
  return <div style={{ width: w, height: h, borderRadius: radius, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '400% 100%', animation: 'shimmer 1.5s infinite' }} />
}

// Load Razorpay script once
function useRazorpay(onError: () => void) {
  const loaded = useRef(false)
  useEffect(() => {
    if (loaded.current || document.querySelector('script[src*="razorpay"]')) {
      loaded.current = true
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => { loaded.current = true }
    script.onerror = () => { onError() }
    document.body.appendChild(script)
  }, [])
}

export default function PaymentsPage() {
  const [rzpLoadError, setRzpLoadError] = useState(false)
  useRazorpay(() => setRzpLoadError(true))

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [initiating, setInitiating] = useState<string | null>(null) // invoiceId
  const [payments, setPayments] = useState<Record<string, Payment[]>>({}) // invoiceId → payments
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [payError, setPayError] = useState('')

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const res = await invoicesApi.list(undefined, 0, 200)
      const all: Invoice[] = res.data.content ?? res.data ?? []
      // Only show invoices that are SENT, OVERDUE, or PAID
      setInvoices(all.filter(i => ['SENT', 'OVERDUE', 'PAID'].includes(i.status)))
    } catch {
      setError('Failed to load payment data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadInvoices() }, [])

  const loadPaymentsForInvoice = async (invoiceId: string) => {
    if (payments[invoiceId]) return // already loaded
    try {
      const res = await paymentsApi.listByInvoice(invoiceId)
      setPayments(prev => ({ ...prev, [invoiceId]: res.data ?? [] }))
    } catch {
      setPayments(prev => ({ ...prev, [invoiceId]: [] }))
    }
  }

  const toggleExpand = (invoiceId: string) => {
    if (expandedId === invoiceId) {
      setExpandedId(null)
    } else {
      setExpandedId(invoiceId)
      loadPaymentsForInvoice(invoiceId)
    }
  }

  const handleCollectPayment = async (invoice: Invoice) => {
    setPayError('')
    setInitiating(invoice.id)
    try {
      const res = await paymentsApi.initiate(invoice.id)
      const { razorpayOrderId, amount, currency, keyId } = res.data

      const Razorpay = (window as any).Razorpay
      if (!Razorpay) {
        setPayError('Razorpay failed to load. Please refresh and try again.')
        return
      }

      const rzp = new Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: 'PayKit',
        description: `Payment for ${invoice.invoiceNumber}`,
        prefill: {
          email: invoice.customer?.email,
        },
        theme: { color: '#4f46e5' },
        handler: async (response: any) => {
          try {
            await paymentsApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            await loadInvoices()
          } catch {
            setPayError('Payment verification failed. Contact support.')
          }
        },
      })
      rzp.open()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setPayError(msg || 'Failed to initiate payment.')
    } finally {
      setInitiating(null)
    }
  }

  const sentAndOverdue = invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE')
  const paid = invoices.filter(i => i.status === 'PAID')

  const totalCollected = paid.reduce((s, i) => s + i.totalAmount, 0)
  const totalPending = sentAndOverdue.reduce((s, i) => s + i.totalAmount, 0)

  return (
    <div style={{ padding: '32px 36px', minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`@keyframes shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>Payments</h1>
        <p style={{ fontSize: 13, color: '#94a3b8' }}>Collect payments via Razorpay and track all transactions</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Collected', value: loading ? null : fmt(totalCollected), sub: `${paid.length} paid invoices`, color: '#059669', bg: '#ecfdf5', icon: '✓' },
          { label: 'Pending Collection', value: loading ? null : fmt(totalPending), sub: `${sentAndOverdue.length} awaiting payment`, color: '#f59e0b', bg: '#fffbeb', icon: '○' },
          { label: 'Overdue', value: loading ? null : fmt(invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.totalAmount, 0)), sub: `${invoices.filter(i => i.status === 'OVERDUE').length} overdue invoices`, color: '#dc2626', bg: '#fef2f2', icon: '!' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.label}</span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: s.color }}>{s.icon}</div>
            </div>
            {s.value === null
              ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><Skeleton w="60%" h={24} /><Skeleton w="45%" h={12} /></div>
              : <><div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>{s.value}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{s.sub}</div></>
            }
          </div>
        ))}
      </div>

      {rzpLoadError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '11px 16px', fontSize: 13, color: '#dc2626', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span>Razorpay failed to load — payment collection unavailable. Check your internet connection.</span>
          <button
            onClick={() => { setRzpLoadError(false); window.location.reload() }}
            style={{ padding: '5px 12px', borderRadius: 6, border: '1.5px solid #dc2626', background: 'transparent', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
          >
            Retry
          </button>
        </div>
      )}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '11px 16px', fontSize: 13, color: '#dc2626', marginBottom: 20 }}>{error}</div>
      )}
      {payError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '11px 16px', fontSize: 13, color: '#dc2626', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span>{payError}</span>
          <button
            onClick={() => setPayError('')}
            style={{ padding: '3px 8px', borderRadius: 5, border: 'none', background: 'transparent', color: '#dc2626', fontSize: 16, cursor: 'pointer', lineHeight: 1 }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Pending payments */}
      {(loading || sentAndOverdue.length > 0) && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Awaiting Payment</h2>
          </div>
          {loading ? (
            <div style={{ padding: '20px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: i < 3 ? '1px solid #f8fafc' : 'none' }}>
                  <Skeleton w={80} h={13} /><Skeleton w={140} h={13} /><Skeleton w="20%" h={13} /><Skeleton w={70} h={22} radius={999} /><Skeleton w={120} h={32} radius={8} />
                </div>
              ))}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Invoice', 'Customer', 'Amount', 'Status', 'Due Date', ''].map((h, i) => (
                    <th key={i} style={{ padding: '9px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sentAndOverdue.map((inv, idx) => {
                  const cfg = statusConfig[inv.status]
                  return (
                    <tr key={inv.id} style={{ borderBottom: idx < sentAndOverdue.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                      <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 700, color: '#4f46e5', fontFamily: 'monospace' }}>
                        <Link to={`/invoices/${inv.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{inv.invoiceNumber}</Link>
                      </td>
                      <td style={{ padding: '13px 20px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{inv.customer?.name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{inv.customer?.email}</div>
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{fmt(inv.totalAmount, inv.currency)}</td>
                      <td style={{ padding: '13px 20px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '3px 10px', borderRadius: 999 }}>{cfg.label}</span>
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: 12, color: inv.status === 'OVERDUE' ? '#dc2626' : '#64748b', fontWeight: inv.status === 'OVERDUE' ? 600 : 400 }}>
                        {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '13px 20px' }}>
                        <button
                          onClick={() => handleCollectPayment(inv)}
                          disabled={initiating === inv.id}
                          style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: '#4f46e5', color: '#fff', fontSize: 12, fontWeight: 700, cursor: initiating === inv.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: initiating === inv.id ? 0.7 : 1, whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(79,70,229,0.25)' }}
                        >
                          {initiating === inv.id ? 'Opening…' : 'Collect Payment'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Paid invoices */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} />
          <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Payment History</h2>
        </div>

        {loading ? (
          <div style={{ padding: '20px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: i < 3 ? '1px solid #f8fafc' : 'none' }}>
                <Skeleton w={80} h={13} /><Skeleton w={140} h={13} /><Skeleton w="20%" h={13} /><Skeleton w={60} h={22} radius={999} /><Skeleton w={80} h={13} />
              </div>
            ))}
          </div>
        ) : paid.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>💳</div>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>No payments collected yet</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Invoice', 'Customer', 'Amount', 'Status', 'Paid On', ''].map((h, i) => (
                  <th key={i} style={{ padding: '9px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paid.map((inv, idx) => (
                <>
                  <tr
                    key={inv.id}
                    style={{ borderBottom: expandedId === inv.id ? 'none' : idx < paid.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => toggleExpand(inv.id)}
                  >
                    <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 700, color: '#4f46e5', fontFamily: 'monospace' }}>
                      <Link to={`/invoices/${inv.id}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>{inv.invoiceNumber}</Link>
                    </td>
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{inv.customer?.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{inv.customer?.email}</div>
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 700, color: '#059669' }}>{fmt(inv.totalAmount, inv.currency)}</td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '3px 10px', borderRadius: 999 }}>Paid</span>
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: 12, color: '#64748b' }}>
                      {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{expandedId === inv.id ? '▲' : '▼'}</span>
                    </td>
                  </tr>
                  {expandedId === inv.id && (
                    <tr key={`${inv.id}-detail`}>
                      <td colSpan={6} style={{ padding: '0 20px 16px', background: '#f8fafc', borderBottom: idx < paid.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                          {!payments[inv.id] ? (
                            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <Skeleton w="100%" h={13} /><Skeleton w="70%" h={13} />
                            </div>
                          ) : payments[inv.id].length === 0 ? (
                            <div style={{ padding: '16px', fontSize: 13, color: '#94a3b8' }}>No payment records found.</div>
                          ) : (
                            payments[inv.id].map((p, pi) => (
                              <div key={p.id} style={{ padding: '12px 16px', borderBottom: pi < payments[inv.id].length - 1 ? '1px solid #f8fafc' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Payment ID: <span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>{p.razorpayPaymentId || '—'}</span></span>
                                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Order: <span style={{ fontFamily: 'monospace' }}>{p.razorpayOrderId}</span></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>{fmt(p.amount / 100, p.currency)}</span>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 999 }}>{p.status}</span>
                                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
