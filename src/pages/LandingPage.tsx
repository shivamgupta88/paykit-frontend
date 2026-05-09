import { Link } from 'react-router-dom'

const features = [
  {
    icon: '🧾',
    title: 'Smart Invoicing',
    desc: 'Create professional invoices with line items, tax calculation, and PDF export in seconds.',
  },
  {
    icon: '💳',
    title: 'Payment Collection',
    desc: 'Accept payments via Razorpay. Track every transaction with real-time status updates.',
  },
  {
    icon: '👥',
    title: 'Customer Management',
    desc: 'Manage your client database with billing addresses, GSTIN, and full history.',
  },
  {
    icon: '🏢',
    title: 'Multi-Tenant',
    desc: 'Built for teams and agencies. Each workspace is fully isolated and secure.',
  },
  {
    icon: '📊',
    title: 'Dashboard Analytics',
    desc: 'Get a bird\'s-eye view of revenue, outstanding invoices, and payment trends.',
  },
  {
    icon: '🔒',
    title: 'Secure by Default',
    desc: 'JWT auth, AES-256 encryption, and rate limiting — security baked in from day one.',
  },
]

const steps = [
  { step: '01', title: 'Create your workspace', desc: 'Set up your tenant and invite your team.' },
  { step: '02', title: 'Add your customers', desc: 'Import or add clients with billing details.' },
  { step: '03', title: 'Send invoices', desc: 'Generate, send, and track invoices instantly.' },
  { step: '04', title: 'Get paid', desc: 'Accept payments and mark invoices as settled.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            Pay<span className="text-indigo-600">Kit</span>
          </span>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            Invoice & Payment Platform
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
            Invoice smarter,<br />
            <span className="text-indigo-600">get paid faster</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            PayKit is a multi-tenant invoicing platform built for modern businesses.
            Create invoices, collect payments, and manage clients — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Start for free →
            </Link>
            <Link
              to="/login"
              className="border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base bg-white"
            >
              Sign in to dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-100 bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '₹0 setup', label: 'No upfront cost' },
            { value: '< 1 min', label: 'Invoice creation time' },
            { value: '100%', label: 'Data encrypted' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to run billing</h2>
            <p className="text-gray-500 text-lg">No spreadsheets. No chasing clients. Just clean, automated invoicing.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get started in minutes</h2>
            <p className="text-gray-500 text-lg">Four simple steps to your first paid invoice.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="flex gap-5 p-6 bg-white rounded-2xl border border-gray-100">
                <span className="text-3xl font-bold text-indigo-100 shrink-0">{s.step}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-gray-500 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to simplify your billing?</h2>
          <p className="text-gray-500 mb-8">Join businesses using PayKit to manage invoices and payments effortlessly.</p>
          <Link
            to="/register"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
          >
            Create your workspace →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>© 2026 PayKit. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-gray-600 transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-gray-600 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
