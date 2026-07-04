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
  login: (userData: User | null, token?: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSession = async () => {
      if (typeof window === 'undefined') return

      const token = window.localStorage.getItem('ems_token')
      const storedUser = window.localStorage.getItem('ems_user')

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await getCurrentUser()
        const normalizedUser = normalizeUser(response.user)
        setUser(normalizedUser)
        window.localStorage.setItem('ems_user', JSON.stringify(normalizedUser))
      } catch (error) {
        window.localStorage.removeItem('ems_token')
        window.localStorage.removeItem('ems_user')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    void loadSession()
  }, [])

  const login = async (userData: User | null, token?: string): Promise<boolean> => {
    if (userData) {
      const normalizedUser = normalizeUser(userData)
      setUser(normalizedUser)
      if (token) {
        window.localStorage.setItem('ems_token', token)
      }
      window.localStorage.setItem('ems_user', JSON.stringify(normalizedUser))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    window.localStorage.removeItem('ems_token')
    window.localStorage.removeItem('ems_user')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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
