'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit2, Save, X, Search } from 'lucide-react'
import { fetchAllPayroll, updatePayroll } from '@/lib/api'

export function PayrollAdmin() {
  const [salaries, setSalaries] = useState<Record<string, any>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [employees, setEmployees] = useState<any[]>([])

  useEffect(() => {
    const loadPayroll = async () => {
      try {
        const data = await fetchAllPayroll()
        setEmployees(data)
        const salaryMap = data.reduce((acc: Record<string, any>, employee: any) => {
          acc[employee.employeeId] = employee
          return acc
        }, {})
        setSalaries(salaryMap)
      } catch (error) {
        console.error(error)
      }
    }

    void loadPayroll()
  }, [])

  const filteredEmployees = employees.filter((emp: any) =>
    emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (employeeId: string, recordId?: string) => {
    const salary = salaries[employeeId]
    setEditingId(recordId || employeeId)
    setEditData({ ...salary })
  }

  const handleSave = async () => {
    if (editData && editingId) {
      try {
        const updatedSalary =
          Number(editData.basicPay || 0) +
          Number(editData.hra || 0) +
          Number(editData.allowances || 0) -
          Number(editData.deductions || 0)

        await updatePayroll(editingId, {
          salary: updatedSalary,
          department: editData.department,
          designation: editData.designation,
        })

        const updatedEmployees = employees.map((employee) => {
          if (employee.id !== editingId) return employee

          return {
            ...employee,
            ...editData,
            basicPay: Number(editData.basicPay || 0),
            hra: Number(editData.hra || 0),
            allowances: Number(editData.allowances || 0),
            deductions: Number(editData.deductions || 0),
            netPay: updatedSalary,
            department: editData.department || employee.department,
            designation: editData.designation || employee.designation,
          }
        })

        setEmployees(updatedEmployees)
        const salaryMap = updatedEmployees.reduce((acc: Record<string, any>, employee: any) => {
          acc[employee.employeeId] = employee
          return acc
        }, {})
        setSalaries(salaryMap)
      } catch (error) {
        console.error(error)
      }
      setEditingId(null)
      setEditData(null)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData(null)
  }

  const handleInputChange = (field: string, value: number) => {
    if (editData) {
      setEditData({ ...editData, [field]: value })
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Bar */}
      <div className="bg-card border border-border rounded-xl p-6">
        <label className="block text-sm font-medium mb-3">Search Employees</label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-foreground/50" />
          <input
            type="text"
            placeholder="Search by name, ID, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-4 px-6 font-semibold">Employee Name</th>
                <th className="text-left py-4 px-6 font-semibold">Employee ID</th>
                <th className="text-left py-4 px-6 font-semibold">Basic Pay</th>
                <th className="text-left py-4 px-6 font-semibold">HRA</th>
                <th className="text-left py-4 px-6 font-semibold">Allowances</th>
                <th className="text-left py-4 px-6 font-semibold">Deductions</th>
                <th className="text-left py-4 px-6 font-semibold">Net Pay</th>
                <th className="text-left py-4 px-6 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee: any) => {
                const salary = salaries[employee.employeeId]
                const recordId = employee.id || employee.employeeId
                const isEditing = editingId === recordId

                return (
                  <tr key={recordId} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-6 text-foreground font-medium">{employee.employeeName}</td>
                    <td className="py-4 px-6 text-foreground/70 text-xs font-mono bg-muted/30 rounded w-fit">
                      {employee.employeeId}
                    </td>

                    {isEditing && editData ? (
                      <>
                        <td className="py-4 px-6">
                          <input
                            type="number"
                            value={editData.basicPay}
                            onChange={(e) => handleInputChange('basicPay', Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <input
                            type="number"
                            value={editData.hra}
                            onChange={(e) => handleInputChange('hra', Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <input
                            type="number"
                            value={editData.allowances}
                            onChange={(e) => handleInputChange('allowances', Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <input
                            type="number"
                            value={editData.deductions}
                            onChange={(e) => handleInputChange('deductions', Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-4 px-6 font-semibold text-blue-600">
                          ₹
                          {(
                            editData.basicPay +
                            editData.hra +
                            editData.allowances -
                            editData.deductions
                          ).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={handleSave}
                              className="p-1.5 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-1.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-6 text-foreground">₹{(salary?.basicPay || 0).toLocaleString()}</td>
                        <td className="py-4 px-6 text-foreground">₹{(salary?.hra || 0).toLocaleString()}</td>
                        <td className="py-4 px-6 text-foreground">₹{(salary?.allowances || 0).toLocaleString()}</td>
                        <td className="py-4 px-6 text-foreground">₹{(salary?.deductions || 0).toLocaleString()}</td>
                        <td className="py-4 px-6 font-semibold text-blue-600">₹{(salary?.netPay || 0).toLocaleString()}</td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleEdit(employee.employeeId, recordId)}
                            className="p-1.5 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button variant="outline" className="w-full">
            Download All Payslips
          </Button>
          <Button variant="outline" className="w-full">
            Export to Excel
          </Button>
          <Button variant="outline" className="w-full">
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  )
}
