'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { MainLayout } from '@/components/MainLayout'
import { ProfileView } from '@/components/profile/ProfileView'
import { AttendanceEmployee } from '@/components/attendance/AttendanceEmployee'
import { AttendanceAdmin } from '@/components/attendance/AttendanceAdmin'
import { LeaveEmployee } from '@/components/leave/LeaveEmployee'
import { LeaveAdmin } from '@/components/leave/LeaveAdmin'
import { PayrollEmployee } from '@/components/payroll/PayrollEmployee'
import { PayrollAdmin } from '@/components/payroll/PayrollAdmin'
import { EmployeeDirectory } from '@/components/admin/EmployeeDirectory'

export default function Dashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentSection, setCurrentSection] = useState('Profile')

  useEffect(() => {
    if (!user) {
      router.replace('/')
    }
  }, [router, user])

  if (!user) {
    return null
  }

  const renderContent = () => {
    switch (currentSection) {
      case 'Profile':
        return <ProfileView isAdmin={user.role === 'admin'} />
      case 'Attendance':
        return user.role === 'employee' ? (
          <AttendanceEmployee employeeId={user.id} />
        ) : (
          <AttendanceAdmin />
        )
      case 'Leave':
        return user.role === 'employee' ? (
          <LeaveEmployee employeeId={user.id} />
        ) : (
          <LeaveAdmin />
        )
      case 'Payroll':
        return user.role === 'employee' ? (
          <PayrollEmployee employeeId={user.id} />
        ) : (
          <PayrollAdmin />
        )
      case 'Employee Directory':
        return user.role === 'admin' ? <EmployeeDirectory /> : null
      default:
        return null
    }
  }

  return (
    <ProtectedRoute>
      <main className="flex flex-col h-screen bg-white dark:bg-slate-950">
        <MainLayout
          currentUser={user}
          activeSection={currentSection}
          onSectionChange={setCurrentSection}
        >
          {renderContent()}
        </MainLayout>
      </main>
    </ProtectedRoute>
  )
}
