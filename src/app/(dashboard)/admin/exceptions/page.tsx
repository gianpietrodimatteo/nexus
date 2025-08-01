'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { ExceptionFilters } from './components/exception-filters'
import { ExceptionTable } from './components/exception-table'
import { ExceptionStats } from './components/exception-stats'
import type { ExceptionListFilter } from '@/schemas/exception'

export default function ExceptionsPage() {
  const [filters, setFilters] = useState<ExceptionListFilter>({
    limit: 50,
    offset: 0,
    sortBy: 'reportedAt',
    sortOrder: 'desc',
  })

  const handleFiltersChange = (newFilters: Partial<ExceptionListFilter>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset offset when filters change (except for pagination)
      offset: newFilters.offset !== undefined ? newFilters.offset : 0,
    }))
  }

  const handlePaginationChange = (offset: number) => {
    setFilters(prev => ({
      ...prev,
      offset,
    }))
  }

  const handleSortChange = (sortBy: ExceptionListFilter['sortBy'], sortOrder: ExceptionListFilter['sortOrder']) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder,
      offset: 0, // Reset to first page when sorting changes
    }))
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader 
        title="Exceptions" 
        subtitle="Monitor and manage system exceptions across all clients"
      />
      
      {/* Exception Statistics */}
      <ExceptionStats />

      {/* Filters */}
      <ExceptionFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Exception Table */}
      <ExceptionTable
        filters={filters}
        onPaginationChange={handlePaginationChange}
        onSortChange={handleSortChange}
      />
    </div>
  )
}