"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react"
import { useAuth } from "@/lib/authContext"
import { Field } from "./field"
import { PasswordField, getPasswordStrength } from "./password-field"
import { cn } from "@/lib/utils"
import { loginUser, normalizeUser, signupUser, verifyOtp } from "@/lib/api"

export type PortalTheme = {
  variant: "employee" | "admin"
  name: string
  icon: LucideIcon
  description: string
  lockedRole: string
  demoEmail: string
  demoPassword: string
  securityNote?: string
  /* class strings */
  accentText: string
  accentBg: string
  accentBgSoft: string
  accentBorder: string
  ring: string
  strengthBar: string
  buttonBg: string
  tabActive: string
}

type Mode = "signin" | "signup"

type Errors = Record<string, string>

export function PortalAuth({
  theme,
  onBack,
}: {
  theme: PortalTheme
  onBack: () => void
}) {
  const router = useRouter()
  const { login } = useAuth()
  const [mode, setMode] = useState<Mode>("signin")
  const [loading, setLoading] = useState(false)
  const [banner, setBanner] = useState<{ type: "error" | "success"; msg: string } | null>(null)
  const [shakeKey, setShakeKey] = useState(0)
  const [errors, setErrors] = useState<Errors>({})

  // shared field state
  const [employeeId, setEmployeeId] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [remember, setRemember] = useState(false)

  const Icon = theme.icon

  function switchMode(next: Mode) {
    if (next === mode) return
    setMode(next)
    setErrors({})
    setBanner(null)
  }

  function validate(): Errors {
    const e: Errors = {}
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailOk) e.email = "Enter a valid email address"
    if (!password) e.password = "Password is required"

    if (mode === "signup") {
      if (!employeeId.trim()) e.employeeId = "Employee ID is required"
      if (!fullName.trim()) e.fullName = "Full name is required"
      if (password && getPasswordStrength(password).score < 2)
        e.password = "Choose a stronger password"
      if (confirm !== password) e.confirm = "Passwords do not match"
    }
    return e
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBanner(null)
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setShakeKey((k) => k + 1)
      return
    }

    setLoading(true)

    try {
      if (mode === "signup") {
        const response = await signupUser({
          employeeId,
          name: fullName,
          email: email.trim().toLowerCase(),
          password,
          role: theme.variant === "admin" ? "HR" : "Employee",
        })

        if (response.success) {
          setBanner({
            type: "success",
            msg: response.message || `Account created for ${theme.lockedRole}. Please verify your email.`,
          })
          router.push(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`)
        } else {
          setBanner({ type: "error", msg: response.message || "Signup failed." })
          setShakeKey((k) => k + 1)
        }
      } else {
        const response = await loginUser({
          email: email.trim().toLowerCase(),
          password,
        })

        if (response.success && response.token) {
          const normalizedUser = normalizeUser(response.user)
          await login(normalizedUser, response.token)
          setBanner({ type: "success", msg: "Signed in successfully. Redirecting…" })
          setTimeout(() => {
            router.push("/dashboard")
          }, 800)
        } else {
          setBanner({ type: "error", msg: response.message || "Invalid credentials. Please try again." })
          setShakeKey((k) => k + 1)
        }
      }
    } catch (error: any) {
      setBanner({ type: "error", msg: error?.response?.data?.message || "Network error. Please try again." })
      setShakeKey((k) => k + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-slide-up w-full max-w-md">
      {/* header badge */}
      <div
        className={cn(
          "relative overflow-hidden rounded-t-2xl border border-b-0 p-6",
          theme.accentBg,
          theme.accentBorder,
        )}
      >
        {theme.variant === "admin" && (
          <Lock
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-4 size-28 text-white/5"
          />
        )}
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded"
        >
          <ArrowLeft className="size-3.5" />
          Back to role selection
        </button>
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-foreground/10 text-foreground ring-1 ring-foreground/20">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-semibold leading-tight text-foreground">{theme.name}</h1>
            <p className="text-xs text-foreground/70">{theme.description}</p>
          </div>
        </div>
      </div>

      {/* body */}
      <div className={cn("rounded-b-2xl border bg-card p-6 shadow-xl", theme.accentBorder)}>
        {/* tabs */}
        <div
          role="tablist"
          aria-label={`${theme.name} authentication`}
          className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
        >
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                mode === m
                  ? cn("shadow-sm", theme.tabActive)
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* banner */}
        {banner && (
          <div
            role="status"
            className={cn(
              "mb-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm animate-fade-in",
              banner.type === "error"
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-emerald-600/30 bg-emerald-500/10 text-emerald-700",
            )}
          >
            {banner.type === "error" ? (
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            ) : (
              <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            )}
            <span>{banner.msg}</span>
          </div>
        )}

        <form
          key={`${mode}-${shakeKey}`}
          onSubmit={handleSubmit}
          noValidate
          className={cn("flex flex-col gap-4", errors && shakeKey > 0 && "animate-shake")}
        >
          {mode === "signup" && (
            <>
              <Field
                id="employeeId"
                label="Employee ID"
                value={employeeId}
                onChange={setEmployeeId}
                icon={User}
                placeholder="EMP-00123"
                error={errors.employeeId}
                ringClass={theme.ring}
                required
              />
              <Field
                id="fullName"
                label="Full Name"
                value={fullName}
                onChange={setFullName}
                icon={User}
                placeholder="Jane Doe"
                error={errors.fullName}
                ringClass={theme.ring}
                required
              />
            </>
          )}

          <Field
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            icon={Mail}
            placeholder="you@company.com"
            error={errors.email}
            helper={
              mode === "signup" ? "A verification link will be sent to this email" : undefined
            }
            autoComplete="email"
            ringClass={theme.ring}
            required
          />

          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            ringClass={theme.ring}
            barClass={theme.strengthBar}
            showStrength={mode === "signup"}
            required
          />

          {mode === "signup" && (
            <>
              <PasswordField
                id="confirm"
                label="Confirm Password"
                value={confirm}
                onChange={setConfirm}
                error={errors.confirm}
                autoComplete="new-password"
                ringClass={theme.ring}
                barClass={theme.strengthBar}
                required
              />
              {/* locked role badge */}
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Role</span>
                <div
                  aria-disabled="true"
                  className="flex items-center justify-between rounded-lg border border-dashed border-input bg-muted/60 px-3 py-2.5"
                >
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="size-3.5" aria-hidden="true" />
                    Assigned automatically
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      theme.accentBgSoft,
                      theme.accentText,
                    )}
                  >
                    {theme.lockedRole}
                  </span>
                </div>
              </div>
            </>
          )}

          {mode === "signin" && (
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className={cn(
                    "size-4 rounded border-input accent-current",
                    theme.accentText,
                  )}
                />
                Remember me
              </label>
              <button
                type="button"
                className={cn(
                  "text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
                  theme.accentText,
                )}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "mt-2 flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60",
              theme.buttonBg,
              "text-white hover:shadow-lg hover:brightness-95 dark:hover:brightness-110",
            )}
          >
            {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {loading
              ? "Please wait…"
              : mode === "signin"
                ? "Sign In"
                : "Create Account"}
          </button>

          {mode === "signin" && (
            <p className="text-center text-xs text-muted-foreground">
              Demo credentials: {theme.demoEmail} / {theme.demoPassword}
            </p>
          )}
        </form>

        {theme.securityNote && (
          <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
            <Lock className="size-3.5" aria-hidden="true" />
            {theme.securityNote}
          </div>
        )}
      </div>
    </div>
  )
}
