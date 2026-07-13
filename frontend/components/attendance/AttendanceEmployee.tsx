'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Clock, Calendar } from 'lucide-react'
import { StatusBadge } from '../StatusBadge'
import { checkInAttendance, checkOutAttendance, fetchMyAttendance } from '@/lib/api'
import { useAuth } from '@/lib/authContext'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface AttendanceEmployeeProps {
  employeeId?: string
}

export function AttendanceEmployee({ employeeId = '' }: AttendanceEmployeeProps) {
  const { user } = useAuth()
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [hasTodayRecord, setHasTodayRecord] = useState(false)
  const [view, setView] = useState<'daily' | 'weekly'>('daily')
  const [checkedInTime, setCheckedInTime] = useState<string | null>(null)
  const [checkedOutTime, setCheckedOutTime] = useState<string | null>(null)
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const currentEmployee = user

  const processRecords = (records: any[]) => {
    setAttendance(records)
    const todayStr = new Date().toLocaleDateString('en-CA')
    const todayRecord = records.find((r: any) => r.date === todayStr)
    if (todayRecord) {
      setCheckedInTime(todayRecord.checkInTime || null)
      setCheckedOutTime(todayRecord.checkOutTime || null)
      setIsCheckedIn(Boolean(todayRecord.checkInTime && !todayRecord.checkOutTime))
      setHasTodayRecord(true)
    } else {
      setCheckedInTime(null)
      setCheckedOutTime(null)
      setIsCheckedIn(false)
      setHasTodayRecord(false)
    }
  }

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const records = await fetchMyAttendance()
        processRecords(records)
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to load attendance records')
      } finally {
        setIsLoadingData(false)
      }
    }

    void loadAttendance()
  }, [])

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      await checkInAttendance()
      const records = await fetchMyAttendance()
      processRecords(records)
      toast.success('Successfully checked in for today!')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to check in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    try {
      await checkOutAttendance()
      const records = await fetchMyAttendance()
      processRecords(records)
      toast.success('Successfully checked out. Have a great evening!')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to check out. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const todayStr = new Date().toLocaleDateString('en-CA')
  const todayRecord = attendance.find((r: any) => r.date === todayStr)

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Check-in / Check-out Card */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-800 rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-2">Welcome, {currentEmployee?.name}</h1>
        <p className="text-foreground/70 mb-6">Today&apos;s Attendance</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800/50">
            <p className="text-sm text-foreground/70 mb-1">Status</p>
            {todayRecord ? (
              <StatusBadge status={todayRecord.status} />
            ) : (
              <p className="text-foreground font-semibold">Not Marked</p>
            )}
          </div>

          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800/50">
            <p className="text-sm text-foreground/70 mb-1">Check In</p>
            <p className="text-lg font-semibold text-green-600">{checkedInTime || todayRecord?.checkInTime || 'Not checked in'}</p>
          </div>

          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800/50">
            <p className="text-sm text-foreground/70 mb-1">Check Out</p>
            <p className="text-lg font-semibold text-red-600">{checkedOutTime || todayRecord?.checkOutTime || 'Not checked out'}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Button
              onClick={handleCheckIn}
              disabled={hasTodayRecord || loading}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              <Clock className="w-4 h-4 mr-2" />
              Check In
            </Button>
            <Button
              onClick={handleCheckOut}
              disabled={!isCheckedIn || loading}
              variant="outline"
            >
              <Clock className="w-4 h-4 mr-2" />
              Check Out
            </Button>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setView('daily')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            view === 'daily'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-foreground/70 hover:text-foreground'
          }`}
        >
          Daily View
        </button>
        <button
          onClick={() => setView('weekly')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            view === 'weekly'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-foreground/70 hover:text-foreground'
          }`}
        >
          Weekly View
        </button>
      </div>

      {/* Daily View */}
      {view === 'daily' && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Today&apos;s Details
          </h2>

          {todayRecord ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-foreground/70">Status</label>
                  <div className="mt-2">
                    <StatusBadge status={todayRecord.status} />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-foreground/70">Check-in Time</label>
                  <p className="text-foreground font-semibold mt-2">{todayRecord.checkInTime || 'N/A'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-foreground/70">Check-out Time</label>
                <p className="text-foreground font-semibold mt-2">{todayRecord.checkOutTime || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <p className="text-foreground/70">No attendance record for today.</p>
          )}
        </div>
      )}

      {/* Weekly View */}
      {view === 'weekly' && (
        <div className="bg-card border border-border rounded-xl p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Weekly Attendance
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Date</th>
                <th className="text-left py-3 px-4 font-semibold">Check-in</th>
                <th className="text-left py-3 px-4 font-semibold">Check-out</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-foreground/50">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Calendar className="h-8 w-8 text-foreground/30" />
                      <p>No attendance records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                attendance.slice(0, 7).map((record: any, idx: number) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-foreground">{record.date}</td>
                    <td className="py-3 px-4 text-foreground">{record.checkInTime || '-'}</td>
                    <td className="py-3 px-4 text-foreground">{record.checkOutTime || '-'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
