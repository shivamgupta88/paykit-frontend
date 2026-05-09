import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'

type Step = 'workspace' | 'account'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState<Step>('workspace')
  const [tenantId, setTenantId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [workspace, setWorkspace] = useState({
    name: '',
    slug: '',
    contactEmail: '',
  })

  const [account, setAccount] = useState({
    fullName: '',
    email: '',
    password: '',
  })

  const handleWorkspaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setWorkspace((prev) => ({
      ...prev,
      [name]: name === 'slug' ? value.toLowerCase().replace(/\s+/g, '-') : value,
    }))
  }

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccount((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleWorkspaceSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.createTenant(workspace)
      setTenantId(res.data.id)
      setStep('account')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not create workspace. Slug may be taken.')
    } finally {
      setLoading(false)
    }
  }

  const handleAccountSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.register({ tenantId, ...account })

      const loginRes = await authApi.login({
        tenantId,
        email: account.email,
        password: account.password,
      })

      login({
        token: loginRes.data.token,
        userId: loginRes.data.userId,
        tenantId,
        email: account.email,
      })

      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-gray-900">
            Pay<span className="text-indigo-600">Kit</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Create your workspace</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'workspace' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
              1
            </div>
            <span className="text-sm font-medium text-gray-700">Workspace</span>
          </div>
          <div className="h-px flex-1 bg-gray-200" />
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-sm font-medium text-gray-400">Account</span>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'account' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
              2
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {step === 'workspace' ? (
            <form onSubmit={handleWorkspaceSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Workspace name
                </label>
                <input
                  type="text"
                  name="name"
                  value={workspace.name}
                  onChange={handleWorkspaceChange}
                  placeholder="Acme Corp"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Workspace slug
                </label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
                  <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 shrink-0">
                    paykit.app/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    value={workspace.slug}
                    onChange={handleWorkspaceChange}
                    placeholder="acme-corp"
                    required
                    className="flex-1 px-3 py-2.5 text-sm focus:outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contact email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={workspace.contactEmail}
                  onChange={handleWorkspaceChange}
                  placeholder="billing@acme.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                {loading ? 'Creating workspace…' : 'Continue →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAccountSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={account.fullName}
                  onChange={handleAccountChange}
                  placeholder="John Doe"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={account.email}
                  onChange={handleAccountChange}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={account.password}
                  onChange={handleAccountChange}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('workspace'); setError('') }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have a workspace?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
