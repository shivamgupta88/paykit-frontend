import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

interface InvoiceData {
  invoiceId: string
  invoiceNumber: string
  customerName: string | null
  amount: number
  currency: string
  status: string
  issueDate: string
  dueDate: string
  notes?: string
}

function fmt(n: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n)
}

type Stage = 'loading' | 'ready' | 'paying' | 'success' | 'error' | 'not-found' | 'not-payable'

export default function PublicPaymentPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const [stage, setStage] = useState<Stage>('loading')
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const rzpLoaded = useRef(false)

  // Load Razorpay script
  useEffect(() => {
    if (rzpLoaded.current || document.querySelector('script[src*="razorpay"]')) {
      rzpLoaded.current = true
      return
    }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    document.body.appendChild(s)
    s.onload = () => { rzpLoaded.current = true }
  }, [])

  // Fetch invoice
  useEffect(() => {
    if (!invoiceId) return
    axios.get(`${BASE_URL}/api/public/invoices/${invoiceId}`)
      .then(res => {
        setInvoice(res.data)
        setStage('ready')
      })
      .catch(err => {
        if (err.response?.status === 404) setStage('not-found')
        else setStage('error')
      })
  }, [invoiceId])

  const handlePay = async () => {
    if (!invoice) return
    setStage('paying')
    setErrorMsg('')
    try {
      const res = await axios.post(`${BASE_URL}/api/public/payments/initiate?invoiceId=${invoice.invoiceId}`)
      const { razorpayOrderId, amountInPaise, currency, keyId } = res.data

      const Razorpay = (window as any).Razorpay
      if (!Razorpay) {
        setErrorMsg('Payment gateway failed to load. Please refresh and try again.')
        setStage('ready')
        return
      }

      const rzp = new Razorpay({
        key: keyId,
        amount: amountInPaise,
        currency,
        order_id: razorpayOrderId,
        name: 'PayKit',
        description: `Payment for ${invoice.invoiceNumber}`,
        prefill: { name: invoice.customerName || '' },
        theme: { color: '#4f46e5' },
        modal: {
          ondismiss: () => setStage('ready'),
        },
        handler: async (response: any) => {
          try {
            await axios.post(`${BASE_URL}/api/public/payments/verify`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            setStage('success')
          } catch {
            setErrorMsg('Payment was received but verification failed. Please contact support.')
            setStage('ready')
          }
        },
      })
      rzp.open()
    } catch (err: any) {
      const msg = err.response?.data?.message
      setErrorMsg(msg || 'Failed to initiate payment. Please try again.')
      setStage('ready')
    }
  }

  // ── Screens ────────────────────────────────────────────────────────────────

  if (stage === 'loading') {
    return (
      <Screen>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading invoice…</p>
        </div>
      </Screen>
    )
  }

  if (stage === 'not-found' || stage === 'not-payable') {
    return (
      <Screen>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧾</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Invoice not found</h2>
          <p style={{ fontSize: 14, color: '#94a3b8' }}>This invoice may have already been paid, cancelled, or the link is invalid.</p>
        </div>
      </Screen>
    )
  }

  if (stage === 'error') {
    return (
      <Screen>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>Unable to load this invoice. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#4f46e5', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </Screen>
    )
  }

  if (stage === 'success') {
    return (
      <Screen>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ecfdf5', border: '2px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>✓</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#059669', marginBottom: 8 }}>Payment Successful!</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>
            {invoice?.invoiceNumber} has been paid.
          </p>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 16 }}>
            {fmt(invoice?.amount ?? 0, invoice?.currency)}
          </p>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 24 }}>You can close this window.</p>
        </div>
      </Screen>
    )
  }

  // ── Ready / Paying ─────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 24px' }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
          Pay<span style={{ color: '#4f46e5' }}>Kit</span>
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', width: '100%', maxWidth: 480, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

          {/* Invoice header */}
          <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Invoice</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', marginBottom: 4 }}>{invoice?.invoiceNumber}</div>
            {invoice?.customerName && (
              <div style={{ fontSize: 14, color: '#64748b' }}>Billed to <strong style={{ color: '#0f172a' }}>{invoice.customerName}</strong></div>
            )}
          </div>

          {/* Amount */}
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Amount Due</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {fmt(invoice?.amount ?? 0, invoice?.currency)}
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: '20px 28px', borderBottom: '1px solid #f1f5f9' }}>
            {[
              { label: 'Issue Date', value: invoice?.issueDate ? new Date(invoice.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
              { label: 'Due Date', value: invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
              { label: 'Status', value: invoice?.status === 'OVERDUE' ? 'Overdue' : 'Due' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                <span style={{ color: '#94a3b8' }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: row.label === 'Status' && invoice?.status === 'OVERDUE' ? '#dc2626' : '#0f172a' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Notes */}
          {invoice?.notes && (
            <div style={{ padding: '16px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Notes</div>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{invoice.notes}</p>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div style={{ margin: '0 28px', marginTop: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
              {errorMsg}
            </div>
          )}

          {/* Pay button */}
          <div style={{ padding: '24px 28px' }}>
            <button
              onClick={handlePay}
              disabled={stage === 'paying'}
              style={{
                width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                background: stage === 'paying' ? '#818cf8' : '#4f46e5',
                color: '#fff', fontSize: 16, fontWeight: 700, cursor: stage === 'paying' ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.15s',
              }}
            >
              {stage === 'paying' ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Opening Payment…
                </>
              ) : (
                `Pay ${fmt(invoice?.amount ?? 0, invoice?.currency)}`
              )}
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
              Secured by Razorpay · Your payment info is encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 24px' }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Pay<span style={{ color: '#4f46e5' }}>Kit</span></span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        {children}
      </div>
    </div>
  )
}
