'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Mail, User, Briefcase, Calendar, Users, Loader2 } from 'lucide-react'
import { fetchMyPayroll, fetchProfile, updateEmployeeProfileByHR, uploadImage } from '@/lib/api'
import { useAuth } from '@/lib/authContext'
import { toast } from 'sonner'

interface ProfileViewProps {
  isAdmin?: boolean
}

export function ProfileView({ isAdmin = false }: ProfileViewProps) {
  const { user, restoreSession } = useAuth()
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [editingMode, setEditingMode] = useState(false)
  const [editedUser, setEditedUser] = useState<any | null>(null)
  const [salary, setSalary] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileResponse = await fetchProfile()
        const payrollResponse = await fetchMyPayroll()
        setCurrentUser(profileResponse?.user || null)
        setSalary(payrollResponse || null)
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to load profile data')
        setCurrentUser(null)
        setSalary(null)
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [])

  const safeUser = currentUser || {}

  const handleEdit = () => {
    if (currentUser) {
      setEditedUser({ ...currentUser })
      setEditingMode(true)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const data = await uploadImage(file)
      setEditedUser((prev: any) => ({ ...prev, profilePicture: data.url }))
      toast.success('Image uploaded successfully')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    if (!editedUser) return
    try {
      const targetId = currentUser?._id || currentUser?.id

      if (!targetId) {
        console.error('Save failed: no valid target ID found')
        return
      }

      await updateEmployeeProfileByHR(targetId, {
        name: editedUser.name,
        dob: editedUser.dob,
        gender: editedUser.gender,
        phone: editedUser.phone,
        address: editedUser.address,
        emergencyContact: editedUser.emergencyContact,
        emergencyPhone: editedUser.emergencyPhone,
        designation: editedUser.designation,
        department: editedUser.department,
        joiningDate: editedUser.joiningDate,
        reportingManager: editedUser.reportingManager,
        profilePicture: editedUser.profilePicture,
      })
      toast.success('Profile updated successfully')
      setCurrentUser((prev: any) => ({ ...prev, ...editedUser }))
      
      // Update global auth context so TopHeader updates immediately
      void restoreSession()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile')
    }
    setEditingMode(false)
    setEditedUser(null)
  }

  const handleCancel = () => {
    setEditingMode(false)
    setEditedUser(null)
  }

  const handleInputChange = (field: string, value: string) => {
    if (editedUser) {
      setEditedUser({ ...editedUser, [field]: value })
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
      {/* Profile Header */}
      <div className="bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-800 rounded-xl p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex gap-6 items-start">
            <div className="relative group w-24 h-24 shrink-0 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {(editingMode ? editedUser?.profilePicture : safeUser.profilePicture) ? (
                <img
                  src={editingMode ? editedUser.profilePicture : safeUser.profilePicture}
                  alt={safeUser.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                (safeUser.name || 'U').charAt(0)
              )}
              {editingMode && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-white text-xs mt-1">Upload</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{safeUser.name || 'Loading profile...'}</h1>
              <p className="text-foreground/70 mt-1">{safeUser.designation || '—'}</p>
              <p className="text-sm text-foreground/60 mt-1">{safeUser.department || '—'}</p>
            </div>
          </div>

          {editingMode ? (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Save Changes
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          ) : (
            isAdmin && (
              <Button
                onClick={handleEdit}
                className="bg-cyan-600 hover:bg-blue-700 text-white"
              >
                Edit Profile
              </Button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Latest Admin Updates</h2>
                <p className="text-sm text-foreground/70">
                  These are the current values your admin manages for your account.
                </p>
              </div>
              <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-slate-900/50 dark:text-blue-300">
                Managed by Admin
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-background/70 p-3">
                <p className="text-xs uppercase tracking-wide text-foreground/60">Department</p>
                <p className="mt-1 font-semibold text-foreground">{safeUser.department || '—'}</p>
              </div>
              <div className="rounded-lg border border-border bg-background/70 p-3">
                <p className="text-xs uppercase tracking-wide text-foreground/60">Designation</p>
                <p className="mt-1 font-semibold text-foreground">{safeUser.designation || '—'}</p>
              </div>
              <div className="rounded-lg border border-border bg-background/70 p-3">
                <p className="text-xs uppercase tracking-wide text-foreground/60">Salary</p>
                <p className="mt-1 font-semibold text-foreground">₹{(salary?.netPay || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Personal Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">Full Name</label>
                {editingMode && isAdmin ? (
                  <input
                    type="text"
                    value={editedUser?.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-foreground font-medium">{safeUser.name || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">Date of Birth</label>
                {editingMode && isAdmin ? (
                  <input
                    type="date"
                    value={editedUser?.dob || ''}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-foreground font-medium">{safeUser.dob || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">Gender</label>
                {editingMode && isAdmin ? (
                  <select
                    value={editedUser?.gender || ''}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                ) : (
                  <p className="text-foreground font-medium">{safeUser.gender || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Contact Number
                </label>
                {editingMode ? (
                  <input
                    type="tel"
                    value={editedUser?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-foreground font-medium">{safeUser.phone || '—'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Address
                </label>
                {editingMode ? (
                  <textarea
                    value={editedUser?.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-foreground font-medium">{safeUser.address || '—'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground/70 mb-2">Emergency Contact</label>
                {editingMode && isAdmin ? (
                  <input
                    type="text"
                    value={editedUser?.emergencyContact || ''}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-foreground font-medium">{safeUser.emergencyContact || '—'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground/70 mb-2">Emergency Contact Phone</label>
                {editingMode && isAdmin ? (
                  <input
                    type="tel"
                    value={editedUser?.emergencyPhone || ''}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-foreground font-medium">{safeUser.emergencyPhone || '—'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Job Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">Employee ID</label>
                <p className="text-foreground font-mono bg-muted/50 p-2 rounded">{safeUser.employeeId || '—'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">Designation</label>
                {editingMode && isAdmin ? (
                  <input
                    type="text"
                    value={editedUser?.designation || ''}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-foreground font-medium">{safeUser.designation || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">Department</label>
                {editingMode && isAdmin ? (
                  <input
                    type="text"
                    value={editedUser?.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-foreground font-medium">{safeUser.department || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Joining Date
                </label>
                {editingMode && isAdmin ? (
                  <input
                    type="date"
                    value={editedUser?.joiningDate || ''}
                    onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-foreground font-medium">{safeUser.joiningDate || '—'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Reporting Manager
                </label>
                {editingMode && isAdmin ? (
                  <input
                    type="text"
                    value={editedUser?.reportingManager || ''}
                    onChange={(e) => handleInputChange('reportingManager', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-foreground font-medium">{safeUser.reportingManager || '—'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Salary Structure */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6">Salary Structure</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-foreground/70">Basic Pay</span>
              <span className="font-semibold">₹{(salary?.basicPay || 0).toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-foreground/70">HRA</span>
              <span className="font-semibold">₹{(salary?.hra || 0).toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-foreground/70">Allowances</span>
              <span className="font-semibold">₹{(salary?.allowances || 0).toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-foreground/70">Deductions</span>
              <span className="font-semibold text-red-600">-₹{(salary?.deductions || 0).toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="font-semibold text-foreground">Net Pay</span>
              <span className="font-bold text-cyan-400 text-lg">₹{(salary?.netPay || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
