'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Search, X, Edit2, Save, ChevronDown, Users,
  Building2, UserCheck, Phone, Mail, Calendar,
  Briefcase, User, Shield, Loader2, AlertCircle,
  SlidersHorizontal, RefreshCw
} from 'lucide-react'
import { fetchAllEmployees, updateEmployeeProfileByHR, uploadImage } from '@/lib/api'
import type { EmployeeProfile } from '@/lib/api'
import { getInitials } from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/lib/authContext'

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({ name, picture, size = 'md' }: { name: string; picture?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes: Record<string, string> = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  }
  const cls = `${sizes[size]} rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden`
  if (picture) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={picture} alt={name} className={`${cls} object-cover`} />
  }
  const gradients = [
    'from-cyan-500 to-blue-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-amber-600',
    'from-rose-500 to-red-600',
    'from-indigo-500 to-violet-600',
  ]
  const color = gradients[(name.charCodeAt(0) || 0) % gradients.length]
  return (
    <div className={`${cls} bg-gradient-to-br ${color} text-white`}>
      {getInitials(name)}
    </div>
  )
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | number }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800 shrink-0">
        <Icon className="w-3.5 h-3.5 text-cyan-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-200 break-words">{String(value)}</p>
      </div>
    </div>
  )
}

// ─── Employee Card ────────────────────────────────────────────────────────────

