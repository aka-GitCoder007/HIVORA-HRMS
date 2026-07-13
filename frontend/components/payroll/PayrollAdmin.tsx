'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit2, Save, X, Search, Loader2 } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'
import { fetchAllPayroll, updatePayroll } from '@/lib/api'
import { toast } from 'sonner'

export function PayrollAdmin() {
  const [salaries, setSalaries] = useState<Record<string, any>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [employees, setEmployees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to load payroll data')
      } finally {
        setIsLoading(false)
      }
    }

    void loadPayroll()
  }, [])

  const normalizedSearch = searchQuery.trim().toLowerCase()

  const filteredEmployees = employees.filter((emp: any) => {
    const employeeName = String(emp?.employeeName || '').toLowerCase()
    const employeeId = String(emp?.employeeId || '').toLowerCase()
    const department = String(emp?.department || '').toLowerCase()

    return (
      !normalizedSearch ||
      employeeName.includes(normalizedSearch) ||
      employeeId.includes(normalizedSearch) ||
      department.includes(normalizedSearch)
    )
  })

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
          basicPay: Number(editData.basicPay || 0),
          hra: Number(editData.hra || 0),
          allowances: Number(editData.allowances || 0),
          deductions: Number(editData.deductions || 0),
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
        setSalaries(salaryMap)
        toast.success('Payroll updated successfully')
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to update payroll')
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

  const handleDownloadAllPayslips = () => {
    try {
      const doc = new jsPDF()

      // Company Header
      doc.setFontSize(22)
      doc.setTextColor(41, 128, 185) // Brand color
      doc.text('ABCD Company', 14, 20)

      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text('123 Tech Park, Innovation Hub', 14, 26)
      doc.text('contact@hivora.com | +91 98765 43210', 14, 31)

      // Divider Line
      doc.setDrawColor(200, 200, 200)
      doc.line(14, 36, 196, 36)

      // Document Title & Info
      doc.setFontSize(16)
      doc.setTextColor(50)
      doc.text('All Employees Payslips Summary', 14, 46)

      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 52)

      const totalEmployees = filteredEmployees.length
      const totalPayroll = filteredEmployees.reduce((acc, emp) => acc + (salaries[emp.employeeId]?.netPay || 0), 0)

      doc.text(`Total Employees: ${totalEmployees}`, 14, 58)
      doc.text(`Total Payroll: Rs. ${totalPayroll.toLocaleString('en-IN')}`, 14, 64)

      const tableColumn = ["Employee Name", "ID", "Department", "Basic Pay", "HRA", "Allowances", "Deductions", "Net Pay"]
      const tableRows: any[] = []

      filteredEmployees.forEach(employee => {
        const salary = salaries[employee.employeeId] || {}
        const employeeData = [
          employee.employeeName || '-',
          employee.employeeId || '-',
          employee.department || '-',
          `Rs. ${(salary.basicPay || 0).toLocaleString('en-IN')}`,
          `Rs. ${(salary.hra || 0).toLocaleString('en-IN')}`,
          `Rs. ${(salary.allowances || 0).toLocaleString('en-IN')}`,
          `Rs. ${(salary.deductions || 0).toLocaleString('en-IN')}`,
          `Rs. ${(salary.netPay || 0).toLocaleString('en-IN')}`,
        ]
        tableRows.push(employeeData)
      })

      // @ts-ignore
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 72,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 4, textColor: [60, 60, 60] },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      })

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.setTextColor(150)
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' })
      }

      doc.save(`payroll_summary_${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success('Payslips downloaded successfully')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    }
  }

  const handleExportToExcel = async () => {
    try {
      const wb = new ExcelJS.Workbook()
      wb.creator = 'ABCD Company'
      wb.created = new Date()

      const ws = wb.addWorksheet('Payroll Summary', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
        views: [{ state: 'frozen', ySplit: 7 }],
      })

      // ── Column widths ──
      ws.columns = [
        { width: 24 }, // Employee Name
        { width: 18 }, // Employee ID
        { width: 20 }, // Department
        { width: 20 }, // Designation
        { width: 14 }, // Basic Pay
        { width: 12 }, // HRA
        { width: 14 }, // Allowances
        { width: 14 }, // Deductions
        { width: 14 }, // Net Pay
      ]

      // ── Helpers ──
      const brandBlue  = '2980B9' // cyan-ish blue  — site header colour
      const brandDark  = '1A2A4A' // dark navy       — site background tone
      const accentCyan = '17A2C4' // cyan accent
      const white      = 'FFFFFF'
      const lightGray  = 'F0F4FA'
      const midGray    = 'D8E2EF'
      const textDark   = '1E293B'
      const greenText  = '16A34A'
      const redText    = 'DC2626'

      const applyBorder = (row: ExcelJS.Row, style: ExcelJS.BorderStyle = 'thin', color = midGray) => {
        row.eachCell({ includeEmpty: true }, cell => {
          cell.border = {
            top:    { style, color: { argb: color } },
            left:   { style, color: { argb: color } },
            bottom: { style, color: { argb: color } },
            right:  { style, color: { argb: color } },
          }
        })
      }

      // ── Row 1: Company banner ──
      ws.mergeCells('A1:I1')
      const bannerRow = ws.getRow(1)
      bannerRow.height = 42
      const bannerCell = ws.getCell('A1')
      bannerCell.value = 'ABCD COMPANY'
      bannerCell.font  = { name: 'Calibri', size: 22, bold: true, color: { argb: white } }
      bannerCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: brandDark } }
      bannerCell.alignment = { vertical: 'middle', horizontal: 'center' }

      // ── Row 2: Subtitle ──
      ws.mergeCells('A2:I2')
      const subtitleRow = ws.getRow(2)
      subtitleRow.height = 24
      const subtitleCell = ws.getCell('A2')
      subtitleCell.value = 'PAYROLL SUMMARY REPORT'
      subtitleCell.font  = { name: 'Calibri', size: 13, bold: true, color: { argb: accentCyan } }
      subtitleCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: brandDark } }
      subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' }

      // ── Row 3: divider ──
      ws.mergeCells('A3:I3')
      ws.getRow(3).height = 6
      ws.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: accentCyan } }

      // ── Row 4-5: Meta info ──
      const totalNetPayroll = filteredEmployees.reduce((acc, emp) => acc + (salaries[emp.employeeId]?.netPay || 0), 0)
      const metaStyle = (cell: ExcelJS.Cell) => {
        cell.font = { name: 'Calibri', size: 10, color: { argb: textDark } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightGray } }
      }

      const meta1 = ws.getRow(4)
      meta1.height = 18
      ws.getCell('A4').value = `Generated on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
      ws.getCell('E4').value = `Total Employees: ${filteredEmployees.length}`
      ws.getCell('G4').value = `Total Net Payroll: ₹${totalNetPayroll.toLocaleString('en-IN')}`
      ws.mergeCells('A4:D4'); ws.mergeCells('E4:F4'); ws.mergeCells('G4:I4')
      ;['A4','E4','G4'].forEach(ref => metaStyle(ws.getCell(ref)))

      ws.getRow(5).height = 6

      // ── Row 6: Column headers ──
      const headers = ['Employee Name', 'Employee ID', 'Department', 'Designation', 'Basic Pay (₹)', 'HRA (₹)', 'Allowances (₹)', 'Deductions (₹)', 'Net Pay (₹)']
      const headerRow = ws.getRow(6)
      headerRow.height = 28
      headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1)
        cell.value = h
        cell.font  = { name: 'Calibri', size: 10, bold: true, color: { argb: white } }
        cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: brandBlue } }
        cell.alignment = { vertical: 'middle', horizontal: i >= 4 ? 'right' : 'left' }
        cell.border = { bottom: { style: 'medium', color: { argb: accentCyan } } }
      })

      // ── Data rows ──
      filteredEmployees.forEach((employee, idx) => {
        const salary = salaries[employee.employeeId] || {}
        const isAlt  = idx % 2 === 1
        const rowData = [
          employee.employeeName  || '-',
          employee.employeeId    || '-',
          employee.department    || '-',
          employee.designation   || '-',
          salary.basicPay   || 0,
          salary.hra        || 0,
          salary.allowances || 0,
          salary.deductions || 0,
          salary.netPay     || 0,
        ]
        const dataRow = ws.addRow(rowData)
        dataRow.height = 20
        dataRow.eachCell({ includeEmpty: true }, (cell, colIdx) => {
          cell.font = { name: 'Calibri', size: 10, color: { argb: textDark } }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isAlt ? lightGray : white } }
          cell.alignment = { vertical: 'middle', horizontal: colIdx >= 5 ? 'right' : 'left' }
          // Highlight net pay column
          if (colIdx === 9) {
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: greenText } }
          }
          // Highlight deductions in red
          if (colIdx === 8) {
            cell.font = { name: 'Calibri', size: 10, color: { argb: redText } }
          }
          cell.border = {
            bottom: { style: 'hair', color: { argb: midGray } },
            right:  { style: 'hair', color: { argb: midGray } },
          }
        })
        applyBorder(dataRow, 'hair', midGray)
      })

      // ── Totals row ──
      const totalRow = ws.addRow([
        'TOTAL', '', '', '',
        filteredEmployees.reduce((s, e) => s + (salaries[e.employeeId]?.basicPay   || 0), 0),
        filteredEmployees.reduce((s, e) => s + (salaries[e.employeeId]?.hra         || 0), 0),
        filteredEmployees.reduce((s, e) => s + (salaries[e.employeeId]?.allowances  || 0), 0),
        filteredEmployees.reduce((s, e) => s + (salaries[e.employeeId]?.deductions  || 0), 0),
        totalNetPayroll,
      ])
      totalRow.height = 24
      totalRow.eachCell({ includeEmpty: true }, (cell, colIdx) => {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: white } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: brandDark } }
        cell.alignment = { vertical: 'middle', horizontal: colIdx >= 5 ? 'right' : 'left' }
        cell.border = { top: { style: 'medium', color: { argb: accentCyan } } }
      })

      // ── Footer note ──
      const footerRowNum = ws.rowCount + 2
      ws.mergeCells(`A${footerRowNum}:I${footerRowNum}`)
      const footerCell = ws.getCell(`A${footerRowNum}`)
      footerCell.value = 'This document is system-generated and confidential. Do not distribute without authorization.'
      footerCell.font  = { name: 'Calibri', size: 9, italic: true, color: { argb: '94A3B8' } }
      footerCell.alignment = { horizontal: 'center' }

      // ── Download ──
      const buffer = await wb.xlsx.writeBuffer()
      const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url    = URL.createObjectURL(blob)
      const a      = document.createElement('a')
      a.href       = url
      a.download   = `payroll_export_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Exported to Excel successfully')
    } catch (error) {
      console.error('Excel export error:', error)
      toast.error('Failed to export to Excel')
    }
  }

  const handleGenerateReport = () => {
    try {
      const doc = new jsPDF()
      const pageW = doc.internal.pageSize.width
      const pageH = doc.internal.pageSize.height

      // ─── Colour palette (matches site theme) ───
      const NAVY   : [number,number,number] = [26,  42,  74]
      const BLUE   : [number,number,number] = [41,  128, 185]
      const CYAN   : [number,number,number] = [23,  162, 196]
      const GREEN  : [number,number,number] = [22,  163, 74]
      const RED    : [number,number,number] = [220, 38,  38]
      const GRAY   : [number,number,number] = [148, 163, 184]
      const LTGRAY : [number,number,number] = [240, 244, 250]
      const WHITE  : [number,number,number] = [255, 255, 255]
      const TEXT   : [number,number,number] = [30,  41,  59]

      const addFooter = (pageNum: number, total: number) => {
        doc.setFontSize(8)
        doc.setTextColor(...GRAY)
        doc.text('ABCD Company — Confidential Payroll Report', 14, pageH - 10)
        doc.text(`Page ${pageNum} of ${total}`, pageW - 14, pageH - 10, { align: 'right' })
        doc.setDrawColor(...GRAY)
        doc.line(14, pageH - 14, pageW - 14, pageH - 14)
      }

      // ══════════════════════════════════════════
      //  PAGE 1 — Cover
      // ══════════════════════════════════════════

      // Header band
      doc.setFillColor(...NAVY)
      doc.rect(0, 0, pageW, 60, 'F')

      // Cyan accent stripe
      doc.setFillColor(...CYAN)
      doc.rect(0, 60, pageW, 4, 'F')

      // Company name
      doc.setFontSize(28)
      doc.setTextColor(...WHITE)
      doc.setFont('helvetica', 'bold')
      doc.text('ABCD COMPANY', pageW / 2, 28, { align: 'center' })

      // Report title
      doc.setFontSize(14)
      doc.setTextColor(...CYAN)
      doc.setFont('helvetica', 'normal')
      doc.text('PAYROLL ANALYTICS REPORT', pageW / 2, 44, { align: 'center' })

      // Date
      doc.setFontSize(10)
      doc.setTextColor(...GRAY)
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageW / 2, 54, { align: 'center' })

      // ── KPI Cards ──
      const totalNet   = employees.reduce((s, e) => s + (salaries[e.employeeId]?.netPay     || 0), 0)
      const totalBasic = employees.reduce((s, e) => s + (salaries[e.employeeId]?.basicPay   || 0), 0)
      const totalDed   = employees.reduce((s, e) => s + (salaries[e.employeeId]?.deductions || 0), 0)
      const avgNet     = employees.length ? Math.round(totalNet / employees.length) : 0

      const kpis = [
        { label: 'Total Employees',    value: String(employees.length),                   color: BLUE  },
        { label: 'Total Net Payroll',  value: `Rs. ${totalNet.toLocaleString('en-IN')}`,  color: GREEN },
        { label: 'Total Deductions',   value: `Rs. ${totalDed.toLocaleString('en-IN')}`,  color: RED   },
        { label: 'Avg. Net Salary',    value: `Rs. ${avgNet.toLocaleString('en-IN')}`,    color: CYAN  },
      ]

      const cardW = (pageW - 28 - 9) / 4
      kpis.forEach((kpi, i) => {
        const x = 14 + i * (cardW + 3)
        const y = 76
        doc.setFillColor(...LTGRAY)
        doc.roundedRect(x, y, cardW, 34, 3, 3, 'F')
        doc.setFillColor(...kpi.color)
        doc.rect(x, y, 3, 34, 'F')
        doc.setFontSize(7)
        doc.setTextColor(...GRAY)
        doc.setFont('helvetica', 'normal')
        doc.text(kpi.label.toUpperCase(), x + 8, y + 10)
        doc.setFontSize(11)
        doc.setTextColor(...TEXT)
        doc.setFont('helvetica', 'bold')
        doc.text(kpi.value, x + 8, y + 24)
      })

      // ── Section: Department Breakdown ──
      const deptMap: Record<string, { count: number; net: number; basic: number; deductions: number }> = {}
      employees.forEach(emp => {
        const dept = emp.department || 'Unknown'
        const sal  = salaries[emp.employeeId] || {}
        if (!deptMap[dept]) deptMap[dept] = { count: 0, net: 0, basic: 0, deductions: 0 }
        deptMap[dept].count++
        deptMap[dept].net        += sal.netPay     || 0
        deptMap[dept].basic      += sal.basicPay   || 0
        deptMap[dept].deductions += sal.deductions || 0
      })

      const deptRows = Object.entries(deptMap)
        .sort((a, b) => b[1].net - a[1].net)
        .map(([dept, d]) => [
          dept,
          String(d.count),
          `Rs. ${d.basic.toLocaleString('en-IN')}`,
          `Rs. ${d.deductions.toLocaleString('en-IN')}`,
          `Rs. ${d.net.toLocaleString('en-IN')}`,
          `${totalNet ? ((d.net / totalNet) * 100).toFixed(1) : 0}%`,
        ])

      doc.setFontSize(11)
      doc.setTextColor(...NAVY)
      doc.setFont('helvetica', 'bold')
      doc.text('Department-wise Payroll Breakdown', 14, 128)
      doc.setDrawColor(...CYAN)
      doc.setLineWidth(0.5)
      doc.line(14, 131, pageW - 14, 131)

      autoTable(doc, {
        head: [['Department', 'Headcount', 'Basic Pay', 'Deductions', 'Net Pay', '% of Total']],
        body: deptRows,
        startY: 135,
        theme: 'grid',
        styles:          { fontSize: 8, cellPadding: 3, textColor: TEXT },
        headStyles:      { fillColor: BLUE, textColor: WHITE, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LTGRAY },
        columnStyles:    { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' }, 5: { halign: 'center' } },
      })

      // ══════════════════════════════════════════
      //  PAGE 2 — Top Earners & Salary Distribution
      // ══════════════════════════════════════════
      doc.addPage()

      // Header stripe on page 2
      doc.setFillColor(...NAVY)
      doc.rect(0, 0, pageW, 18, 'F')
      doc.setFontSize(10)
      doc.setTextColor(...WHITE)
      doc.setFont('helvetica', 'bold')
      doc.text('ABCD COMPANY — Payroll Analytics Report', pageW / 2, 12, { align: 'center' })
      doc.setFillColor(...CYAN)
      doc.rect(0, 18, pageW, 2, 'F')

      // ── Top 10 Earners ──
      const top10 = [...employees]
        .sort((a, b) => (salaries[b.employeeId]?.netPay || 0) - (salaries[a.employeeId]?.netPay || 0))
        .slice(0, 10)
        .map((emp, i) => {
          const sal = salaries[emp.employeeId] || {}
          return [
            String(i + 1),
            emp.employeeName  || '-',
            emp.department    || '-',
            emp.designation   || '-',
            `Rs. ${(sal.basicPay || 0).toLocaleString('en-IN')}`,
            `Rs. ${(sal.netPay  || 0).toLocaleString('en-IN')}`,
          ]
        })

      doc.setFontSize(11)
      doc.setTextColor(...NAVY)
      doc.setFont('helvetica', 'bold')
      doc.text('Top 10 Earners', 14, 30)
      doc.setDrawColor(...CYAN)
      doc.line(14, 33, pageW - 14, 33)

      autoTable(doc, {
        head: [['#', 'Employee Name', 'Department', 'Designation', 'Basic Pay', 'Net Pay']],
        body: top10,
        startY: 37,
        theme: 'grid',
        styles:          { fontSize: 8, cellPadding: 3, textColor: TEXT },
        headStyles:      { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LTGRAY },
        columnStyles:    { 0: { halign: 'center', cellWidth: 8 }, 4: { halign: 'right' }, 5: { halign: 'right', fontStyle: 'bold', textColor: GREEN } },
      })

      // ── Salary Bands Distribution ──
      const bands = [
        { label: 'Below Rs. 20,000',              min: 0,      max: 19999  },
        { label: 'Rs. 20,000 – Rs. 40,000',       min: 20000,  max: 39999  },
        { label: 'Rs. 40,000 – Rs. 60,000',       min: 40000,  max: 59999  },
        { label: 'Rs. 60,000 – Rs. 1,00,000',     min: 60000,  max: 99999  },
        { label: 'Above Rs. 1,00,000',             min: 100000, max: Infinity },
      ]

      const bandRows = bands.map(b => {
        const emps = employees.filter(e => {
          const n = salaries[e.employeeId]?.netPay || 0
          return n >= b.min && n <= b.max
        })
        const pct = employees.length ? ((emps.length / employees.length) * 100).toFixed(1) : '0'
        return [b.label, String(emps.length), `${pct}%`]
      })

      const afterTop10Y = (doc as any).lastAutoTable.finalY + 10
      doc.setFontSize(11)
      doc.setTextColor(...NAVY)
      doc.setFont('helvetica', 'bold')
      doc.text('Salary Band Distribution', 14, afterTop10Y)
      doc.setDrawColor(...CYAN)
      doc.line(14, afterTop10Y + 3, pageW - 14, afterTop10Y + 3)

      autoTable(doc, {
        head: [['Salary Band', 'No. of Employees', '% of Workforce']],
        body: bandRows,
        startY: afterTop10Y + 7,
        theme: 'grid',
        styles:          { fontSize: 8, cellPadding: 3, textColor: TEXT },
        headStyles:      { fillColor: CYAN, textColor: WHITE, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LTGRAY },
        columnStyles:    { 1: { halign: 'center' }, 2: { halign: 'center' } },
      })

      // ── Add footers to all pages ──
      const totalPages = (doc as any).internal.getNumberOfPages()
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p)
        addFooter(p, totalPages)
      }

      doc.save(`payroll_report_${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success('Report generated successfully')
    } catch (error) {
      console.error('Report generation error:', error)
      toast.error('Failed to generate report')
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
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-foreground/50">
                    No employees found matching your search.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee: any) => {
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button variant="outline" className="w-full" onClick={handleDownloadAllPayslips}>
            Download All Payslips
          </Button>
          <Button variant="outline" className="w-full" onClick={handleExportToExcel}>
            Export to Excel
          </Button>
          <Button variant="outline" className="w-full" onClick={handleGenerateReport}>
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  )
}
