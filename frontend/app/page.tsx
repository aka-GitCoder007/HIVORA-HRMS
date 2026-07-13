'use client'

import { AuthModule } from '@/components/auth/auth-module'
import { PublicRoute } from '@/components/auth/PublicRoute'

export default function Home() {
  return (
    <PublicRoute>
      <AuthModule />
    </PublicRoute>
  )
}
