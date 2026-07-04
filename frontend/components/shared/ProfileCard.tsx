'use client'

import { Users } from 'lucide-react'

interface ProfileCardProps {
  label: string
  value: string | React.ReactNode
  icon?: React.ReactNode
  isEditable?: boolean
  error?: string
}

export function ProfileCard({ label, value, icon = <Users className="w-4 h-4" />, isEditable = false, error }: ProfileCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground/70">{label}</label>
      <div className="flex items-center gap-2">
        <div className="text-foreground/50">{icon}</div>
        <div className={`flex-1 px-3 py-2 rounded-lg border ${isEditable ? 'border-input bg-background' : 'border-border bg-muted/50 cursor-not-allowed opacity-60'}`}>
          {typeof value === 'string' ? <p className="text-sm text-foreground">{value}</p> : value}
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
