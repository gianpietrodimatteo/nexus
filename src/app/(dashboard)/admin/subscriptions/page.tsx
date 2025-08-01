'use client'

import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { SubscriptionPlansTable } from './components/subscription-plans-table'
import { AddPlanModal } from './components/add-plan-modal'
import { trpc } from '@/lib/trpc'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

/**
 * Subscription Plans Management Page
 * 
 * Displays a table of all subscription plans with the ability to:
 * - View all plans with client counts
 * - Edit plans inline by clicking
 * - Add new plans
 * - Delete unused plans
 */
export default function SubscriptionsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Fetch all subscription plans
  const { 
    data: plans, 
    isLoading, 
    error,
    refetch 
  } = trpc.billing.getAllSubscriptionPlans.useQuery()

  // Handle add plan success
  const handleAddSuccess = () => {
    setIsAddModalOpen(false)
    refetch()
    toast.success('Subscription plan created successfully')
  }

  // Handle edit success
  const handleEditSuccess = () => {
    refetch()
    toast.success('Subscription plan updated successfully')
  }

  // Handle delete success
  const handleDeleteSuccess = () => {
    refetch()
    toast.success('Subscription plan deleted successfully')
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Subscription Plans"
          description="Manage subscription plans and pricing models"
        />
        <div className="p-8 text-center">
          <p className="text-destructive">Error loading subscription plans: {error.message}</p>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Subscription Plans"
          description="Manage subscription plans and pricing models"
        />
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Plan
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <SubscriptionPlansTable 
          data={plans || []}
          onEditSuccess={handleEditSuccess}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}

      <AddPlanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
}

/**
 * Loading skeleton for the subscription plans table
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-24" />
            ))}
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b last:border-b-0">
            <div className="flex items-center space-x-4">
              {Array.from({ length: 9 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-24" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}