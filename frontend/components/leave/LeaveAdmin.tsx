'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, MessageCircle, Loader2, FileText } from 'lucide-react'
import { StatusBadge } from '../StatusBadge'
import { fetchAllLeaves, updateLeaveStatus } from '@/lib/api'
import { toast } from 'sonner'

export function LeaveAdmin() {
  const [requests, setRequests] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [commentingId, setCommentingId] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadLeaves = async () => {
      try {
        const data = await fetchAllLeaves()
        setRequests(data)
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to load leaves data')
      } finally {
        setIsLoading(false)
      }
    }

    void loadLeaves()
  }, [])

  const filteredRequests = filter === 'all' ? requests : requests.filter((r: any) => r.status === filter)

  const handleApprove = async (id: string) => {
    try {
      const commentText = comments[id] || ''
      await updateLeaveStatus(id, { status: 'Approved', hrComment: commentText })
      setComments(prev => {
        const copy = { ...prev }
        delete copy[id]
        return copy
      })
      const data = await fetchAllLeaves()
      setRequests(data)
      toast.success('Leave approved successfully')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to approve leave')
    }
  }

  const handleReject = async (id: string) => {
    try {
      const commentText = comments[id] || ''
      await updateLeaveStatus(id, { status: 'Rejected', hrComment: commentText })
      setComments(prev => {
        const copy = { ...prev }
        delete copy[id]
        return copy
      })
      const data = await fetchAllLeaves()
      setRequests(data)
      toast.success('Leave rejected successfully')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to reject leave')
    }
  }

  const handleAddComment = async (id: string) => {
    const commentText = comments[id] || ''
    if (commentText.trim()) {
      try {
        await updateLeaveStatus(id, { status: 'Pending', hrComment: commentText })
        setComments(prev => {
          const copy = { ...prev }
          delete copy[id]
          return copy
        })
        const data = await fetchAllLeaves()
        setRequests(data)
        setCommentingId(null)
        toast.success('Comment added successfully')
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to add comment')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
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
                            value={comments[request.id] || ''}
                            onChange={(e) => setComments(prev => ({ ...prev, [request.id]: e.target.value }))}
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
                                setComments(prev => {
                                  const copy = { ...prev }
                                  delete copy[request.id]
                                  return copy
                                })
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
          <div className="flex flex-col items-center justify-center py-12 text-foreground/50 border border-dashed border-border/50 rounded-lg">
            <FileText className="h-12 w-12 text-foreground/30 mb-3" />
            <p className="text-lg font-medium">No {filter !== 'all' ? filter : ''} leave requests found</p>
          </div>
        )}
      </div>
    </div>
  )
}
