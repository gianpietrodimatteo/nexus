'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { trpc } from '@/lib/trpc'
import { ExceptionFilters as ExceptionFiltersType, ExceptionTypeSchema, ExceptionSeveritySchema } from '@/schemas/exception'

interface ExceptionFiltersProps {
  filters: ExceptionFiltersType
  onFiltersChange: (filters: ExceptionFiltersType) => void
}

export function ExceptionFilters({ filters, onFiltersChange }: ExceptionFiltersProps) {
  // Fetch organizations for the client dropdown (only available to admin)
  const { data: organizations } = trpc.organizations.list.useQuery()

  const handleFilterChange = (key: keyof ExceptionFiltersType, value: string | undefined) => {
    const newFilters = { ...filters }
    if (value === 'all' || !value) {
      delete newFilters[key]
    } else {
      newFilters[key] = value as any
    }
    onFiltersChange(newFilters)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-3 gap-6">
        {/* Client Name Filter */}
        <div className="space-y-2">
          <Label htmlFor="client-filter" className="text-sm font-medium text-gray-700">
            Client name
          </Label>
          <Select
            value={filters.organizationId || 'all'}
            onValueChange={(value) => handleFilterChange('organizationId', value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="All clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {organizations?.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Exception Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type-filter" className="text-sm font-medium text-gray-700">
            Exception type
          </Label>
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => handleFilterChange('type', value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {ExceptionTypeSchema.options.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Severity Filter */}
        <div className="space-y-2">
          <Label htmlFor="severity-filter" className="text-sm font-medium text-gray-700">
            Severity
          </Label>
          <Select
            value={filters.severity || 'all'}
            onValueChange={(value) => handleFilterChange('severity', value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="All severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              {ExceptionSeveritySchema.options.map((severity) => (
                <SelectItem key={severity} value={severity}>
                  {severity.charAt(0) + severity.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}