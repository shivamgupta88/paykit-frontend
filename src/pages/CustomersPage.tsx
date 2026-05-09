import { useEffect, useState } from 'react'
import { customersApi } from '../api/customers'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  billingAddress?: string
  gstin?: string
}

const emptyForm = { name: '', email: '', phone: '', billingAddress: '', gstin: '' }

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1.5px solid #e2e8f0', fontSize: 13, color: '#0f172a',
  background: '#fff', outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: '#374151', marginBottom: 5,
}

function Skeleton({ w, h, radius = 6 }: { w: number | string; h: number; radius?: number }) {
  return (
    <div style={{ width: w, height: h, borderRadius: radius, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '400% 100%', animation: 'shimmer 1.5s infinite' }} />
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, margin: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
          <button onClick={onClose} style={{ width: 28, height: 28, border: 'none', background: '#f1f5f9', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: '22px' }}>{children}</div>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await customersApi.list(0, 200)
      setCustomers(res.data.content ?? res.data ?? [])
    } catch {
      setError('Failed to load customers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (c: Customer) => {
    setEditing(c)
    setForm({ name: c.name, email: c.email, phone: c.phone ?? '', billingAddress: c.billingAddress ?? '', gstin: c.gstin ?? '' })
    setFormError('')
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      if (editing) {
        await customersApi.update(editing.id, form)
      } else {
        await customersApi.create(form)
      }
      setShowModal(false)
      load()
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to save customer.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await customersApi.delete(deleteId)
      setDeleteId(null)
      load()
    } catch {
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#4f46e5'
    e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'
  }
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#e2e8f0'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div style={{ padding: '32px 36px', minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`@keyframes shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>Customers</h1>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>
            {loading ? 'Loading…' : `${customers.length} customer${customers.length !== 1 ? 's' : ''} in your workspace`}
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#4f46e5', color: '#fff', fontWeight: 700, padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(79,70,229,0.3)' }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <line x1="6.5" y1="1" x2="6.5" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="1" y1="6.5" x2="12" y2="6.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add Customer
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '11px 16px', fontSize: 13, color: '#dc2626', marginBottom: 20 }}>{error}</div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="#94a3b8" strokeWidth="1.4" />
          <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 34 }}
          onFocus={focusStyle}
          onBlur={blurStyle}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '20px 22px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 0', borderBottom: i < 5 ? '1px solid #f8fafc' : 'none' }}>
                <Skeleton w={36} h={36} radius={50} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <Skeleton w="30%" h={13} />
                  <Skeleton w="45%" h={11} />
                </div>
                <Skeleton w={80} h={13} />
                <Skeleton w={70} h={13} />
                <Skeleton w={60} h={28} radius={8} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px 22px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
              {search ? 'No customers match your search' : 'No customers yet'}
            </p>
            {!search && (
              <button onClick={openCreate} style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Add your first customer →
              </button>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Customer', 'Email', 'Phone', 'GSTIN', ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => {
                const initials = c.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
                const colors = ['#4f46e5', '#059669', '#0891b2', '#d97706', '#dc2626', '#7c3aed']
                const color = colors[c.name.charCodeAt(0) % colors.length]
                return (
                  <tr key={c.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color, flexShrink: 0 }}>
                          {initials}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: '#64748b' }}>{c.email}</td>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: '#64748b' }}>{c.phone || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td style={{ padding: '13px 20px' }}>
                      {c.gstin
                        ? <span style={{ fontSize: 11, fontFamily: 'monospace', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 4 }}>{c.gstin}</span>
                        : <span style={{ color: '#cbd5e1', fontSize: 13 }}>—</span>
                      }
                    </td>
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEdit(c)}
                          style={{ padding: '5px 12px', borderRadius: 6, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          style={{ padding: '5px 12px', borderRadius: 6, border: '1.5px solid #fee2e2', background: '#fff', fontSize: 12, fontWeight: 600, color: '#dc2626', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <Modal title={editing ? 'Edit Customer' : 'Add Customer'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Full name <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Rahul Sharma" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required placeholder="rahul@acme.com" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Billing address</label>
                <textarea
                  value={form.billingAddress}
                  onChange={e => setForm(p => ({ ...p, billingAddress: e.target.value }))}
                  placeholder="123 MG Road, Mumbai, Maharashtra 400001"
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 } as React.CSSProperties}
                  onFocus={focusStyle as any}
                  onBlur={blurStyle as any}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>GSTIN</label>
                <input type="text" value={form.gstin} onChange={e => setForm(p => ({ ...p, gstin: e.target.value.toUpperCase() }))} placeholder="22AAAAA0000A1Z5" maxLength={15} style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.05em' }} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            </div>

            {formError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>{formError}</div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#4f46e5', fontSize: 13, fontWeight: 700, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add customer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <Modal title="Delete Customer?" onClose={() => setDeleteId(null)}>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
            This will permanently remove the customer. This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleteId(null)} style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#dc2626', fontSize: 13, fontWeight: 700, color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: deleting ? 0.7 : 1 }}>
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
