// Mock Data for Employee Management System

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  role: 'employee' | 'admin'
  employeeId: string
  designation: string
  department: string
  joiningDate: string
  reportingManager: string
  avatar?: string
  dob: string
  gender: string
  address: string
  emergencyContact: string
  emergencyPhone: string
}

export interface SalaryStructure {
  employeeId: string
  basicPay: number
  hra: number
  allowances: number
  deductions: number
  netPay: number
}

export interface AttendanceRecord {
  employeeId: string
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: 'present' | 'absent' | 'half-day' | 'leave'
}

export interface LeaveRequest {
  id: string
  employeeId: string
  type: 'paid' | 'sick' | 'unpaid'
  startDate: string
  endDate: string
  remarks: string
  status: 'pending' | 'approved' | 'rejected'
  adminComment?: string
  createdAt: string
}

export interface Payslip {
  id: string
  employeeId: string
  month: number
  year: number
  basicPay: number
  hra: number
  allowances: number
  deductions: number
  netPay: number
}

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Anderson',
    email: 'john.anderson@company.com',
    phone: '+1 (555) 123-4567',
    role: 'employee',
    employeeId: 'EMP001',
    designation: 'Senior Software Engineer',
    department: 'Engineering',
    joiningDate: '2021-03-15',
    reportingManager: 'Sarah Mitchell',
    dob: '1990-05-20',
    gender: 'Male',
    address: '123 Oak Street, San Francisco, CA 94102',
    emergencyContact: 'Emily Anderson',
    emergencyPhone: '+1 (555) 987-6543',
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@company.com',
    phone: '+1 (555) 234-5678',
    role: 'admin',
    employeeId: 'EMP002',
    designation: 'Engineering Manager',
    department: 'Engineering',
    joiningDate: '2020-01-10',
    reportingManager: 'David Chen',
    dob: '1988-08-15',
    gender: 'Female',
    address: '456 Maple Avenue, San Francisco, CA 94105',
    emergencyContact: 'Michael Mitchell',
    emergencyPhone: '+1 (555) 876-5432',
  },
  {
    id: '3',
    name: 'David Chen',
    email: 'david.chen@company.com',
    phone: '+1 (555) 345-6789',
    role: 'admin',
    employeeId: 'EMP003',
    designation: 'VP of Engineering',
    department: 'Engineering',
    joiningDate: '2019-06-01',
    reportingManager: 'CEO',
    dob: '1985-12-10',
    gender: 'Male',
    address: '789 Pine Road, San Francisco, CA 94103',
    emergencyContact: 'Lisa Chen',
    emergencyPhone: '+1 (555) 765-4321',
  },
  {
    id: '4',
    name: 'Jessica Williams',
    email: 'jessica.williams@company.com',
    phone: '+1 (555) 456-7890',
    role: 'employee',
    employeeId: 'EMP004',
    designation: 'Product Designer',
    department: 'Design',
    joiningDate: '2022-02-20',
    reportingManager: 'Marcus Johnson',
    dob: '1992-03-25',
    gender: 'Female',
    address: '321 Cedar Lane, San Francisco, CA 94104',
    emergencyContact: 'James Williams',
    emergencyPhone: '+1 (555) 654-3210',
  },
  {
    id: '5',
    name: 'Marcus Johnson',
    email: 'marcus.johnson@company.com',
    phone: '+1 (555) 567-8901',
    role: 'admin',
    employeeId: 'EMP005',
    designation: 'Design Lead',
    department: 'Design',
    joiningDate: '2020-09-05',
    reportingManager: 'David Chen',
    dob: '1987-07-18',
    gender: 'Male',
    address: '654 Birch Street, San Francisco, CA 94106',
    emergencyContact: 'Rachel Johnson',
    emergencyPhone: '+1 (555) 543-2109',
  },
  {
    id: '6',
    name: 'Amanda Foster',
    email: 'amanda.foster@company.com',
    phone: '+1 (555) 678-9012',
    role: 'employee',
    employeeId: 'EMP006',
    designation: 'Data Analyst',
    department: 'Analytics',
    joiningDate: '2023-01-15',
    reportingManager: 'Robert Martinez',
    dob: '1994-11-08',
    gender: 'Female',
    address: '987 Elm Street, San Francisco, CA 94107',
    emergencyContact: 'Thomas Foster',
    emergencyPhone: '+1 (555) 432-1098',
  },
  {
    id: '7',
    name: 'Robert Martinez',
    email: 'robert.martinez@company.com',
    phone: '+1 (555) 789-0123',
    role: 'admin',
    employeeId: 'EMP007',
    designation: 'Analytics Manager',
    department: 'Analytics',
    joiningDate: '2021-05-10',
    reportingManager: 'David Chen',
    dob: '1989-04-22',
    gender: 'Male',
    address: '147 Walnut Court, San Francisco, CA 94108',
    emergencyContact: 'Isabella Martinez',
    emergencyPhone: '+1 (555) 321-0987',
  },
  {
    id: '8',
    name: 'Sophia Lee',
    email: 'sophia.lee@company.com',
    phone: '+1 (555) 890-1234',
    role: 'employee',
    employeeId: 'EMP008',
    designation: 'Marketing Specialist',
    department: 'Marketing',
    joiningDate: '2022-08-01',
    reportingManager: 'Victoria Brown',
    dob: '1993-09-30',
    gender: 'Female',
    address: '258 Spruce Drive, San Francisco, CA 94109',
    emergencyContact: 'Kevin Lee',
    emergencyPhone: '+1 (555) 210-9876',
  },
]

