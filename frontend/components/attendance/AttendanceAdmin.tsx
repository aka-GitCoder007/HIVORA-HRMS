'use client'

import { useEffect, useState } from 'react'
import { Calendar, Search } from 'lucide-react'
import { StatusBadge } from '../StatusBadge'
import { fetchAllAttendance } from '@/lib/api'

export function AttendanceAdmin() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [view, setView] = useState<'daily' | 'weekly'>('daily')
  const [searchQuery, setSearchQuery] = useState('')
  const [attendance, setAttendance] = useState<any[]>([])

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const records = await fetchAllAttendance()
        setAttendance(records)
      } catch (error) {
        console.error(error)
      }
    }

    void loadAttendance()
  }, [])

  const getAttendanceForDate = (date: string) => {
    return attendance.filter((r: any) => r.date === date)
  }

  const filteredRecords = getAttendanceForDate(selectedDate).filter((record: any) => {
    return (
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const allEmployeeRecords = filteredRecords.map((record: any) => ({
    employee: {
      id: record.id,
      name: record.employeeName,
      employeeId: record.employeeId,
      department: record.department,
    },
    attendance: record,
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Controls */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-foreground/50" />
              <input
                type="text"
                placeholder="Search by name, ID, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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

      {/* Daily View - Table */}
      {view === 'daily' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-4 px-6 font-semibold">Employee Name</th>
                  <th className="text-left py-4 px-6 font-semibold">Employee ID</th>
                  <th className="text-left py-4 px-6 font-semibold">Department</th>
                  <th className="text-left py-4 px-6 font-semibold">Check-in</th>
                  <th className="text-left py-4 px-6 font-semibold">Check-out</th>
                  <th className="text-left py-4 px-6 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {allEmployeeRecords.map((item) => (
                  <tr key={item.employee.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-6 text-foreground font-medium">{item.employee.name}</td>
                    <td className="py-4 px-6 text-foreground text-xs font-mono bg-muted/30 rounded w-fit">
                      {item.employee.employeeId}
                    </td>
                    <td className="py-4 px-6 text-foreground/70">{item.employee.department}</td>
                    <td className="py-4 px-6 text-foreground">{item.attendance?.checkInTime || '-'}</td>
                    <td className="py-4 px-6 text-foreground">{item.attendance?.checkOutTime || '-'}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={item.attendance?.status || 'absent'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Weekly View - Grid */}
      {view === 'weekly' && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Weekly Attendance Grid
          </h2>

          <div className="space-y-4">
            {attendance.slice(0, 5).map((record: any) => (
              <div key={record.id} className="border border-border rounded-lg p-4">
                <p className="font-semibold mb-3">{record.employeeName} ({record.employeeId})</p>
                <div className="grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                    const matchingRecord = attendance.find(
                      (item: any) => item.employeeId === record.employeeId && item.date === `2024-01-${String(8 + idx).padStart(2, '0')}`
                    )
                    return (
                      <div key={day} className="text-center">
                        <div className="text-xs text-foreground/60 mb-1">{day}</div>
                        <div className="flex justify-center">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-semibold ${
                              matchingRecord?.status === 'present'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : matchingRecord?.status === 'absent'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : matchingRecord?.status === 'half-day'
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : matchingRecord?.status === 'leave'
                                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                      : 'bg-muted text-foreground/50'
                            }`}
                            title={matchingRecord?.status || 'No data'}
                          >
                            {matchingRecord?.status === 'present'
                              ? '✓'
                              : matchingRecord?.status === 'absent'
                                ? '✕'
                                : matchingRecord?.status === 'half-day'
                                  ? 'H'
                                  : matchingRecord?.status === 'leave'
                                    ? 'L'
                                    : '-'}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" />
              <span className="text-sm">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700" />
              <span className="text-sm">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700" />
              <span className="text-sm">Half Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-900/30 border border-blue-300 dark:border-blue-700" />
              <span className="text-sm">Leave</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
