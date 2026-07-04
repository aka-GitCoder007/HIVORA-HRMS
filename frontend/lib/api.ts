import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('ems_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

export function normalizeRole(role?: string): 'employee' | 'admin' {
  if (!role) return 'employee'

  const normalized = role.toLowerCase()
  if (normalized === 'hr' || normalized === 'admin' || normalized === 'administrator') {
    return 'admin'
  }

  return 'employee'
}

export function getInitials(name?: string) {
  if (!name) return 'U'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function normalizeUser(user: any) {
  return {
    id: user?._id || user?.id || user?.employeeId || '',
    employeeId: user?.employeeId || user?.id || '',
    name: user?.name || '',
    email: user?.email || '',
    role: normalizeRole(user?.role),
    avatar: user?.avatar || getInitials(user?.name),
    department: user?.department || '',
    designation: user?.designation || '',
    phone: user?.phone || '',
    address: user?.address || '',
    salary: user?.salary ?? 0,
    profilePicture: user?.profilePicture || '',
  }
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  department: string
  date: string
  checkInTime: string
  checkOutTime: string
  status: 'present' | 'absent' | 'half-day' | 'leave'
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  department: string
  type: 'paid' | 'sick' | 'unpaid'
  startDate: string
  endDate: string
  remarks: string
  status: 'pending' | 'approved' | 'rejected'
  adminComment?: string
  createdAt: string
}

export interface PayrollSummary {
  employeeId: string
  employeeName: string
  basicPay: number
  hra: number
  allowances: number
  deductions: number
  netPay: number
}

export interface SalaryStructure {
  employeeId: string
  basicPay: number
  hra: number
  allowances: number
  deductions: number
  netPay: number
}

export function normalizeAttendanceRecord(record: any): AttendanceRecord {
  const statusValue = String(record?.status || 'Present').toLowerCase()
  const normalizedStatus =
    statusValue === 'present'
      ? 'present'
      : statusValue === 'half-day' || statusValue === 'half day' || statusValue === 'half-day'
        ? 'half-day'
        : statusValue === 'leave'
          ? 'leave'
          : 'absent'

  return {
    id: record?._id || record?.id || '',
    employeeId: record?.employee?.employeeId || record?.employeeId || '',
    employeeName: record?.employee?.name || '',
    department: record?.employee?.department || '',
    date: record?.date || '',
    checkInTime: record?.checkIn || '',
    checkOutTime: record?.checkOut || '',
    status: normalizedStatus as AttendanceRecord['status'],
  }
}

export function normalizeLeaveRequest(record: any): LeaveRequest {
  const normalizedType = String(record?.leaveType || record?.type || '').toLowerCase()
  const type = normalizedType === 'sick' ? 'sick' : normalizedType === 'unpaid' ? 'unpaid' : 'paid'

  const normalizedStatus = String(record?.status || '').toLowerCase()
  const status =
    normalizedStatus === 'approved'
      ? 'approved'
      : normalizedStatus === 'rejected'
        ? 'rejected'
        : 'pending'

  return {
    id: record?._id || record?.id || '',
    employeeId: record?.employee?.employeeId || record?.employeeId || '',
    employeeName: record?.employee?.name || '',
    department: record?.employee?.department || '',
    type,
    startDate: record?.startDate ? new Date(record.startDate).toISOString().split('T')[0] : '',
    endDate: record?.endDate ? new Date(record.endDate).toISOString().split('T')[0] : '',
    remarks: record?.remarks || '',
    status,
    adminComment: record?.hrComment || '',
    createdAt: record?.createdAt ? new Date(record.createdAt).toISOString().split('T')[0] : '',
  }
}

export function normalizePayrollSummary(user: any): PayrollSummary & { id: string; department?: string; designation?: string } {
  const salaryValue = Number(user?.salary ?? 0)
  return {
    id: user?._id || user?.id || '',
    employeeId: user?.employeeId || user?.id || '',
    employeeName: user?.name || '',
    basicPay: salaryValue,
    hra: 0,
    allowances: 0,
    deductions: 0,
    netPay: salaryValue,
    department: user?.department || '',
    designation: user?.designation || '',
  }
}

export async function getCurrentUser() {
  const { data } = await apiClient.get('/auth/me')
  return data
}

export async function loginUser(payload: { email: string; password: string }) {
  const { data } = await apiClient.post('/auth/login', payload)
  return data
}

export async function signupUser(payload: { employeeId: string; name: string; email: string; password: string; role: 'Employee' | 'HR' }) {
  const { data } = await apiClient.post('/auth/signup', payload)
  return data
}

export async function sendOtp(payload: { email: string }) {
  const { data } = await apiClient.post('/otp/send', payload)
  return data
}

export async function verifyOtp(payload: { email: string; otp: string }) {
  const { data } = await apiClient.post('/otp/verify', payload)
  return data
}

export async function fetchProfile() {
  const { data } = await apiClient.get('/profile')
  return data
}

export async function updateProfile(payload: { address?: string; phone?: string; profilePicture?: string }) {
  const { data } = await apiClient.put('/profile', payload)
  return data
}

export async function fetchMyAttendance() {
  const { data } = await apiClient.get('/attendance/my-attendance')
  return (data.attendance || []).map(normalizeAttendanceRecord)
}

export async function fetchAllAttendance() {
  const { data } = await apiClient.get('/attendance/all')
  return (data.attendance || []).map(normalizeAttendanceRecord)
}

export async function checkInAttendance() {
  const { data } = await apiClient.post('/attendance/checkin')
  return data
}

export async function checkOutAttendance() {
  const { data } = await apiClient.post('/attendance/checkout')
  return data
}

export async function fetchMyLeaves() {
  const { data } = await apiClient.get('/leave/my-leaves')
  return (data.leaves || []).map(normalizeLeaveRequest)
}

export async function fetchAllLeaves() {
  const { data } = await apiClient.get('/leave/all')
  return (data.leaves || []).map(normalizeLeaveRequest)
}

export async function applyLeave(payload: { leaveType: 'Paid' | 'Sick' | 'Unpaid'; startDate: string; endDate: string; remarks: string }) {
  const { data } = await apiClient.post('/leave/apply', payload)
  return data
}

export async function updateLeaveStatus(id: string, payload: { status: 'Approved' | 'Rejected'; hrComment?: string }) {
  const { data } = await apiClient.put(`/leave/${id}`, payload)
  return data
}

export async function fetchMyPayroll() {
  const { data } = await apiClient.get('/payroll/my')
  return normalizePayrollSummary(data.payroll || {})
}

export async function fetchAllPayroll() {
  const { data } = await apiClient.get('/payroll/all')
  return (data.employees || []).map(normalizePayrollSummary)
}

export async function updatePayroll(id: string, payload: { salary?: number; department?: string; designation?: string }) {
  const { data } = await apiClient.put(`/payroll/${id}`, payload)
  return data
}

export async function fetchDashboard() {
  const { data } = await apiClient.get('/dashboard/employee')
  return data
}

export async function fetchHrDashboard() {
  const { data } = await apiClient.get('/dashboard/hr')
  return data
}
