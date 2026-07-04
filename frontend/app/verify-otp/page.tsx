'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Mail, ShieldCheck } from 'lucide-react'
import { sendOtp, verifyOtp } from '@/lib/api'

export default function VerifyOtpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get('email') || ''

  const [email, setEmail] = useState(emailFromQuery)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  useEffect(() => {
    setEmail(emailFromQuery)
  }, [emailFromQuery])

  const otpDigits = useMemo(() => Array.from({ length: 6 }, (_, index) => otp[index] || ''), [otp])

  const handleOtpChange = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 1)
    const nextOtp = otp.split('')
    nextOtp[index] = sanitized
    setOtp(nextOtp.join(''))

    if (sanitized && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement | null
      nextInput?.focus()
    }
  }

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Email is required.' })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: 'error', text: 'Enter a valid email address.' })
      return
    }

    if (otp.length !== 6) {
      setMessage({ type: 'error', text: 'Enter the 6-digit OTP.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await verifyOtp({ email: email.trim().toLowerCase(), otp })
      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'Email verified successfully.' })
        setTimeout(() => router.push('/'), 1000)
      } else {
        setMessage({ type: 'error', text: response.message || 'Verification failed.' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Email is required.' })
      return
    }

    setResending(true)
    setMessage(null)

    try {
      const response = await sendOtp({ email: email.trim().toLowerCase() })
      if (response.success) {
        setMessage({ type: 'success', text: 'OTP Sent Successfully' })
      } else {
        setMessage({ type: 'error', text: response.message || 'Unable to resend OTP.' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Network error. Please try again.' })
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Verify Your Email</h1>
            <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to your email.</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                readOnly
                className="w-full bg-transparent text-sm text-foreground outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">OTP</label>
            <div className="flex justify-between gap-2">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  className="h-12 w-12 rounded-lg border border-input bg-background text-center text-lg font-semibold text-foreground outline-none focus:border-primary"
                />
              ))}
            </div>
          </div>

          {message && (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                message.type === 'success'
                  ? 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700'
                  : 'border-destructive/30 bg-destructive/10 text-destructive'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending}
            className="flex h-11 w-full items-center justify-center rounded-lg border border-input bg-background text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resend OTP'}
          </button>
        </form>
      </div>
    </main>
  )
}
