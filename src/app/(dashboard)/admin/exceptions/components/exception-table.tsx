'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { ExceptionStatusEditor } from './exception-status-editor'
import type { ExceptionListFilter } from '@/schemas/exception'
import {
  EXCEPTION_TYPE_LABELS,
  EXCEPTION_SEVERITY_LABELS,
  EXCEPTION_STATUS_LABELS,
} from '@/schemas/exception'

interface ExceptionTableProps {
  filters: ExceptionListFilter
  onPaginationChange: (offset: number) => void
  onSortChange: (sortBy: ExceptionListFilter['sortBy'], sortOrder: ExceptionListFilter['sortOrder']) => void
}

export function ExceptionTable({ filters, onPaginationChange, onSortChange }: ExceptionTableProps) {
  const [editingStatus, setEditingStatus] = useState<string | null>(null)

  const { data, isLoading, refetch } = trpc.exceptions.list.useQuery(filters)

  const handleSort = (column: ExceptionListFilter['sortBy']) => {
    const newOrder = filters.sortBy === column && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    onSortChange(column, newOrder)
  }

  const handleStatusUpdate = async () => {
    setEditingStatus(null)
    await refetch()
  }

  // Mock notification data - in real app, this would come from the API
  const getMockNotifications = () => [
    { id: '1', name: 'John Doe', avatar: 'JD' },
    { id: '2', name: 'Jane Smith', avatar: 'JS' },
  ]

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const { exceptions, totalCount, hasMore } = data
  const currentPage = Math.floor(filters.offset / filters.limit) + 1
  const totalPages = Math.ceil(totalCount / filters.limit)

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'destructive'
      case 'HIGH':
        return 'default'
      case 'MEDIUM':
        return 'secondary'
      case 'LOW':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const SortableHeader = ({ column, children }: { column: ExceptionListFilter['sortBy'], children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(column)}
      className="h-auto p-0 font-bold hover:bg-transparent"
    >
      {children}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  )

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[140px]">
                  <SortableHeader column="reportedAt">
                    <div className="flex flex-col text-left">
                      <span>Datetime</span>
                      <span>reported</span>
                    </div>
                  </SortableHeader>
                </TableHead>
                <TableHead className="w-[120px]">
                  <SortableHeader column="organizationName">
                    <div className="flex flex-col text-left">
                      <span>Client</span>
                      <span>name</span>
                    </div>
                  </SortableHeader>
                </TableHead>
                <TableHead className="w-[100px]">Department</TableHead>
                <TableHead className="w-[140px]">
                  <SortableHeader column="workflowName">Workflow name</SortableHeader>
                </TableHead>
                <TableHead className="w-[120px]">Notifications</TableHead>
                <TableHead className="w-[120px]">
                  <div className="flex flex-col text-left">
                    <span>Exception</span>
                    <span>type</span>
                  </div>
                </TableHead>
                <TableHead className="w-[80px]">
                  <SortableHeader column="severity">Severity</SortableHeader>
                </TableHead>
                <TableHead className="w-[120px]">Remedy</TableHead>
                <TableHead className="w-[120px]">
                  <SortableHeader column="status">Status</SortableHeader>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exceptions.map((exception) => (
                <TableRow key={exception.id}>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{new Date(exception.reportedAt).toLocaleDateString()}</span>
                      <span className="text-muted-foreground">
                        {new Date(exception.reportedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{exception.organization.name}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span>{exception.department?.name || '-'}</span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{exception.workflow.name}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getMockNotifications().slice(0, 2).map((notification) => (
                        <Avatar key={notification.id} className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {notification.avatar}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {getMockNotifications().length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{getMockNotifications().length - 2} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span>{EXCEPTION_TYPE_LABELS[exception.type]}</span>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={getSeverityBadgeVariant(exception.severity)}>
                      {EXCEPTION_SEVERITY_LABELS[exception.severity]}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col max-w-[120px]">
                      <span className="truncate" title={exception.remedy || ''}>
                        {exception.remedy || '-'}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <ExceptionStatusEditor
                      exception={exception}
                      isEditing={editingStatus === exception.id}
                      onEdit={(id) => setEditingStatus(id)}
                      onCancel={() => setEditingStatus(null)}
                      onUpdate={handleStatusUpdate}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {filters.offset + 1} to {Math.min(filters.offset + filters.limit, totalCount)} of {totalCount} exceptions
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPaginationChange(Math.max(0, filters.offset - filters.limit))}
                disabled={filters.offset === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPaginationChange(filters.offset + filters.limit)}
                disabled={!hasMore}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {exceptions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No exceptions found matching your filters.
          </div>
        )}
      </CardContent>
    </Card>
  )
}