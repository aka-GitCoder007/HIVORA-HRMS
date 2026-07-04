"use client"

import { useState } from "react"
import { Building2 } from "lucide-react"
import { RoleSelector } from "./role-selector"
import { EmployeeAuthPanel } from "./employee-auth-panel"
import { AdminAuthPanel } from "./admin-auth-panel"

export type Role = "employee" | "admin"

export function AuthModule() {
  const [role, setRole] = useState<Role | null>(null)

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-muted/60 via-background to-muted/40 px-4 py-10">
      {/* company logo placeholder */}
      <header className="mb-8 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
          <Building2 className="size-5" aria-hidden="true" />
        </span>
        <span className="text-base font-semibold tracking-tight text-foreground">
          Workforce
        </span>
      </header>

      {role === null && <RoleSelector onSelect={setRole} />}
      {role === "employee" && <EmployeeAuthPanel onBack={() => setRole(null)} />}
      {role === "admin" && <AdminAuthPanel onBack={() => setRole(null)} />}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Interactive prototype — no data is stored or transmitted.
      </p>
    </main>
  )
}
