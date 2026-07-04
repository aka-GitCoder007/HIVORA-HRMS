"use client"

import { UserRound } from "lucide-react"
import { PortalAuth, type PortalTheme } from "./portal-auth"

const employeeTheme: PortalTheme = {
  variant: "employee",
  name: "Employee Portal",
  icon: UserRound,
  description: "Access your profile, attendance & leave",
  lockedRole: "Employee",
  demoEmail: "employee@company.com",
  demoPassword: "Password123",
  accentText: "text-employee",
  accentBg: "bg-employee",
  accentBgSoft: "bg-employee-muted",
  accentBorder: "border-employee/25",
  ring: "focus-visible:ring-employee/45",
  strengthBar: "bg-employee",
  buttonBg: "bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-600",
  tabActive: "bg-card text-employee",
}

export function EmployeeAuthPanel({ onBack }: { onBack: () => void }) {
  return <PortalAuth theme={employeeTheme} onBack={onBack} />
}
