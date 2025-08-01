'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { PageHeader } from '@/components/page-header'
import { ExceptionFilters, ExceptionsTable } from './components'
import { ExceptionFilters as ExceptionFiltersType } from '@/schemas/exception'

export default function AdminExceptionsPage() {
  const [filters, setFilters] = useState<ExceptionFiltersType>({})
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  // Fetch exceptions with current filters and pagination
  const { data: exceptionsData, isLoading, refetch } = trpc.exceptions.list.useQuery({
    page,
    pageSize,
    sortBy: 'reportedAt',
    sortOrder: 'desc',
    filters,
  })

  // Mutation for updating exception status
  const updateStatus = trpc.exceptions.updateStatus.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleFiltersChange = (newFilters: ExceptionFiltersType) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const handleStatusUpdate = (id: string, status: string, remedy?: string) => {
    updateStatus.mutate({ 
      id, 
      status: status as any, 
      remedy 
    })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <div className="container py-6 space-y-6">
      <PageHeader title="Exceptions" />

      <ExceptionFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <ExceptionsTable
        data={(exceptionsData?.exceptions || []) as any}
        pagination={exceptionsData?.pagination || undefined}
        isLoading={isLoading}
        onStatusUpdate={handleStatusUpdate}
        onPageChange={handlePageChange}
        isUpdating={updateStatus.isPending}
      />
    </div>
  )
}