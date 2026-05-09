import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { invoicesApi } from '../api/invoices'
import { customersApi } from '../api/customers'

interface Customer { id: string; name: string; email: string }
interface LineItem { description: string; quantity: number; unitPrice: number; taxRate: number }

const emptyItem = (): LineItem => ({ description: '', quantity: 1, unitPrice: 0, taxRate: 0 })

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1.5px solid #e2e8f0', fontSize: 13, color: '#0f172a',
  background: '#fff', outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

const focusIn = (e: React.FocusEvent<any>) => {
  e.target.style.borderColor = '#4f46e5'
  e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'
}
const focusOut = (e: React.FocusEvent<any>) => {
  e.target.style.borderColor = '#e2e8f0'
  e.target.style.boxShadow = 'none'
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

export default function CreateInvoicePage() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customersLoading, setCustomersLoading] = useState(true)

  const [customerId, setCustomerId] = useState('')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })
  const [currency, setCurrency] = useState('INR')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([emptyItem()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    customersApi.list(0, 200).then(res => {
      setCustomers(res.data.content ?? res.data ?? [])
    }).catch(() => {}).finally(() => setCustomersLoading(false))
  }, [])

  const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: field === 'description' ? value : Number(value) } : item))
  }

  const addItem = () => setItems(prev => [...prev, emptyItem()])
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0)
  const tax = items.reduce((s, it) => s + it.quantity * it.unitPrice * (it.taxRate / 100), 0)
  const total = subtotal + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId) { setError('Please select a customer.'); return }
    if (items.some(it => !it.description.trim())) { setError('All line items must have a description.'); return }
    setError('')
    setSaving(true)
    try {
      const res = await invoicesApi.create({ customerId, issueDate, dueDate, currency, notes: notes || undefined, items })
      navigate(`/invoices/${res.data.id}`)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create invoice.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
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
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>New Invoice</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/invoices" style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Cancel
          </Link>
          <button
            form="invoice-form"
            type="submit"
            disabled={saving}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#4f46e5', fontSize: 13, fontWeight: 700, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1, boxShadow: '0 1px 3px rgba(79,70,229,0.3)' }}
          >
            {saving ? 'Creating…' : 'Create Invoice'}
          </button>
        </div>
      </div>

      <form id="invoice-form" onSubmit={handleSubmit}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 36px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

          {/* Left: Main form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '11px 16px', fontSize: 13, color: '#dc2626' }}>{error}</div>
            )}

            {/* Customer & Dates */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '22px' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>Invoice Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

                {/* Customer */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                    Customer <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  {customersLoading ? (
                    <div style={{ height: 38, borderRadius: 8, background: '#f1f5f9', animation: 'shimmer 1.5s infinite' }} />
                  ) : (
                    <select
                      value={customerId}
                      onChange={e => setCustomerId(e.target.value)}
                      required
                      style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                      onFocus={focusIn}
                      onBlur={focusOut}
                    >
                      <option value="">Select a customer…</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
                      ))}
                    </select>
                  )}
                  {customers.length === 0 && !customersLoading && (
                    <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 5 }}>
                      No customers found. <Link to="/customers" style={{ color: '#4f46e5' }}>Add one first →</Link>
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Issue Date</label>
                  <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} required style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required min={issueDate} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Currency</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }} onFocus={focusIn} onBlur={focusOut}>
                    <option value="INR">INR — Indian Rupee</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Line Items</h2>
              </div>

              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 80px 110px 90px 110px 36px', gap: 8, padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                {['Description', 'Qty', 'Unit Price', 'Tax %', 'Amount', ''].map((h, i) => (
                  <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: i >= 1 && i <= 4 ? 'right' : 'left' }}>
                    {h}
                  </div>
                ))}
              </div>

              {/* Item rows */}
              <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((item, idx) => {
                  const lineTotal = item.quantity * item.unitPrice * (1 + item.taxRate / 100)
                  return (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 80px 110px 90px 110px 36px', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Service or product description"
                        value={item.description}
                        onChange={e => updateItem(idx, 'description', e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', e.target.value)}
                        style={{ ...inputStyle, textAlign: 'right' }}
                        onFocus={focusIn}
                        onBlur={focusOut}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={item.unitPrice || ''}
                        onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                        style={{ ...inputStyle, textAlign: 'right' }}
                        onFocus={focusIn}
                        onBlur={focusOut}
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="0"
                        value={item.taxRate || ''}
                        onChange={e => updateItem(idx, 'taxRate', e.target.value)}
                        style={{ ...inputStyle, textAlign: 'right' }}
                        onFocus={focusIn}
                        onBlur={focusOut}
                      />
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', textAlign: 'right', padding: '9px 12px', background: '#f8fafc', borderRadius: 8, border: '1.5px solid #f1f5f9' }}>
                        {fmt(lineTotal)}
                      </div>
                      <button
                        type="button"
                        onClick={() => items.length > 1 && removeItem(idx)}
                        disabled={items.length === 1}
                        style={{ width: 32, height: 32, border: 'none', borderRadius: 6, background: items.length === 1 ? 'transparent' : '#fef2f2', color: items.length === 1 ? '#e2e8f0' : '#dc2626', cursor: items.length === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontFamily: 'inherit', flexShrink: 0 }}
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>

              <div style={{ padding: '8px 16px 16px' }}>
                <button
                  type="button"
                  onClick={addItem}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#4f46e5', background: 'none', border: '1.5px dashed #c7d2fe', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', width: '100%', justifyContent: 'center', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#4f46e5' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#c7d2fe' }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Add line item
                </button>
              </div>
            </div>

            {/* Notes */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '22px' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Notes (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Payment terms, bank details, or any message to the customer…"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 } as React.CSSProperties}
                onFocus={focusIn as any}
                onBlur={focusOut as any}
              />
            </div>
          </div>

          {/* Right: Summary */}
          <div style={{ position: 'sticky', top: 72 }}>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Summary</h2>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Subtotal</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{fmt(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Tax</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{fmt(tax)}</span>
                </div>
                <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Total</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>₹{fmt(total)}</span>
                </div>
              </div>
              <div style={{ padding: '0 20px 20px' }}>
                <button
                  form="invoice-form"
                  type="submit"
                  disabled={saving}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: '#4f46e5', fontSize: 13, fontWeight: 700, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1, boxShadow: '0 2px 8px rgba(79,70,229,0.25)' }}
                >
                  {saving ? 'Creating…' : 'Create Invoice'}
                </button>
              </div>

              {/* Item count */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span>{items.length} line item{items.length !== 1 ? 's' : ''}</span>
                  <span>Currency: {currency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }
        select option { background: #fff; color: #0f172a; }
      `}</style>
    </div>
  )
}
