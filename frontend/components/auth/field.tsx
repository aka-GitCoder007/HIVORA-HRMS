"use client"

import type { LucideIcon } from "lucide-react"
import { CircleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

type FieldProps = {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  icon?: LucideIcon
  error?: string
  autoComplete?: string
  helper?: string
  ringClass: string
  disabled?: boolean
  required?: boolean
  rightSlot?: React.ReactNode
  options?: { label: string; value: string }[]
}

export function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  autoComplete,
  helper,
  ringClass,
  disabled,
  required,
  rightSlot,
  options,
}: FieldProps) {
  const hasError = Boolean(error)
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
        )}
          {options ? (
            <select
              id={id}
              name={id}
              value={value}
              disabled={disabled}
              required={required}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? `${id}-error` : helper ? `${id}-helper` : undefined
              }
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                "w-full appearance-none rounded-lg border border-input bg-background py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors",
                Icon ? "pl-9" : "pl-3",
                rightSlot ? "pr-10" : "pr-8",
                "focus-visible:ring-2 focus-visible:ring-offset-0",
                ringClass,
                hasError && "border-destructive focus-visible:ring-destructive/40",
                disabled && "cursor-not-allowed opacity-70",
              )}
            >
              <option value="" disabled hidden>
                {placeholder || "Select an option"}
              </option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={id}
              name={id}
              type={type}
              value={value}
              disabled={disabled}
              required={required}
              autoComplete={autoComplete}
              placeholder={placeholder}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? `${id}-error` : helper ? `${id}-helper` : undefined
              }
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                "w-full rounded-lg border border-input bg-background py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70",
                Icon ? "pl-9" : "pl-3",
                rightSlot ? "pr-10" : "pr-3",
                "focus-visible:ring-2 focus-visible:ring-offset-0",
                ringClass,
                hasError && "border-destructive focus-visible:ring-destructive/40",
                disabled && "cursor-not-allowed opacity-70",
              )}
            />
          )}
        {rightSlot && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {hasError ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1 text-xs font-medium text-destructive"
        >
          <CircleAlert aria-hidden="true" className="size-3.5" />
          {error}
        </p>
      ) : helper ? (
        <p id={`${id}-helper`} className="text-xs text-muted-foreground">
          {helper}
        </p>
      ) : null}
    </div>
  )
}
