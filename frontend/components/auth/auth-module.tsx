"use client"

import { useState } from "react"
import { RoleSelector } from "./role-selector"
import { EmployeeAuthPanel } from "./employee-auth-panel"
import { AdminAuthPanel } from "./admin-auth-panel"
import { HivoraWordmark } from "@/components/ui/HivoraWordmark"

export type Role = "employee" | "admin"

export function AuthModule() {
  const [role, setRole] = useState<Role | null>(null)

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-muted/60 via-background to-muted/40 px-4 py-10">
      {/* company logo */}
      <header className="mb-8 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/apple-touch-icon.png" alt="HIVORA Logo" className="size-10 rounded-xl object-cover shadow-md" />
        <HivoraWordmark size="text-base" />
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
