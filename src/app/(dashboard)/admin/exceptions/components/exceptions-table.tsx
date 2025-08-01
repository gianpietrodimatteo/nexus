'use client'

import { useState } from 'react'

import { ArrowUpDown } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { SeverityBadge } from './severity-badge'
import { NotificationDisplay } from './notification-display'
import { StatusDropdown } from './status-dropdown'
import { ExceptionStatus } from '@/schemas/exception'

interface Exception {
  id: string
  type: string
  severity: string
  status: ExceptionStatus
  remedy: string | null
  reportedAt: string | Date
  resolvedAt: string | Date | null
  organizationId: string
  departmentId: string | null
  workflowId: string
  workflow: {
    id: string
    name: string
  }
  organization: {
    id: string
    name: string
  }
  department: {
    id: string
    name: string
  } | null
  notifications?: Array<{
    user: {
      id: string
      name: string | null
      email: string
    } | null
  }>
}

interface Pagination {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

interface ExceptionsTableProps {
  data: Exception[]
  pagination?: Pagination | undefined
  isLoading: boolean
  onStatusUpdate: (id: string, status: string, remedy?: string) => void
  onPageChange: (page: number) => void
  isUpdating: boolean
}

export function ExceptionsTable({
  data,
  pagination,
  isLoading,
  onStatusUpdate,
  onPageChange,
  isUpdating,
}: ExceptionsTableProps) {
  const [sortBy, setSortBy] = useState<'reportedAt' | 'severity' | 'status' | 'type'>('reportedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const formatDateTime = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(dateObj)
  }

  const formatType = (type: string) => {
    return type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-8 text-center text-gray-500">
          Loading exceptions...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[165px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('reportedAt')}
                className="h-auto p-0 font-bold text-gray-700 hover:bg-transparent"
              >
                <div className="flex flex-col items-start">
                  <span>Datetime</span>
                  <span>reported</span>
                </div>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="w-[103px]">
              <div className="flex flex-col">
                <span className="font-bold text-gray-700">Client</span>
                <span className="font-bold text-gray-700">name</span>
              </div>
            </TableHead>
            <TableHead className="w-[110px]">
              <span className="font-bold text-gray-700">Department</span>
            </TableHead>
            <TableHead className="w-[154px]">
              <span className="font-bold text-gray-700">Workflow name</span>
            </TableHead>
            <TableHead className="w-[135px]">
              <span className="font-bold text-gray-700">Notifications</span>
            </TableHead>
            <TableHead className="w-[126px]">
              <div className="flex flex-col">
                <span className="font-bold text-gray-700">Exception</span>
                <span className="font-bold text-gray-700">type</span>
              </div>
            </TableHead>
            <TableHead className="w-[91px]">
              <span className="font-bold text-gray-700">Severity</span>
            </TableHead>
            <TableHead className="w-[108px]">
              <span className="font-bold text-gray-700">Remedy</span>
            </TableHead>
            <TableHead className="w-[142px]">
              <span className="font-bold text-gray-700">Status</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                No exceptions found
              </TableCell>
            </TableRow>
          ) : (
            data.map((exception) => (
              <TableRow key={exception.id} className="border-b border-gray-200">
                <TableCell className="py-4">
                  <div className="flex flex-col text-sm">
                    <span className="text-gray-900">
                      {formatDateTime(exception.reportedAt).split(' ')[0]}
                    </span>
                    <span className="text-gray-900">
                      {formatDateTime(exception.reportedAt).split(' ')[1]}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col text-sm">
                    <span className="text-gray-900">
                      {exception.organization.name.split(' ')[0]}
                    </span>
                    {exception.organization.name.split(' ')[1] && (
                      <span className="text-gray-900">
                        {exception.organization.name.split(' ').slice(1).join(' ')}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-sm text-gray-900">
                    {exception.department?.name || '-'}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col text-sm">
                    <span className="text-gray-900">
                      {exception.workflow.name.split(' ')[0]}
                    </span>
                    {exception.workflow.name.split(' ')[1] && (
                      <span className="text-gray-900">
                        {exception.workflow.name.split(' ').slice(1).join(' ')}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <NotificationDisplay notifications={exception.notifications || []} />
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-sm text-gray-900">
                    {formatType(exception.type)}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <SeverityBadge severity={exception.severity as any} />
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col text-sm">
                    {exception.remedy ? (
                      exception.remedy.split(' ').map((word, index) => (
                        <span key={index} className="text-gray-900">
                          {word}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <StatusDropdown
                    status={exception.status}
                    onStatusChange={(status) => onStatusUpdate(exception.id, status)}
                    disabled={isUpdating}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
            {pagination.totalCount} exceptions
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}