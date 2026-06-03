import { createContext, useCallback, useEffect, useState } from 'react'
import { authService } from '@/services/authService'
import { tokenService } from '@/services/tokenService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hydrate user from token on mount
  useEffect(() => {
    const hydrate = async () => {
      if (!tokenService.hasToken()) {
        setIsLoading(false)
        return
      }
      try {
        const me = await authService.getMe()
        setUser(me)
      } catch {
        tokenService.clearTokens()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    hydrate()
  }, [])

  const login = useCallback(async (credentials) => {
    const userData = await authService.login(credentials)
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (data) => {
    return await authService.register(data)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const updateUser = useCallback((data) => {
    setUser((prev) => ({ ...prev, ...data }))
  }, [])

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
