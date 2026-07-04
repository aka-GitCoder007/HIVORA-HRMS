'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, DollarSign } from 'lucide-react'
import { fetchMyPayroll } from '@/lib/api'
import { useAuth } from '@/lib/authContext'

interface PayrollEmployeeProps {
  employeeId?: string
}

export function PayrollEmployee({ employeeId = '' }: PayrollEmployeeProps) {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [payroll, setPayroll] = useState<any>(null)

  useEffect(() => {
    const loadPayroll = async () => {
      try {
        const data = await fetchMyPayroll()
        setPayroll(data)
      } catch (error) {
        console.error(error)
      }
    }

    void loadPayroll()
  }, [])

  const currentEmployee = user
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const displayPayslip = payroll

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-2">Payroll</h1>
        <p className="text-foreground/70">{currentEmployee?.name} ({currentEmployee?.employeeId || employeeId})</p>
      </div>

      {/* Month/Year Selector */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Select Month/Year</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {monthNames.map((month, idx) => (
                <option key={idx} value={idx}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payslip Card */}
      <div className="bg-card border border-border rounded-xl p-8">
        {/* Payslip Header */}
        <div className="border-b border-border pb-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">Payslip</h2>
              <p className="text-foreground/60 mt-1">
                {monthNames[selectedMonth]} {selectedYear}
              </p>
            </div>
            <Button className="bg-cyan-600 hover:bg-blue-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Download Payslip
            </Button>
          </div>

          <div className="grid grid-cols-2 text-sm">
            <div>
              <p className="text-foreground/60">Employee Name</p>
              <p className="font-semibold text-foreground">{currentEmployee?.name}</p>
            </div>
            <div>
              <p className="text-foreground/60">Employee ID</p>
              <p className="font-semibold text-foreground font-mono">{currentEmployee?.employeeId || employeeId}</p>
            </div>
          </div>
        </div>

        {/* Earnings */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-green-600">Earnings</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-foreground/70">Basic Pay</span>
              <span className="font-semibold">₹{(displayPayslip?.basicPay || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-foreground/70">HRA (House Rent Allowance)</span>
              <span className="font-semibold">₹{(displayPayslip?.hra || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 pb-3 border-b border-border">
              <span className="text-foreground/70">Allowances</span>
              <span className="font-semibold">₹{(displayPayslip?.allowances || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 text-green-600 font-semibold">
              <span>Total Earnings</span>
              <span>
                ₹
                {(
                  (displayPayslip?.basicPay || 0) +
                  (displayPayslip?.hra || 0) +
                  (displayPayslip?.allowances || 0)
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-red-600">Deductions</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-foreground/70">Tax & Other Deductions</span>
              <span className="font-semibold">₹{(displayPayslip?.deductions || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 border-t border-border text-red-600 font-semibold">
              <span>Total Deductions</span>
              <span>₹{displayPayslip?.deductions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-foreground/70">Net Pay (Take Home)</p>
              <p className="text-2xl font-bold text-blue-600">₹{(displayPayslip?.netPay || 0).toLocaleString()}</p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-400/30" />
          </div>
        </div>
      </div>

      {/* Previous Payslips */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Previous Payslips</h2>

        <div className="space-y-2">
          {payroll ? (
            <button
              className="w-full text-left px-4 py-3 rounded-lg border transition-colors bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {monthNames[selectedMonth]} {selectedYear}
                </span>
                <span className="text-foreground/60">₹{(payroll.netPay || 0).toLocaleString()}</span>
              </div>
            </button>
          ) : (
            <p className="text-foreground/60">No payroll data available.</p>
          )}
        </div>
      </div>
    </div>
  )
}
