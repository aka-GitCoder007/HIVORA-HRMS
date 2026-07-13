"use client"

import { ChevronRight, ShieldCheck, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Role } from "./auth-module"
import { HivoraWordmark } from "@/components/ui/HivoraWordmark"

const roles = [
  {
    id: "employee" as const,
    title: "Employee Login",
    description: "Access your profile, attendance & leave",
    icon: UserRound,
    cardAccent: "hover:border-employee focus-visible:ring-employee/50",
    iconWrap: "bg-employee-muted text-employee",
    cta: "text-employee",
  },
  {
    id: "admin" as const,
    title: "Admin / HR Login",
    description: "Manage employees, attendance & payroll",
    icon: ShieldCheck,
    cardAccent: "hover:border-admin focus-visible:ring-admin/50",
    iconWrap: "bg-admin text-admin-foreground",
    cta: "text-admin",
  },
]

export function RoleSelector({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div className="animate-slide-up w-full max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-balance text-2xl font-semibold text-foreground sm:text-3xl">
          Welcome to <HivoraWordmark size="text-2xl sm:text-3xl" />
        </h1>
        <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground">
          Choose how you&apos;d like to sign in to HIVORA.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelect(role.id)}
              className={cn(
                "group flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                role.cardAccent,
              )}
            >
              <span
                className={cn(
                  "flex size-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-105",
                  role.iconWrap,
                )}
              >
                <Icon className="size-7" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">{role.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {role.description}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-medium",
                  role.cta,
                )}
              >
                Continue
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
