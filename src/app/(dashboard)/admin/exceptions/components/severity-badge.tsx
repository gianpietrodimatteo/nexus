import { Badge } from '@/components/ui/badge'
import { ExceptionSeverity } from '@/schemas/exception'
import { cn } from '@/lib/utils'

interface SeverityBadgeProps {
  severity: ExceptionSeverity
  className?: string
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const getVariantAndColor = (severity: ExceptionSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          className: 'bg-red-100 text-red-800 border-red-200',
          text: 'Critical',
        }
      case 'HIGH':
        return {
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          text: 'High',
        }
      case 'MEDIUM':
        return {
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          text: 'Medium',
        }
      case 'LOW':
        return {
          className: 'bg-green-100 text-green-800 border-green-200',
          text: 'Low',
        }
      default:
        return {
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          text: severity,
        }
    }
  }

  const { className: severityClassName, text } = getVariantAndColor(severity)

  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full px-2 py-1 text-sm font-medium',
        severityClassName,
        className
      )}
    >
      {text}
    </Badge>
  )
}