'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ClientSelector } from '@/components/client-selector'
import { Card, CardContent } from '@/components/ui/card'
import type { ExceptionListFilter } from '@/schemas/exception'
import {
  EXCEPTION_TYPE_LABELS,
  EXCEPTION_SEVERITY_LABELS,
  type ExceptionType,
  type ExceptionSeverity,
} from '@/schemas/exception'

interface ExceptionFiltersProps {
  filters: ExceptionListFilter
  onFiltersChange: (filters: Partial<ExceptionListFilter>) => void
}

export function ExceptionFilters({ filters, onFiltersChange }: ExceptionFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Client Name Filter */}
          <div className="space-y-2">
            <Label htmlFor="client-filter">Client name</Label>
            <ClientSelector
              value={filters.organizationId}
              onValueChange={(value) => onFiltersChange({ organizationId: value })}
              placeholder="All clients"
              className="w-full"
            />
          </div>

          {/* Exception Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="type-filter">Exception type</Label>
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => 
                onFiltersChange({ type: value === 'all' ? undefined : value as ExceptionType })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {Object.entries(EXCEPTION_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity Filter */}
          <div className="space-y-2">
            <Label htmlFor="severity-filter">Severity</Label>
            <Select
              value={filters.severity || 'all'}
              onValueChange={(value) => 
                onFiltersChange({ severity: value === 'all' ? undefined : value as ExceptionSeverity })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                {Object.entries(EXCEPTION_SEVERITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}