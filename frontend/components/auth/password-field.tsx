"use client"

import { useId, useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Field } from "./field"
import { cn } from "@/lib/utils"

export type PasswordStrength = {
  score: number // 0-4
  label: string
}

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"]
  return { score, label: labels[score] }
}

type PasswordFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  autoComplete?: string
  helper?: string
  ringClass: string
  barClass: string
  showStrength?: boolean
  required?: boolean
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
  helper,
  ringClass,
  barClass,
  showStrength = false,
  required,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const strengthId = useId()
  const strength = getPasswordStrength(value)

  return (
    <div className="flex flex-col gap-1.5">
      <Field
        id={id}
        label={label}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        icon={Lock}
        error={error}
        helper={helper}
        autoComplete={autoComplete}
        ringClass={ringClass}
        required={required}
        placeholder="••••••••"
        rightSlot={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
      />
      {showStrength && value.length > 0 && (
        <div className="flex flex-col gap-1" aria-live="polite">
          <div className="flex gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i < strength.score ? barClass : "bg-muted",
                )}
              />
            ))}
          </div>
          <p id={strengthId} className="text-xs text-muted-foreground">
            Password strength:{" "}
            <span className="font-medium text-foreground">{strength.label}</span>
          </p>
        </div>
      )}
    </div>
  )
}
