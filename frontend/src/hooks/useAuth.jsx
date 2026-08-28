import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getSession())

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password)
    if (result.ok) setUser(result.user)
    return result
  }, [])

  const register = useCallback(async (name, email, password) => {
    const result = await authService.register(name, email, password)
    if (result.ok) setUser(result.user)
    return result
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, register, logout }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
