export default function DashboardPage() {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ height: 32, width: 180, background: '#e2e8f0', borderRadius: 8, marginBottom: 8 }} />
      <div style={{ height: 16, width: 260, background: '#f1f5f9', borderRadius: 6, marginBottom: 32 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 100, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }} />
        ))}
      </div>
    </div>
  )
}
