import { useEffect, useState } from 'react'
import { walletApi, type AccountType, type PayoutResponse, type WalletBalance } from '../api/wallet'
import { useToast } from '../context/ToastContext'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
}

function Skeleton({ w, h, radius = 6 }: { w: number | string; h: number; radius?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
      backgroundSize: '400% 100%', animation: 'shimmer 1.5s infinite',
    }} />
  )
}

const statusColors: Record<string, { color: string; bg: string }> = {
  PENDING:    { color: '#d97706', bg: '#fffbeb' },
  PROCESSING: { color: '#2563eb', bg: '#eff6ff' },
  SUCCESS:    { color: '#059669', bg: '#ecfdf5' },
  FAILED:     { color: '#dc2626', bg: '#fef2f2' },
}

export default function WalletPage() {
  const { toast } = useToast()

  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)

  const [payouts, setPayouts] = useState<PayoutResponse[]>([])
  const [payoutsLoading, setPayoutsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(0)

  // Withdraw form
  const [accountType, setAccountType] = useState<AccountType>('BANK')
  const [amount, setAmount] = useState('')
  const [holderName, setHolderName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [upiId, setUpiId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const loadBalance = async () => {
    setBalanceLoading(true)
    try {
      const res = await walletApi.getBalance()
      setBalance(res.data)
    } catch {
      toast('Failed to load wallet balance', 'error')
    } finally {
      setBalanceLoading(false)
    }
  }

  const loadPayouts = async (p = 0) => {
    setPayoutsLoading(true)
    try {
      const res = await walletApi.listPayouts(p, 10)
      const data = res.data
      const content: PayoutResponse[] = data.content ?? []
      if (p === 0) setPayouts(content)
      else setPayouts(prev => [...prev, ...content])
      setHasMore(!data.last)
      setPage(p)
    } catch {
      toast('Failed to load payout history', 'error')
    } finally {
      setPayoutsLoading(false)
    }
  }

  useEffect(() => {
    loadBalance()
    loadPayouts(0)
  }, [])

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const amtNum = parseFloat(amount)
    if (!amount || isNaN(amtNum) || amtNum <= 0) {
      setFormError('Enter a valid amount.')
      return
    }
    if (balance && amtNum > balance.balance) {
      setFormError(`Insufficient balance. Available: ${fmt(balance.balance)}`)
      return
    }
    if (accountType === 'BANK') {
      if (!holderName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
        setFormError('All bank account fields are required.')
        return
      }
    } else {
      if (!upiId.trim()) {
        setFormError('UPI ID is required.')
        return
      }
    }

    setSubmitting(true)
    try {
      await walletApi.withdraw({
        amount: amtNum,
        accountType,
        accountHolderName: accountType === 'BANK' ? holderName : undefined,
        accountNumber: accountType === 'BANK' ? accountNumber : undefined,
        ifscCode: accountType === 'BANK' ? ifscCode : undefined,
        upiId: accountType === 'UPI' ? upiId : undefined,
      })
      toast('Withdrawal request submitted!')
      setAmount('')
      setHolderName('')
      setAccountNumber('')
      setIfscCode('')
      setUpiId('')
      await loadBalance()
      await loadPayouts(0)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setFormError(msg || 'Failed to submit withdrawal request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '32px 36px', minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }
        @keyframes toast-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>Wallet</h1>
        <p style={{ fontSize: 13, color: '#94a3b8' }}>View your earnings and request withdrawals to your bank or UPI</p>
      </div>

      {/* Balance cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Available Balance', key: 'balance' as keyof WalletBalance, color: '#4f46e5', bg: '#eef2ff', icon: '₹' },
          { label: 'Total Earned',      key: 'totalEarned' as keyof WalletBalance, color: '#059669', bg: '#ecfdf5', icon: '↑' },
          { label: 'Total Withdrawn',   key: 'totalWithdrawn' as keyof WalletBalance, color: '#64748b', bg: '#f1f5f9', icon: '↓' },
        ].map(card => (
          <div key={card.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{card.label}</span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: card.color }}>{card.icon}</div>
            </div>
            {balanceLoading || !balance
              ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><Skeleton w="60%" h={24} /><Skeleton w="40%" h={12} /></div>
              : <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{fmt(balance[card.key])}</div>
            }
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* Withdraw form */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Request Withdrawal</h2>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Funds are transferred within 1-3 business days</p>
          </div>
          <form onSubmit={handleWithdraw} style={{ padding: '20px' }}>

            {/* Account type toggle */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>Withdrawal Method</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['BANK', 'UPI'] as AccountType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setAccountType(type); setFormError('') }}
                    style={{
                      flex: 1, padding: '9px 0', borderRadius: 8, border: `2px solid ${accountType === type ? '#4f46e5' : '#e2e8f0'}`,
                      background: accountType === type ? '#eef2ff' : '#fff',
                      color: accountType === type ? '#4f46e5' : '#64748b',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    {type === 'BANK' ? '🏦 Bank Transfer' : '📱 UPI'}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, display: 'block' }}>
                Amount (INR)
                {balance && !balanceLoading && (
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400, marginLeft: 8 }}>
                    Available: {fmt(balance.balance)}
                  </span>
                )}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#64748b', fontWeight: 600 }}>₹</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  style={{ width: '100%', padding: '9px 12px 9px 28px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#0f172a', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {accountType === 'BANK' ? (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, display: 'block' }}>Account Holder Name</label>
                  <input
                    type="text"
                    value={holderName}
                    onChange={e => setHolderName(e.target.value)}
                    placeholder="Full name as on bank account"
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, display: 'block' }}>Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="Bank account number"
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, display: 'block' }}>IFSC Code</label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={e => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SBIN0001234"
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', textTransform: 'uppercase' }}
                  />
                </div>
              </>
            ) : (
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, display: 'block' }}>UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {formError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 14 }}>
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || balanceLoading}
              style={{
                width: '100%', padding: '11px', borderRadius: 8, border: 'none',
                background: submitting ? '#a5b4fc' : '#4f46e5', color: '#fff',
                fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'background 0.15s',
              }}
            >
              {submitting ? 'Submitting...' : 'Request Withdrawal'}
            </button>

            <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>
              2% platform fee is already deducted from your earnings
            </p>
          </form>
        </div>

        {/* Payout history */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', flex: 1 }}>Withdrawal History</h2>
          </div>

          {payoutsLoading && payouts.length === 0 ? (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton w="50%" h={13} />
                  <Skeleton w="35%" h={11} />
                </div>
              ))}
            </div>
          ) : payouts.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>🏦</div>
              <p style={{ fontSize: 14, color: '#94a3b8' }}>No withdrawal requests yet</p>
              <p style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4 }}>Once you request a withdrawal it will appear here</p>
            </div>
          ) : (
            <div>
              {payouts.map((p, idx) => {
                const sc = statusColors[p.status] ?? { color: '#64748b', bg: '#f1f5f9' }
                return (
                  <div
                    key={p.id}
                    style={{
                      padding: '14px 20px',
                      borderBottom: idx < payouts.length - 1 ? '1px solid #f8fafc' : 'none',
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{fmt(p.amount)}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: sc.color, background: sc.bg, padding: '2px 8px', borderRadius: 999 }}>
                          {p.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        {p.accountType === 'BANK'
                          ? `Bank • ${p.accountHolderName || ''} • ****${(p.accountNumber || '').slice(-4)}`
                          : `UPI • ${p.upiId}`
                        }
                      </div>
                      {p.failureReason && (
                        <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{p.failureReason}</div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                )
              })}
              {hasMore && (
                <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => loadPayouts(page + 1)}
                    disabled={payoutsLoading}
                    style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    {payoutsLoading ? 'Loading...' : 'Load more'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
