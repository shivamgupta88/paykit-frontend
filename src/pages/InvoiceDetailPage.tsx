import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { invoicesApi, type InvoiceStatus } from '../api/invoices'
import { useToast } from '../context/ToastContext'

interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  amount: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  currency: string
  notes?: string
  subtotalAmount: number
  taxAmount: number
  totalAmount: number
  customer: { id: string; name: string; email: string; phone?: string; billingAddress?: string; gstin?: string }
  items: LineItem[]
  createdAt: string
}

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:     { label: 'Draft',     color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
  SENT:      { label: 'Sent',      color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  PAID:      { label: 'Paid',      color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  OVERDUE:   { label: 'Overdue',   color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  CANCELLED: { label: 'Cancelled', color: '#9ca3af', bg: '#f9fafb', border: '#e5e7eb' },
}

// What transitions are allowed from each status
const transitions: Record<InvoiceStatus, { to: InvoiceStatus; label: string; color: string; bg: string; destructive?: boolean }[]> = {
  DRAFT:     [{ to: 'SENT', label: 'Mark as Sent', color: '#2563eb', bg: '#eff6ff' }, { to: 'CANCELLED', label: 'Cancel Invoice', color: '#dc2626', bg: '#fef2f2', destructive: true }],
  SENT:      [{ to: 'PAID', label: 'Mark as Paid', color: '#059669', bg: '#ecfdf5' }, { to: 'CANCELLED', label: 'Cancel Invoice', color: '#dc2626', bg: '#fef2f2', destructive: true }],
  OVERDUE:   [{ to: 'SENT', label: 'Mark as Sent', color: '#2563eb', bg: '#eff6ff' }, { to: 'PAID', label: 'Mark as Paid', color: '#059669', bg: '#ecfdf5' }, { to: 'CANCELLED', label: 'Cancel Invoice', color: '#dc2626', bg: '#fef2f2', destructive: true }],
  PAID:      [],
  CANCELLED: [],
}

function fmt(n: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n)
}

function SkeletonBlock({ h, w = '100%' }: { h: number; w?: string | number }) {
  return <div style={{ height: h, width: w, borderRadius: 6, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '400% 100%', animation: 'shimmer 1.5s infinite' }} />
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<InvoiceStatus | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const load = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await invoicesApi.getById(id)
      setInvoice(res.data)
    } catch {
      setError('Invoice not found.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleStatusUpdate = async (newStatus: InvoiceStatus) => {
    if (!id) return
    setConfirmCancel(false)
    setUpdating(newStatus)
    try {
      await invoicesApi.updateStatus(id, newStatus)
      const labels: Record<InvoiceStatus, string> = {
        SENT: 'Invoice marked as sent',
        PAID: 'Invoice marked as paid',
        CANCELLED: 'Invoice cancelled',
        DRAFT: 'Invoice moved to draft',
        OVERDUE: 'Invoice marked overdue',
      }
      toast(labels[newStatus] || 'Status updated')
      await load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Failed to update status.')
    } finally {
      setUpdating(null)
    }
  }

  const handlePdfDownload = async () => {
    if (!id || !invoice) return
    setPdfLoading(true)
    let url: string | null = null
    try {
      const res = await invoicesApi.downloadPdf(id)
      url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.invoiceNumber}.pdf`
      a.click()
      toast('PDF downloaded')
    } catch {
      setError('Failed to download PDF. Please try again.')
    } finally {
      if (url) URL.revokeObjectURL(url)
      setPdfLoading(false)
    }
  }

  const cfg = invoice ? statusConfig[invoice.status] : null
  const availableTransitions = invoice ? transitions[invoice.status] : []

  // Not found state
  if (!loading && !invoice) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 36px' }}>
          <Link to="/invoices" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500, width: 'fit-content' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back to Invoices
          </Link>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ fontSize: 40 }}>🧾</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Invoice not found</h2>
          <p style={{ fontSize: 14, color: '#94a3b8' }}>This invoice may have been deleted or you don't have access.</p>
          <Link to="/invoices" style={{ marginTop: 8, fontSize: 13, color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>← Back to invoices</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`@keyframes shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}`}</style>

      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/invoices" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Invoices
          </Link>
          <span style={{ color: '#e2e8f0' }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
            {loading ? '…' : invoice?.invoiceNumber}
          </span>
          {cfg && (
            <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '2px 10px', borderRadius: 999 }}>
              {cfg.label}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={handlePdfDownload}
            disabled={pdfLoading || loading || !invoice}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: pdfLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: pdfLoading ? 0.6 : 1, transition: 'all 0.15s' }}
            onMouseEnter={e => { if (!pdfLoading) { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5' } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 10v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {pdfLoading ? 'Downloading…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ margin: '24px 36px 0', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '11px 16px', fontSize: 13, color: '#dc2626' }}>{error}</div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 36px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>

        {/* Left: Invoice document */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>

          {/* Invoice header */}
          <div style={{ padding: '32px 36px 28px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>
                  Pay<span style={{ color: '#4f46e5' }}>Kit</span>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Invoice & Payment Platform</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <SkeletonBlock h={24} w={160} />
                    <SkeletonBlock h={14} w={100} />
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontFamily: 'monospace' }}>
                      {invoice?.invoiceNumber}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                      Issued {new Date(invoice?.issueDate ?? '').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* From / Bill To */}
          <div style={{ padding: '28px 36px', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>From</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Your Workspace</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>via PayKit</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Bill To</div>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <SkeletonBlock h={16} w="70%" />
                  <SkeletonBlock h={13} w="55%" />
                  <SkeletonBlock h={13} w="80%" />
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{invoice?.customer?.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>{invoice?.customer?.email}</div>
                  {invoice?.customer?.phone && <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>{invoice.customer.phone}</div>}
                  {invoice?.customer?.billingAddress && <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginTop: 4 }}>{invoice.customer.billingAddress}</div>}
                  {invoice?.customer?.gstin && (
                    <div style={{ marginTop: 6 }}>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4 }}>GST: {invoice.customer.gstin}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Dates */}
          <div style={{ padding: '20px 36px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 48 }}>
            {loading ? (
              <>
                <SkeletonBlock h={40} w={120} />
                <SkeletonBlock h={40} w={120} />
                <SkeletonBlock h={40} w={80} />
              </>
            ) : (
              <>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Issue Date</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    {new Date(invoice?.issueDate ?? '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Due Date</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: invoice?.status === 'OVERDUE' ? '#dc2626' : '#0f172a' }}>
                    {new Date(invoice?.dueDate ?? '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Currency</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{invoice?.currency}</div>
                </div>
              </>
            )}
          </div>

          {/* Line items */}
          <div style={{ padding: '0 36px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '24px 0' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  {['Description', 'Qty', 'Unit Price', 'Tax', 'Amount'].map((h, i) => (
                    <th key={h} style={{ padding: '8px 0', textAlign: i === 0 ? 'left' : 'right', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', paddingBottom: 10 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                      {[1, 2, 3, 4, 5].map(j => (
                        <td key={j} style={{ padding: '14px 0' }}>
                          <SkeletonBlock h={13} w={j === 1 ? '80%' : '60%'} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  invoice?.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '13px 0', fontSize: 13, color: '#0f172a', fontWeight: 500 }}>{item.description}</td>
                      <td style={{ padding: '13px 0', fontSize: 13, color: '#64748b', textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ padding: '13px 0', fontSize: 13, color: '#64748b', textAlign: 'right' }}>{fmt(item.unitPrice, invoice.currency)}</td>
                      <td style={{ padding: '13px 0', fontSize: 13, color: '#64748b', textAlign: 'right' }}>{item.taxRate}%</td>
                      <td style={{ padding: '13px 0', fontSize: 13, color: '#0f172a', fontWeight: 600, textAlign: 'right' }}>{fmt(item.amount, invoice.currency)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ padding: '0 36px 28px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 280 }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <SkeletonBlock h={14} />
                  <SkeletonBlock h={14} />
                  <SkeletonBlock h={20} />
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{fmt(invoice?.subtotalAmount ?? 0, invoice?.currency)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                    <span>Tax</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{fmt(invoice?.taxAmount ?? 0, invoice?.currency)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', marginTop: 8, background: '#0f172a', borderRadius: 10, fontSize: 15 }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>Total</span>
                    <span style={{ fontWeight: 800, color: '#fff' }}>{fmt(invoice?.totalAmount ?? 0, invoice?.currency)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          {(loading || invoice?.notes) && (
            <div style={{ padding: '20px 36px 28px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Notes</div>
              {loading ? <SkeletonBlock h={40} /> : (
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{invoice?.notes}</p>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: '16px 36px', borderTop: '1px solid #f8fafc', background: '#f8fafc', textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: '#cbd5e1', fontStyle: 'italic' }}>Generated by PayKit</span>
          </div>
        </div>

        {/* Right: Actions sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 72 }}>

          {/* Status card */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Status</div>
              {loading ? <SkeletonBlock h={28} /> : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg?.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: cfg?.color }}>{cfg?.label}</span>
                </div>
              )}
            </div>

            {/* Transitions */}
            {!loading && availableTransitions.length > 0 && (
              <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Actions</div>
                {availableTransitions.map(t => (
                  <button
                    key={t.to}
                    onClick={() => t.destructive ? setConfirmCancel(true) : handleStatusUpdate(t.to)}
                    disabled={!!updating}
                    style={{ width: '100%', padding: '9px 14px', borderRadius: 8, border: `1.5px solid ${t.color}22`, background: t.bg, fontSize: 13, fontWeight: 700, color: t.color, cursor: updating ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: updating ? 0.6 : 1, transition: 'all 0.15s ease-in-out', textAlign: 'left' }}
                  >
                    {updating === t.to ? 'Updating…' : t.label}
                  </button>
                ))}
              </div>
            )}

            {!loading && availableTransitions.length === 0 && (
              <div style={{ padding: '14px 18px' }}>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>
                  {invoice?.status === 'PAID' ? 'This invoice has been settled.' : 'This invoice has been cancelled.'}
                </p>
              </div>
            )}
          </div>

          {/* Invoice metadata */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Details</div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1, 2, 3].map(i => <SkeletonBlock key={i} h={13} />)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Invoice No.', value: invoice?.invoiceNumber, mono: true },
                  { label: 'Customer', value: invoice?.customer?.name },
                  { label: 'Items', value: `${invoice?.items?.length} line item${invoice?.items?.length !== 1 ? 's' : ''}` },
                  { label: 'Currency', value: invoice?.currency },
                  { label: 'Created', value: invoice?.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', textAlign: 'right', fontFamily: row.mono ? 'monospace' : 'inherit' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PDF download */}
          <button
            onClick={handlePdfDownload}
            disabled={pdfLoading || loading || !invoice}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 700, color: '#374151', cursor: pdfLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: pdfLoading || !invoice ? 0.6 : 1, transition: 'all 0.15s' }}
            onMouseEnter={e => { if (!pdfLoading && invoice) { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.background = '#eef2ff' } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#fff' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 10v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {pdfLoading ? 'Downloading…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Cancel confirmation modal */}
      {confirmCancel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)' }} onClick={() => setConfirmCancel(false)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400, margin: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', padding: '28px 24px' }}>
            <div style={{ fontSize: 32, marginBottom: 12, textAlign: 'center' }}>⚠️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8, textAlign: 'center' }}>Cancel this invoice?</h3>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, textAlign: 'center', lineHeight: 1.6 }}>
              This will permanently cancel <strong>{invoice?.invoiceNumber}</strong>. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmCancel(false)}
                style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Keep Invoice
              </button>
              <button
                onClick={() => handleStatusUpdate('CANCELLED')}
                disabled={!!updating}
                style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: '#dc2626', fontSize: 13, fontWeight: 700, color: '#fff', cursor: updating ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: updating ? 0.7 : 1 }}
              >
                {updating === 'CANCELLED' ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
