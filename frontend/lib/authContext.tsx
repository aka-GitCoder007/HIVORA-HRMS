'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, normalizeUser } from '@/lib/api'

export interface User {
  id: string
  employeeId: string
  name: string
  email: string
  role: 'employee' | 'admin'
  avatar: string
  department?: string
  designation?: string
  phone?: string
  address?: string
  salary?: number
  profilePicture?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: User | null, token?: string, rememberMe?: boolean) => Promise<boolean>
  logout: () => void
  restoreSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const restoreSession = async () => {
    if (typeof window === 'undefined') return

    const token = window.localStorage.getItem('token') || window.sessionStorage.getItem('token')
    // Legacy support for ems_token just in case
    const legacyToken = window.localStorage.getItem('ems_token')
    const actualToken = token || legacyToken
    
    const rememberMe = window.localStorage.getItem('rememberMe') === 'true'

    if (!actualToken) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const response = await getCurrentUser()
      const normalizedUser = normalizeUser(response?.user)
      setUser(normalizedUser)
      const storage = rememberMe ? window.localStorage : window.sessionStorage
      storage.setItem('user', JSON.stringify(normalizedUser))
    } catch (error) {
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void restoreSession()
  }, [])

  const login = async (userData: User | null, token?: string, rememberMe: boolean = false): Promise<boolean> => {
    if (userData) {
      const normalizedUser = normalizeUser(userData)
      setUser(normalizedUser)
      const storage = rememberMe ? window.localStorage : window.sessionStorage
      
      if (token) {
        storage.setItem('token', token)
      }
      storage.setItem('user', JSON.stringify(normalizedUser))
      storage.setItem('rememberMe', String(rememberMe))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token')
      window.localStorage.removeItem('user')
      window.localStorage.removeItem('rememberMe')
      window.localStorage.removeItem('ems_token')
      window.localStorage.removeItem('ems_user')
      
      window.sessionStorage.removeItem('token')
      window.sessionStorage.removeItem('user')
      window.sessionStorage.removeItem('rememberMe')
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, restoreSession }}>
      {!isLoading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
