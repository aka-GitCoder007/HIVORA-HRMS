'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, DollarSign } from 'lucide-react'
import { fetchMyPayroll } from '@/lib/api'
import { useAuth } from '@/lib/authContext'
import { toast } from 'sonner'
import { Loader2, FileX } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface PayrollEmployeeProps {
  employeeId?: string
}

export function PayrollEmployee({ employeeId = '' }: PayrollEmployeeProps) {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [payroll, setPayroll] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPayroll = async () => {
      try {
        const data = await fetchMyPayroll()
        setPayroll(data)
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to load payroll data')
      } finally {
        setIsLoading(false)
      }
    }

    void loadPayroll()
  }, [])

  const currentEmployee = user
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const displayPayslip = payroll

  const handleDownloadPayslip = () => {
    if (!displayPayslip) {
      toast.error('No payslip data to download')
      return
    }
    
    try {
      const doc = new jsPDF()
      
      doc.setFontSize(18)
      doc.text('Employee Payslip', 14, 22)
      
      doc.setFontSize(11)
      doc.setTextColor(100)
      doc.text(`For: ${monthNames[selectedMonth]} ${selectedYear}`, 14, 30)
      doc.text(`Employee: ${currentEmployee?.name} (${currentEmployee?.employeeId || employeeId})`, 14, 37)

      const totalEarnings = (displayPayslip.basicPay || 0) + (displayPayslip.hra || 0) + (displayPayslip.allowances || 0)
      const totalDeductions = (displayPayslip.deductions || 0)

      const tableRows = [
        ['Basic Pay', `Rs. ${(displayPayslip.basicPay || 0).toLocaleString()}`],
        ['HRA', `Rs. ${(displayPayslip.hra || 0).toLocaleString()}`],
        ['Allowances', `Rs. ${(displayPayslip.allowances || 0).toLocaleString()}`],
        ['Total Earnings', `Rs. ${totalEarnings.toLocaleString()}`],
        ['', ''], // Empty row for visual separation
        ['Deductions', `Rs. ${totalDeductions.toLocaleString()}`],
        ['', ''], // Empty row for visual separation
        ['Net Pay (Take Home)', `Rs. ${(displayPayslip.netPay || 0).toLocaleString()}`],
      ]

      autoTable(doc, {
        head: [['Description', 'Amount']],
        body: tableRows,
        startY: 45,
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 }
      })

      doc.save(`payslip_${monthNames[selectedMonth]}_${selectedYear}.pdf`)
      toast.success('Payslip downloaded successfully')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
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
              {Array.from({ length: new Date().getFullYear() - 2021 }, (_, i) => 2022 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
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
            <Button onClick={handleDownloadPayslip} className="bg-cyan-600 hover:bg-blue-700 text-white">
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
              <span className="font-semibold">₹{(Number(displayPayslip?.deductions ?? 0) || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 border-t border-border text-red-600 font-semibold">
              <span>Total Deductions</span>
              <span>₹{(Number(displayPayslip?.deductions ?? 0) || 0).toLocaleString()}</span>
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
            <div className="flex flex-col items-center justify-center py-8 text-foreground/50 border border-dashed border-border/50 rounded-lg">
              <FileX className="h-10 w-10 text-foreground/30 mb-2" />
              <p className="font-medium">No payroll data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
