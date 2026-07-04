"use client"

import { ShieldCheck } from "lucide-react"
import { PortalAuth, type PortalTheme } from "./portal-auth"

const adminTheme: PortalTheme = {
  variant: "admin",
  name: "Admin / HR Portal",
  icon: ShieldCheck,
  description: "Manage employees, attendance & payroll",
  lockedRole: "HR",
  demoEmail: "admin@company.com",
  demoPassword: "Password123",
  securityNote: "Admin access is monitored and logged",
  accentText: "text-admin",
  accentBg: "bg-admin",
  accentBgSoft: "bg-admin-muted",
  accentBorder: "border-admin/20",
  ring: "focus-visible:ring-admin/40",
  strengthBar: "bg-admin",
  buttonBg: "bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-600",
  tabActive: "bg-card text-admin",
}

export function AdminAuthPanel({ onBack }: { onBack: () => void }) {
  return <PortalAuth theme={adminTheme} onBack={onBack} />
}
