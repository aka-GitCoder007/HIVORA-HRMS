'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, Send } from 'lucide-react'
import { StatusBadge } from '../StatusBadge'
import { applyLeave, fetchMyLeaves } from '@/lib/api'
import { useAuth } from '@/lib/authContext'
import { toast } from 'sonner'
import { Loader2, FileText } from 'lucide-react'

interface LeaveEmployeeProps {
  employeeId?: string
}

export function LeaveEmployee({ employeeId = '' }: LeaveEmployeeProps) {
  const { user } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: 'paid' as 'paid' | 'sick' | 'unpaid',
    startDate: '',
    endDate: '',
    remarks: '',
  })
  const [submittedRequests, setSubmittedRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadLeaves = async () => {
      try {
        const requests = await fetchMyLeaves()
        setSubmittedRequests(requests)
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to load leave history')
      } finally {
        setIsLoading(false)
      }
    }

    void loadLeaves()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        leaveType: (formData.type === 'sick' ? 'Sick' : formData.type === 'unpaid' ? 'Unpaid' : 'Paid') as 'Paid' | 'Sick' | 'Unpaid',
        startDate: formData.startDate,
        endDate: formData.endDate,
        remarks: formData.remarks,
      }
      const response = await applyLeave(payload)
      if (response.success) {
        toast.success('Leave request submitted successfully')
        const requests = await fetchMyLeaves()
        setSubmittedRequests(requests)
      }
      setFormData({ type: 'paid', startDate: '', endDate: '', remarks: '' })
      setIsFormOpen(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit leave request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Leave Application Form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Apply for Leave
          </h2>
          {!isFormOpen && (
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-cyan-600 hover:bg-blue-700 text-white"
            >
              New Request
            </Button>
          )}
        </div>

        {isFormOpen && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-border pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Leave Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="paid">Paid Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleFormChange('startDate', e.target.value)}
                    className="flex-1 px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <span className="flex items-center text-foreground/50">to</span>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleFormChange('endDate', e.target.value)}
                    className="flex-1 px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleFormChange('remarks', e.target.value)}
                placeholder="Please provide a reason for your leave request..."
                rows={3}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Submit Request
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Leave History */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-6">Leave History</h2>

        <div className="space-y-4">
          {submittedRequests.map((request: any) => (
            <div key={request.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <StatusBadge status={request.type} />
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="text-sm text-foreground/70 mb-1">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {request.startDate} to {request.endDate}
                  </p>
                  <p className="text-foreground font-medium">{request.remarks}</p>
                </div>
              </div>

              {request.adminComment && (
                <div className="mt-3 p-3 bg-muted rounded border border-border/50">
                  <p className="text-xs font-semibold text-foreground/70 mb-1">Admin Comment:</p>
                  <p className="text-sm text-foreground">{request.adminComment}</p>
                </div>
              )}
            </div>
          ))}

          {submittedRequests.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-foreground/50 border border-dashed border-border/50 rounded-lg">
              <FileText className="h-12 w-12 text-foreground/30 mb-3" />
              <p className="text-lg font-medium">No leave requests found</p>
              <p className="text-sm">You haven't applied for any leaves yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Calendar */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Monthly Attendance Overview</h2>
          <span className="text-sm text-foreground/60">
            {(() => {
              const todayDate = new Date()
              return todayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            })()}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-2 text-sm font-semibold text-foreground/70">
              {day}
            </div>
          ))}

          {(() => {
            const todayDate = new Date()
            const currentYear = todayDate.getFullYear()
            const currentMonth = todayDate.getMonth()
            const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
            const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
            const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-`

            const calendarCells = []

            // Render empty cells for padding
            for (let i = 0; i < startDayOfWeek; i++) {
              calendarCells.push(<div key={`empty-${i}`} className="aspect-square" />)
            }

            // Render actual day cells
            for (let i = 1; i <= totalDaysInMonth; i++) {
              const date = `${monthPrefix}${String(i).padStart(2, '0')}`
              const record = submittedRequests.find((r: any) => r.startDate <= date && r.endDate >= date)
              const isLeaveDay = record?.status !== 'rejected'

              calendarCells.push(
                <div
                  key={`day-${i}`}
                  className={`aspect-square flex items-center justify-center rounded text-xs font-medium border transition-colors ${
                    isLeaveDay && record
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700'
                      : 'bg-muted/50 text-foreground/70 border-border'
                  }`}
                  title={record ? `${record.remarks} (${record.status})` : undefined}
                >
                  {i}
                </div>
              )
            }

            return calendarCells
          })()}
        </div>
      </div>
    </div>
  )
}
