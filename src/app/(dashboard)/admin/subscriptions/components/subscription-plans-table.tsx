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
import { Badge } from '@/components/ui/badge'
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  DollarSign,
  Users,
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

  const getBadgeVariant = (value: string) => {
    switch (value) {
      case 'CONSUMPTION':
        return 'default'
      case 'MONTHLY':
        return 'secondary'
      case 'QUARTERLY':
        return 'outline'
      case 'YEAR':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Pricing Model</TableHead>
              <TableHead className="font-semibold">Contract Length</TableHead>
              <TableHead className="font-semibold">Billing Cadence</TableHead>
              <TableHead className="font-semibold">Setup Fee</TableHead>
              <TableHead className="font-semibold">Prepayment %</TableHead>
              <TableHead className="font-semibold">$ Cap</TableHead>
              <TableHead className="font-semibold">Overage Cost</TableHead>
              <TableHead className="font-semibold"># Clients</TableHead>
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
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => setEditingPlan(plan)}
                >
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(plan.pricingModel)}>
                      {plan.pricingModel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(plan.contractLength)}>
                      {plan.contractLength}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(plan.billingCadence)}>
                      {plan.billingCadence}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      {formatCurrency(plan.setupFee)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatPercentage(plan.prepaymentPercentage)}
                  </TableCell>
                  <TableCell>
                    {plan.capAmount ? (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        {formatCurrency(plan.capAmount)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No cap</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      {formatCurrency(plan.overageCost)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {plan.clientCount}
                    </div>
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