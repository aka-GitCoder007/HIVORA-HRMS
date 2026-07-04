interface StatusBadgeProps {
  status: 'present' | 'absent' | 'half-day' | 'leave' | 'pending' | 'approved' | 'rejected' | 'paid' | 'sick' | 'unpaid'
  label?: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const getStyles = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
      case 'absent':
        return 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
      case 'half-day':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
      case 'leave':
      case 'paid':
      case 'sick':
      case 'unpaid':
        return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
      case 'approved':
        return 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
      case 'rejected':
        return 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800'
    }
  }

  const getLabel = (status: string) => {
    if (label) return label
    switch (status) {
      case 'present':
        return 'Present'
      case 'absent':
        return 'Absent'
      case 'half-day':
        return 'Half Day'
      case 'leave':
        return 'Leave'
      case 'pending':
        return 'Pending'
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      case 'paid':
        return 'Paid Leave'
      case 'sick':
        return 'Sick Leave'
      case 'unpaid':
        return 'Unpaid Leave'
      default:
        return status
    }
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStyles(status)}`}>
      {getLabel(status)}
    </span>
  )
}