export const mockSalaryStructures: Record<string, SalaryStructure> = {
  EMP001: {
    employeeId: 'EMP001',
    basicPay: 80000,
    hra: 16000,
    allowances: 12000,
    deductions: 8000,
    netPay: 100000,
  },
  EMP002: {
    employeeId: 'EMP002',
    basicPay: 120000,
    hra: 24000,
    allowances: 18000,
    deductions: 12000,
    netPay: 150000,
  },
  EMP003: {
    employeeId: 'EMP003',
    basicPay: 200000,
    hra: 40000,
    allowances: 30000,
    deductions: 20000,
    netPay: 250000,
  },
  EMP004: {
    employeeId: 'EMP004',
    basicPay: 75000,
    hra: 15000,
    allowances: 10000,
    deductions: 7000,
    netPay: 93000,
  },
  EMP005: {
    employeeId: 'EMP005',
    basicPay: 110000,
    hra: 22000,
    allowances: 16000,
    deductions: 11000,
    netPay: 137000,
  },
  EMP006: {
    employeeId: 'EMP006',
    basicPay: 65000,
    hra: 13000,
    allowances: 8000,
    deductions: 6000,
    netPay: 80000,
  },
  EMP007: {
    employeeId: 'EMP007',
    basicPay: 100000,
    hra: 20000,
    allowances: 15000,
    deductions: 10000,
    netPay: 125000,
  },
  EMP008: {
    employeeId: 'EMP008',
    basicPay: 60000,
    hra: 12000,
    allowances: 8000,
    deductions: 5000,
    netPay: 75000,
  },
}

