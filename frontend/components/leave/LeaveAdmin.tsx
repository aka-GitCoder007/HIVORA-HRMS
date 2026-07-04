'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, MessageCircle } from 'lucide-react'
import { StatusBadge } from '../StatusBadge'
import { fetchAllLeaves, updateLeaveStatus } from '@/lib/api'

export function LeaveAdmin() {
  const [requests, setRequests] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [commentingId, setCommentingId] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  useEffect(() => {
    const loadLeaves = async () => {
      try {
        const data = await fetchAllLeaves()
        setRequests(data)
      } catch (error) {
        console.error(error)
      }
    }

    void loadLeaves()
  }, [])

  const filteredRequests = filter === 'all' ? requests : requests.filter((r: any) => r.status === filter)

  const handleApprove = async (id: string) => {
    try {
      await updateLeaveStatus(id, { status: 'Approved', hrComment: comment })
      const data = await fetchAllLeaves()
      setRequests(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await updateLeaveStatus(id, { status: 'Rejected', hrComment: comment })
      const data = await fetchAllLeaves()
      setRequests(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddComment = async (id: string) => {
    if (comment.trim()) {
      try {
        await updateLeaveStatus(id, { status: 'Pending', hrComment: comment })
        const data = await fetchAllLeaves()
        setRequests(data)
        setComment('')
        setCommentingId(null)
      } catch (error) {
        console.error(error)
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors capitalize ${
              filter === f
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-foreground/70 hover:text-foreground'
            }`}
          >
            {f}
            {f !== 'all' && ` (${requests.filter((r: any) => r.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request: any) => {
          return (
            <div key={request.id} className="bg-card border border-border rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Request Details */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase">Employee</label>
                    <p className="text-lg font-semibold">{request.employeeName}</p>
                    <p className="text-sm text-foreground/60">{request.employeeId}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase">Leave Type</label>
                    <div className="mt-1">
                      <StatusBadge status={request.type} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase">Duration</label>
                    <p className="text-foreground font-medium">
                      {request.startDate} to {request.endDate}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase">Remarks</label>
                    <p className="text-foreground">{request.remarks}</p>
                  </div>
                </div>

                {/* Actions and Status */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase">Current Status</label>
                    <div className="mt-2">
                      <StatusBadge status={request.status} />
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(request.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id)}
                          variant="destructive"
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>

                      {commentingId !== request.id && (
                        <Button
                          onClick={() => setCommentingId(request.id)}
                          variant="outline"
                          className="w-full"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Add Comment
                        </Button>
                      )}

                      {commentingId === request.id && (
                        <div className="space-y-2">
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment for the employee..."
                            rows={2}
                            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAddComment(request.id)}
                              size="sm"
                              className="bg-cyan-600 hover:bg-blue-700 text-white"
                            >
                              Add
                            </Button>
                            <Button
                              onClick={() => {
                                setCommentingId(null)
                                setComment('')
                              }}
                              size="sm"
                              variant="outline"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {request.adminComment && (
                    <div className="bg-muted rounded-lg p-3 border border-border/50">
                      <p className="text-xs font-semibold text-foreground/60 mb-1">YOUR COMMENT</p>
                      <p className="text-sm text-foreground">{request.adminComment}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground/50">No {filter !== 'all' ? filter : ''} leave requests</p>
          </div>
        )}
      </div>
    </div>
  )
}
