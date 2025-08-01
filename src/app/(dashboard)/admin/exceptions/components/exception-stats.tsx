'use client'

import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react'

export function ExceptionStats() {
  const { data: stats, isLoading } = trpc.exceptions.stats.useQuery()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statCards = [
    {
      title: 'Total Exceptions',
      value: stats.totalCount.toLocaleString(),
      description: 'All time',
      icon: AlertTriangle,
      color: 'text-orange-600',
    },
    {
      title: 'New',
      value: stats.newCount.toLocaleString(),
      description: 'Requires attention',
      icon: XCircle,
      color: 'text-red-600',
    },
    {
      title: 'In Progress',
      value: stats.inProgressCount.toLocaleString(),
      description: 'Being resolved',
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Resolved This Month',
      value: stats.resolvedThisMonth.toLocaleString(),
      description: 'Current month',
      icon: CheckCircle,
      color: 'text-green-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}