export const mockAttendanceRecords: AttendanceRecord[] = [
  // John Anderson (EMP001)
  { employeeId: 'EMP001', date: '2024-01-08', checkInTime: '09:00 AM', checkOutTime: '05:30 PM', status: 'present' },
  { employeeId: 'EMP001', date: '2024-01-09', checkInTime: '09:15 AM', checkOutTime: '06:00 PM', status: 'present' },
  { employeeId: 'EMP001', date: '2024-01-10', checkInTime: '09:05 AM', checkOutTime: '01:00 PM', status: 'half-day' },
  { employeeId: 'EMP001', date: '2024-01-11', status: 'absent' },
  { employeeId: 'EMP001', date: '2024-01-12', checkInTime: '09:20 AM', checkOutTime: '05:45 PM', status: 'present' },

  // Sarah Mitchell (EMP002)
  { employeeId: 'EMP002', date: '2024-01-08', checkInTime: '08:50 AM', checkOutTime: '06:00 PM', status: 'present' },
  { employeeId: 'EMP002', date: '2024-01-09', checkInTime: '09:00 AM', checkOutTime: '06:15 PM', status: 'present' },
  { employeeId: 'EMP002', date: '2024-01-10', checkInTime: '09:10 AM', checkOutTime: '06:30 PM', status: 'present' },
  { employeeId: 'EMP002', date: '2024-01-11', checkInTime: '09:05 AM', checkOutTime: '05:00 PM', status: 'present' },
  { employeeId: 'EMP002', date: '2024-01-12', status: 'absent' },

  // Jessica Williams (EMP004)
  { employeeId: 'EMP004', date: '2024-01-08', status: 'leave' },
  { employeeId: 'EMP004', date: '2024-01-09', checkInTime: '09:30 AM', checkOutTime: '05:30 PM', status: 'present' },
  { employeeId: 'EMP004', date: '2024-01-10', checkInTime: '09:15 AM', checkOutTime: '05:45 PM', status: 'present' },
  { employeeId: 'EMP004', date: '2024-01-11', checkInTime: '09:00 AM', checkOutTime: '05:30 PM', status: 'present' },
  { employeeId: 'EMP004', date: '2024-01-12', checkInTime: '09:25 AM', checkOutTime: '06:00 PM', status: 'present' },

  // Amanda Foster (EMP006)
  { employeeId: 'EMP006', date: '2024-01-08', checkInTime: '09:10 AM', checkOutTime: '05:45 PM', status: 'present' },
  { employeeId: 'EMP006', date: '2024-01-09', checkInTime: '09:00 AM', checkOutTime: '05:30 PM', status: 'present' },
  { employeeId: 'EMP006', date: '2024-01-10', status: 'absent' },
  { employeeId: 'EMP006', date: '2024-01-11', checkInTime: '09:20 AM', checkOutTime: '05:50 PM', status: 'present' },
  { employeeId: 'EMP006', date: '2024-01-12', checkInTime: '09:05 AM', checkOutTime: '05:40 PM', status: 'present' },

  // Sophia Lee (EMP008)
  { employeeId: 'EMP008', date: '2024-01-08', checkInTime: '09:30 AM', checkOutTime: '06:00 PM', status: 'present' },
  { employeeId: 'EMP008', date: '2024-01-09', checkInTime: '09:15 AM', checkOutTime: '05:45 PM', status: 'present' },
  { employeeId: 'EMP008', date: '2024-01-10', checkInTime: '09:00 AM', checkOutTime: '05:30 PM', status: 'present' },
  { employeeId: 'EMP008', date: '2024-01-11', status: 'leave' },
  { employeeId: 'EMP008', date: '2024-01-12', checkInTime: '09:20 AM', checkOutTime: '06:15 PM', status: 'present' },
]

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    type: 'paid',
    startDate: '2024-02-05',
    endDate: '2024-02-09',
    remarks: 'Vacation time with family',
    status: 'pending',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    employeeId: 'EMP004',
    type: 'sick',
    startDate: '2024-01-10',
    endDate: '2024-01-10',
    remarks: 'Medical appointment',
    status: 'approved',
    adminComment: 'Approved. Please submit medical certificate.',
    createdAt: '2024-01-09',
  },
  {
    id: '3',
    employeeId: 'EMP006',
    type: 'unpaid',
    startDate: '2024-02-12',
    endDate: '2024-02-16',
    remarks: 'Personal work',
    status: 'rejected',
    adminComment: 'Cannot approve due to project deadline.',
    createdAt: '2024-01-20',
  },
  {
    id: '4',
    employeeId: 'EMP008',
    type: 'paid',
    startDate: '2024-01-11',
    endDate: '2024-01-11',
    remarks: 'Personal commitment',
    status: 'approved',
    adminComment: 'Approved',
    createdAt: '2024-01-08',
  },
  {
    id: '5',
    employeeId: 'EMP001',
    type: 'sick',
    startDate: '2024-01-25',
    endDate: '2024-01-26',
    remarks: 'Flu symptoms',
    status: 'pending',
    createdAt: '2024-01-24',
  },
]

export const mockPayslips: Payslip[] = [
  // John Anderson (EMP001)
  {
    id: '1',
    employeeId: 'EMP001',
    month: 12,
    year: 2023,
    basicPay: 80000,
    hra: 16000,
    allowances: 12000,
    deductions: 8000,
    netPay: 100000,
  },
  {
    id: '2',
    employeeId: 'EMP001',
    month: 11,
    year: 2023,
    basicPay: 80000,
    hra: 16000,
    allowances: 12000,
    deductions: 8000,
    netPay: 100000,
  },
  // Sarah Mitchell (EMP002)
  {
    id: '3',
    employeeId: 'EMP002',
    month: 12,
    year: 2023,
    basicPay: 120000,
    hra: 24000,
    allowances: 18000,
    deductions: 12000,
    netPay: 150000,
  },
  {
    id: '4',
    employeeId: 'EMP002',
    month: 11,
    year: 2023,
    basicPay: 120000,
    hra: 24000,
    allowances: 18000,
    deductions: 12000,
    netPay: 150000,
  },
  // Amanda Foster (EMP006)
  {
    id: '5',
    employeeId: 'EMP006',
    month: 12,
    year: 2023,
    basicPay: 65000,
    hra: 13000,
    allowances: 8000,
    deductions: 6000,
    netPay: 80000,
  },
  {
    id: '6',
    employeeId: 'EMP006',
    month: 11,
    year: 2023,
    basicPay: 65000,
    hra: 13000,
    allowances: 8000,
    deductions: 6000,
    netPay: 80000,
  },
]

export function getEmployeeById(id: string): Employee | undefined {
  return mockEmployees.find(e => e.id === id)
}

export function getEmployeeByEmployeeId(employeeId: string): Employee | undefined {
  return mockEmployees.find(e => e.employeeId === employeeId)
}

export function getAttendanceForEmployee(employeeId: string): AttendanceRecord[] {
  return mockAttendanceRecords.filter(r => r.employeeId === employeeId)
}

export function getLeaveRequestsForEmployee(employeeId: string): LeaveRequest[] {
  return mockLeaveRequests.filter(r => r.employeeId === employeeId)
}

export function getPayslipsForEmployee(employeeId: string): Payslip[] {
  return mockPayslips.filter(p => p.employeeId === employeeId)
}
