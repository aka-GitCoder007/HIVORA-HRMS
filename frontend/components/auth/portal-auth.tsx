"use client"

import { useState, useEffect } from "react"
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
  Calendar,
  MapPin,
  Building2,
  Briefcase,
  BriefcaseBusiness,
  Phone,
  ShieldAlert,
  Image as ImageIcon,
  Camera
} from "lucide-react"
import { useAuth } from "@/lib/authContext"
import { Field } from "./field"
import { PasswordField, getPasswordStrength } from "./password-field"
import { cn } from "@/lib/utils"
import { loginUser, normalizeUser, signupUser } from "@/lib/api"

export type PortalTheme = {
  variant: "employee" | "admin"
  name: string
  icon: LucideIcon
  description: string
  lockedRole: string
  demoEmail?: string
  demoPassword?: string
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

const SectionHeader = ({ icon: Icon, title }: { icon: LucideIcon; title: string }) => (
  <div className="col-span-full flex items-center gap-2 mt-4 mb-1">
    <Icon className="size-4 text-muted-foreground" />
    <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
  </div>
)

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

  // credentials state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [remember, setRemember] = useState(false)

  // personal info state
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("")
  const [profilePicture, setProfilePicture] = useState("")
  
  // work info state (optional)
  const [department, setDepartment] = useState("")
  const [designation, setDesignation] = useState("")
  const [joiningDate, setJoiningDate] = useState("")
  const [reportingManager, setReportingManager] = useState("")
  
  // emergency contact state
  const [emergencyContact, setEmergencyContact] = useState("")
  const [emergencyPhone, setEmergencyPhone] = useState("")

  const Icon = theme.icon

  // Load saved credentials on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`hivora_remember_${theme.variant}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.email) setEmail(parsed.email)
        if (parsed.password) setPassword(parsed.password)
        setRemember(true)
      }
    } catch {
      // ignore parse errors
    }
  }, [theme.variant])

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
      if (password && getPasswordStrength(password).score < 2)
        e.password = "Choose a stronger password"
      if (confirm !== password) e.confirm = "Passwords do not match"
      
      if (!fullName.trim()) e.fullName = "Full name is required"
      if (!dob) e.dob = "Date of birth is required"
      if (!gender) e.gender = "Gender is required"
      if (!phone.trim()) e.phone = "Phone is required"
      if (!address.trim()) e.address = "Address is required"
      
      if (!emergencyContact.trim()) e.emergencyContact = "Emergency contact name is required"
      if (!emergencyPhone.trim()) e.emergencyPhone = "Emergency contact phone is required"
    }
    return e
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicture(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
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
          name: fullName,
          email: email.trim().toLowerCase(),
          password,
          role: theme.variant === "admin" ? "HR" : "Employee",
          phone,
          address,
          dob,
          gender,
          emergencyContact,
          emergencyPhone,
          department,
          designation,
          joiningDate,
          reportingManager,
          profilePicture
        })

        if (response.success) {
          setBanner({
            type: "success",
            msg: response.message || `Account created for ${theme.lockedRole}. Please verify your email.`,
          })
          if (typeof window !== 'undefined') {
            router.push(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`)
          }
        } else {
          setBanner({ type: "error", msg: response.message || "Signup failed." })
          setShakeKey((k) => k + 1)
        }
      } else {
        const response = await loginUser({
          email: email.trim().toLowerCase(),
          password,
          portal: theme.variant,
        })

        if (response.success && response.token) {
          const normalizedUser = normalizeUser(response.user)
          await login(normalizedUser, response.token)

          // Save or clear remembered credentials
          if (remember) {
            localStorage.setItem(
              `hivora_remember_${theme.variant}`,
              JSON.stringify({ email: email.trim().toLowerCase(), password })
            )
          } else {
            localStorage.removeItem(`hivora_remember_${theme.variant}`)
          }

          setBanner({ type: "success", msg: "Signed in successfully. Redirecting…" })
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              router.push("/dashboard")
            }
          }, 800)
        } else {
          setBanner({ type: "error", msg: response.message || "Invalid credentials. Please try again." })
          setShakeKey((k) => k + 1)
          if (response.message === "Please verify your email before logging in.") {
            setTimeout(() => {
              if (typeof window !== 'undefined') {
                router.push(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`)
              }
            }, 2000)
          }
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
    <div className={cn("animate-slide-up w-full mx-auto", mode === "signup" ? "max-w-2xl" : "max-w-md")}>
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
        {theme.variant !== "admin" && (
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
        )}

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
          className={cn(
            mode === "signup" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-4",
            errors && shakeKey > 0 && "animate-shake"
          )}
        >
          {/* CREDENTIALS SECTION */}
          {mode === "signup" && <SectionHeader icon={Lock} title="Credentials" />}
          
          <div className={cn("col-span-full", mode === "signup" && "grid grid-cols-1 md:grid-cols-2 gap-4")}>
            <Field
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              icon={Mail}
              placeholder="you@company.com"
              error={errors.email}
              helper={mode === "signup" ? "A verification link will be sent to this email" : undefined}
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
          </div>

          {mode === "signup" && (
            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Role</span>
                <div
                  aria-disabled="true"
                  className="flex items-center justify-between h-[42px] rounded-lg border border-dashed border-input bg-muted/60 px-3 py-2.5"
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
            </div>
          )}

          {/* EXTENDED SIGNUP FIELDS */}
          {mode === "signup" && (
            <>
              <SectionHeader icon={User} title="Personal Information" />
              
              <div className="col-span-full flex flex-col items-center gap-3 mb-2">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-input bg-muted/30 overflow-hidden flex items-center justify-center relative">
                    {profilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profilePicture} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                    )}
                    <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-6 h-6 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Upload Photo (Optional)</span>
              </div>

              <div className="col-span-full">
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
              </div>

              <Field
                id="dob"
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={setDob}
                icon={Calendar}
                error={errors.dob}
                ringClass={theme.ring}
                required
              />

              <Field
                id="gender"
                label="Gender"
                value={gender}
                onChange={setGender}
                icon={User}
                error={errors.gender}
                ringClass={theme.ring}
                required
                options={[
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                  { label: "Other", value: "Other" },
                  { label: "Prefer not to say", value: "Prefer not to say" }
                ]}
              />

              <Field
                id="phone"
                label="Phone"
                type="tel"
                value={phone}
                onChange={setPhone}
                icon={Phone}
                placeholder="123-456-7890"
                error={errors.phone}
                ringClass={theme.ring}
                required
              />

              <Field
                id="address"
                label="Address"
                value={address}
                onChange={setAddress}
                icon={MapPin}
                placeholder="123 Main St"
                error={errors.address}
                ringClass={theme.ring}
                required
              />

              <SectionHeader icon={BriefcaseBusiness} title="Work Information (Optional)" />
              
              <Field
                id="department"
                label="Department"
                value={department}
                onChange={setDepartment}
                icon={Building2}
                placeholder="Engineering"
                ringClass={theme.ring}
              />
              
              <Field
                id="designation"
                label="Designation"
                value={designation}
                onChange={setDesignation}
                icon={Briefcase}
                placeholder="Software Engineer"
                ringClass={theme.ring}
              />
              
              <Field
                id="joiningDate"
                label="Joining Date"
                type="date"
                value={joiningDate}
                onChange={setJoiningDate}
                icon={Calendar}
                ringClass={theme.ring}
              />
              
              <Field
                id="reportingManager"
                label="Reporting Manager"
                value={reportingManager}
                onChange={setReportingManager}
                icon={User}
                placeholder="John Doe"
                ringClass={theme.ring}
              />

              <SectionHeader icon={ShieldAlert} title="Emergency Contact" />
              
              <Field
                id="emergencyContact"
                label="Contact Name"
                value={emergencyContact}
                onChange={setEmergencyContact}
                icon={User}
                placeholder="Emergency Contact Name"
                error={errors.emergencyContact}
                ringClass={theme.ring}
                required
              />
              
              <Field
                id="emergencyPhone"
                label="Contact Phone"
                type="tel"
                value={emergencyPhone}
                onChange={setEmergencyPhone}
                icon={Phone}
                placeholder="Emergency Contact Phone"
                error={errors.emergencyPhone}
                ringClass={theme.ring}
                required
              />
            </>
          )}

          {mode === "signin" && (
            <div className="flex items-center justify-between col-span-full">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => {
                    setRemember(e.target.checked)
                    if (!e.target.checked) {
                      localStorage.removeItem(`hivora_remember_${theme.variant}`)
                    }
                  }}
                  className={cn(
                    "size-4 rounded border-input accent-current",
                    theme.accentText,
                  )}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className={cn(
                  "text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
                  theme.accentText,
                )}
              >
                Forgot password?
              </button>
            </div>
          )}

          <div className="col-span-full mt-2">
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60",
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
          </div>

          {mode === "signin" && theme.demoEmail && theme.demoPassword && (
            <p className="text-center text-xs text-muted-foreground col-span-full">
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
