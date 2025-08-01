'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { trpc } from '@/lib/trpc'
import { toast } from 'sonner'
import type { SubscriptionPlanWithClients } from '@/schemas/billing'
import { EditPlanModal } from './edit-plan-modal'

interface SubscriptionPlansTableProps {
  data: SubscriptionPlanWithClients[]
  onEditSuccess: () => void
  onDeleteSuccess: () => void
}

export function SubscriptionPlansTable({
  data,
  onEditSuccess,
  onDeleteSuccess,
}: SubscriptionPlansTableProps) {
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanWithClients | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlanWithClients | null>(null)

  const deletePlanMutation = trpc.billing.deleteSubscriptionPlan.useMutation({
    onSuccess: () => {
      setDeletingPlan(null)
      onDeleteSuccess()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleDelete = async () => {
    if (!deletingPlan) return
    
    deletePlanMutation.mutate({ id: deletingPlan.id })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value}%`
  }

  const formatContractLength = (length: string) => {
    switch (length) {
      case 'MONTH':
        return '1 month'
      case 'QUARTER':
        return '3 months'
      case 'YEAR':
        return '12 months'
      default:
        return length
    }
  }

  const formatPricingModel = (model: string) => {
    switch (model) {
      case 'TIERED':
        return 'Tiered'
      case 'FIXED':
        return 'Fixed'
      case 'USAGE':
        return 'Usage'
      case 'CONSUMPTION':
        return 'Consumption'
      default:
        return model
    }
  }

  const formatBillingCadence = (cadence: string) => {
    switch (cadence) {
      case 'MONTHLY':
        return 'Monthly'
      case 'QUARTERLY':
        return 'Quarterly'
      default:
        return cadence
    }
  }

  return (
    <>
      <div className="border border-[#E9E7E4] rounded-xl overflow-hidden shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#EFEAEA] border-b border-[#E5E7EB] hover:bg-[#EFEAEA]">
              <TableHead className="font-normal text-[#141417] text-sm h-[52px] px-4">Name</TableHead>
              <TableHead className="font-normal text-[#141417] text-sm h-[52px] px-4">Pricing Model</TableHead>
              <TableHead className="font-normal text-[#141417] text-sm h-[52px] px-4">Contract Length</TableHead>
              <TableHead className="font-normal text-[#141417] text-sm h-[52px] px-4">Billing Cadence</TableHead>
              <TableHead className="font-normal text-[#141417] text-sm h-[52px] px-4">Setup Fee</TableHead>
              <TableHead className="font-normal text-[#141417] text-sm h-[52px] px-4">Prepayment %</TableHead>
              <TableHead className="font-normal text-[#141417] text-sm h-[52px] px-4">$ Cap</TableHead>
              <TableHead className="font-normal text-[#141417] text-sm h-[52px] px-4">Overage Cost</TableHead>
              <TableHead className="font-normal text-[#141417] text-sm h-[52px] px-4"># Clients</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  No subscription plans found. Create your first plan to get started.
                </TableCell>
              </TableRow>
            ) : (
              data.map((plan) => (
                <TableRow 
                  key={plan.id}
                  className="hover:bg-gray-50 cursor-pointer border-b border-[#E9E7E4] h-14"
                  onClick={() => setEditingPlan(plan)}
                >
                  <TableCell className="text-[#1F2937] text-base px-4">{plan.name}</TableCell>
                  <TableCell className="text-[#1F2937] text-base px-4">
                    {formatPricingModel(plan.pricingModel)}
                  </TableCell>
                  <TableCell className="text-[#1F2937] text-base px-4">
                    {formatContractLength(plan.contractLength)}
                  </TableCell>
                  <TableCell className="text-[#1F2937] text-base px-4">
                    {formatBillingCadence(plan.billingCadence)}
                  </TableCell>
                  <TableCell className="text-[#1F2937] text-base px-4">
                    {formatCurrency(plan.setupFee)}
                  </TableCell>
                  <TableCell className="text-[#1F2937] text-base px-4">
                    {formatPercentage(plan.prepaymentPercentage)}
                  </TableCell>
                  <TableCell className="text-[#1F2937] text-base px-4">
                    {plan.capAmount ? formatCurrency(plan.capAmount) : 'No cap'}
                  </TableCell>
                  <TableCell className="text-[#1F2937] text-base px-4">
                    {formatCurrency(plan.overageCost)}
                  </TableCell>
                  <TableCell className="text-[#1F2937] text-base px-4">
                    {plan.clientCount}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingPlan(plan)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeletingPlan(plan)
                          }}
                          className="text-destructive"
                          disabled={plan.clientCount > 0}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Plan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Plan Modal */}
      <EditPlanModal
        plan={editingPlan}
        isOpen={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        onSuccess={() => {
          setEditingPlan(null)
          onEditSuccess()
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the plan "{deletingPlan?.name}"?
              This action cannot be undone.
              {deletingPlan?.clientCount && deletingPlan.clientCount > 0 && (
                <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded-md text-sm">
                  Warning: This plan has {deletingPlan.clientCount} client(s) currently using it.
                  You cannot delete a plan that is in use.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletePlanMutation.isLoading || (deletingPlan?.clientCount ?? 0) > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePlanMutation.isLoading ? 'Deleting...' : 'Delete Plan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}