function EmployeeCard({ employee, onClick }: { employee: EmployeeProfile; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-slate-900 border border-slate-700/60 rounded-2xl p-5 hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/5 hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        <Avatar name={employee.name} picture={employee.profilePicture} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-100 truncate group-hover:text-cyan-400 transition-colors">{employee.name}</p>
          <p className="text-xs text-cyan-500 font-mono mt-0.5">{employee.employeeId}</p>
          <p className="text-xs text-slate-400 mt-1 truncate">{employee.designation || 'No designation'}</p>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${employee.isVerified ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
          {employee.isVerified ? 'Verified' : 'Pending'}
        </span>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 gap-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{employee.department || 'No dept'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Phone className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{employee.phone || '—'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 col-span-2">
          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{employee.email}</span>
        </div>
      </div>
      {employee.joiningDate && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="w-3 h-3" />
          <span>Joined {new Date(employee.joiningDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
        </div>
      )}
    </button>
  )
}

// ─── Management Panel ─────────────────────────────────────────────────────────

type EditableFields = {
  name: string; department: string; designation: string; phone: string;
  address: string; dob: string; gender: string; emergencyContact: string;
  emergencyPhone: string; joiningDate: string; reportingManager: string;
}

function getDefaultForm(emp: EmployeeProfile): EditableFields {
  return {
    name: emp.name, department: emp.department, designation: emp.designation,
    phone: emp.phone, address: emp.address, dob: emp.dob, gender: emp.gender,
    emergencyContact: emp.emergencyContact, emergencyPhone: emp.emergencyPhone,
    joiningDate: emp.joiningDate, reportingManager: emp.reportingManager,
  }
}

function Field({ label, fieldKey, type = 'text', options, isEditing, form, handleChange }: { label: string; fieldKey: keyof EditableFields; type?: string; options?: string[]; isEditing: boolean; form: EditableFields; handleChange: (key: string, value: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>
      {isEditing ? (
        options ? (
          <select value={form[fieldKey]} onChange={e => handleChange(fieldKey, e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
            <option value="">Select…</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input type={type} value={form[fieldKey]} onChange={e => handleChange(fieldKey, e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
        )
      ) : (
        <p className="text-sm text-slate-200 py-2 px-3 bg-slate-800/50 rounded-lg min-h-[36px]">
          {form[fieldKey] || <span className="text-slate-500 italic">Not set</span>}
        </p>
      )}
    </div>
  )
}

function ManagementPanel({ employee, onClose, onSaved }: { employee: EmployeeProfile; onClose: () => void; onSaved: (updated: EmployeeProfile) => void }) {
  const { user, restoreSession } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [form, setForm] = useState<EditableFields & { profilePicture?: string }>(() => ({
    ...getDefaultForm(employee),
    profilePicture: employee.profilePicture
  }))

  const handleChange = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const handleCancel = () => { setForm({ ...getDefaultForm(employee), profilePicture: employee.profilePicture }); setIsEditing(false) }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const data = await uploadImage(file)
      setForm(prev => ({ ...prev, profilePicture: data.url }))
      toast.success('Image uploaded successfully')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateEmployeeProfileByHR(employee._id, form)
      const updated: EmployeeProfile = { ...employee, ...form }
      onSaved(updated)
      toast.success('Employee profile updated')
      setIsEditing(false)
      
      // If the admin edited their own profile, update global auth state
      if (user?.id === employee._id || user?.employeeId === employee.employeeId) {
        void restoreSession()
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }


  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-slate-700 shrink-0 relative">
          <div className="relative group">
            <Avatar name={form.name || employee.name} picture={form.profilePicture || employee.profilePicture} size="lg" />
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Edit2 className="w-5 h-5 text-white" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
              </label>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-100 truncate">{isEditing ? form.name : employee.name}</h2>
            <p className="text-sm font-mono text-cyan-500">{employee.employeeId}</p>
            <p className="text-xs text-slate-400 mt-0.5">{employee.email}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isEditing ? (
              <>
                <button onClick={handleCancel} className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors">
                <Edit2 className="w-3.5 h-3.5" />Edit
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="px-6 pt-4 flex flex-wrap gap-2 shrink-0">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${employee.isVerified ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
            {employee.isVerified ? '✓ Verified' : '⚠ Unverified'}
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">{employee.role}</span>
          {employee.salary > 0 && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
              ₹{employee.salary.toLocaleString('en-IN')} / mo
            </span>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><User className="w-3.5 h-3.5" /> Personal Information</h3>
            <div className="space-y-3">
              <Field label="Full Name" fieldKey="name" isEditing={isEditing} form={form} handleChange={handleChange} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of Birth" fieldKey="dob" type="date" isEditing={isEditing} form={form} handleChange={handleChange} />
                <Field label="Gender" fieldKey="gender" options={['Male', 'Female', 'Other', 'Prefer not to say']} isEditing={isEditing} form={form} handleChange={handleChange} />
              </div>
              <Field label="Phone" fieldKey="phone" type="tel" isEditing={isEditing} form={form} handleChange={handleChange} />
              <Field label="Address" fieldKey="address" isEditing={isEditing} form={form} handleChange={handleChange} />
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Work Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Department" fieldKey="department" isEditing={isEditing} form={form} handleChange={handleChange} />
                <Field label="Designation" fieldKey="designation" isEditing={isEditing} form={form} handleChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Joining Date" fieldKey="joiningDate" type="date" isEditing={isEditing} form={form} handleChange={handleChange} />
                <Field label="Reporting Manager" fieldKey="reportingManager" isEditing={isEditing} form={form} handleChange={handleChange} />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Emergency Contact</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contact Name" fieldKey="emergencyContact" isEditing={isEditing} form={form} handleChange={handleChange} />
              <Field label="Contact Phone" fieldKey="emergencyPhone" type="tel" isEditing={isEditing} form={form} handleChange={handleChange} />
            </div>
          </section>

          {(employee.basicPay > 0 || employee.hra > 0 || employee.allowances > 0 || employee.deductions > 0) && (
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">💰 Payroll Summary</h3>
              <div className="grid grid-cols-2 gap-2">
                {[{ label: 'Basic Pay', value: employee.basicPay },{ label: 'HRA', value: employee.hra },{ label: 'Allowances', value: employee.allowances },{ label: 'Deductions', value: employee.deductions }].map(({ label, value }) => (
                  <div key={label} className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm font-semibold text-slate-200 mt-0.5">₹{(value || 0).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="pb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Account Info</h3>
            <div className="space-y-2">
              <InfoRow icon={Mail} label="Email" value={employee.email} />
              <InfoRow icon={Calendar} label="Account Created" value={employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function EmployeeDirectory() {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null)

  const loadEmployees = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchAllEmployees()
      setEmployees(data)
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to load employees'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { void loadEmployees() }, [])

  const departments = useMemo(() => [...new Set(employees.map(e => e.department).filter(Boolean))].sort(), [employees])
  const genders = useMemo(() => [...new Set(employees.map(e => e.gender).filter(Boolean))].sort(), [employees])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return employees.filter(e => {
      const matchSearch = !q || [e.name, e.employeeId, e.department, e.designation, e.email].some(v => String(v || '').toLowerCase().includes(q))
      const matchDept = !filterDept || e.department === filterDept
      const matchGender = !filterGender || e.gender === filterGender
      return matchSearch && matchDept && matchGender
    })
  }, [employees, search, filterDept, filterGender])

  const stats = useMemo(() => ({
    total: employees.length,
    departments: new Set(employees.map(e => e.department).filter(Boolean)).size,
    verified: employees.filter(e => e.isVerified).length,
  }), [employees])

  const handleSaved = (updated: EmployeeProfile) => {
    setEmployees(prev => prev.map(e => e._id === updated._id ? updated : e))
    setSelectedEmployee(updated)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Employee Directory</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage and view all employee profiles</p>
        </div>
        <button onClick={loadEmployees} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Employees', value: stats.total, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
          { label: 'Departments', value: stats.departments, icon: Building2, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Verified', value: stats.verified, icon: UserCheck, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-4 ${bg} flex items-center gap-4`}>
            <div className="p-2.5 rounded-xl bg-slate-900/50">
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, ID, department, designation, email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>}
          </div>

          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="pl-9 pr-8 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer min-w-[160px]">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="pl-9 pr-8 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer min-w-[130px]">
              <option value="">All Genders</option>
              {genders.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>

          {(filterDept || filterGender) && (
            <button onClick={() => { setFilterDept(''); setFilterGender('') }} className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-slate-400 hover:text-slate-200 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {!isLoading && (
          <p className="text-xs text-slate-500 mt-3">
            Showing <span className="text-slate-300 font-semibold">{filtered.length}</span> of <span className="text-slate-300 font-semibold">{employees.length}</span> employees
            {(search || filterDept || filterGender) && <span className="text-cyan-500 ml-1">• Filtered</span>}
          </p>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
          <p className="text-slate-400 text-sm">Loading employees…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-4">
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <div className="text-center">
            <p className="text-slate-200 font-semibold">Failed to load employees</p>
            <p className="text-slate-400 text-sm mt-1">{error}</p>
          </div>
          <button onClick={loadEmployees} className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors">
            Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700">
            <Users className="w-10 h-10 text-slate-500" />
          </div>
          <div className="text-center">
            <p className="text-slate-200 font-semibold">No employees found</p>
            <p className="text-slate-400 text-sm mt-1">{employees.length === 0 ? 'No employees have been registered yet.' : 'Try adjusting your search or filters.'}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(employee => (
            <EmployeeCard key={employee._id} employee={employee} onClick={() => setSelectedEmployee(employee)} />
          ))}
        </div>
      )}

      {selectedEmployee && (
        <ManagementPanel employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} onSaved={handleSaved} />
      )}
    </div>
  )
}