import { createContext, useContext, useState, ReactNode } from 'react'

interface User {
  userId: string
  tenantId: string
  token: string
  email?: string
  workspaceName?: string
}

interface AuthContextType {
  user: User | null
  login: (data: User) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const tenantId = localStorage.getItem('tenantId')
    const workspaceName = localStorage.getItem('workspaceName') ?? undefined
    if (token && userId && tenantId) return { token, userId, tenantId, workspaceName }
    return null
  })

  const login = (data: User) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('userId', data.userId)
    localStorage.setItem('tenantId', data.tenantId)
    if (data.workspaceName) localStorage.setItem('workspaceName', data.workspaceName)
    setUser(data)
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
