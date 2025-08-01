import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExceptionStatus } from '@/schemas/exception'

interface StatusDropdownProps {
  status: ExceptionStatus
  onStatusChange: (status: ExceptionStatus) => void
  disabled?: boolean
  className?: string
}

export function StatusDropdown({ 
  status, 
  onStatusChange, 
  disabled = false, 
  className 
}: StatusDropdownProps) {
  const getStatusLabel = (status: ExceptionStatus) => {
    switch (status) {
      case 'NEW':
        return 'New'
      case 'IN_PROGRESS':
        return 'In Progress'
      case 'RESOLVED':
        return 'Resolved'
      case 'IGNORED':
        return 'Ignored'
      default:
        return status
    }
  }

  return (
    <Select
      value={status}
      onValueChange={(value) => onStatusChange(value as ExceptionStatus)}
      disabled={disabled}
    >
      <SelectTrigger className={`w-[110px] h-7 ${className}`}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="NEW">New</SelectItem>
        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
        <SelectItem value="RESOLVED">Resolved</SelectItem>
        <SelectItem value="IGNORED">Ignored</SelectItem>
      </SelectContent>
    </Select>
  )
}