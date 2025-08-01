'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc'
import { toast } from 'sonner'
import {
  updateSubscriptionPlanSchema,
  type UpdateSubscriptionPlanInput,
  type SubscriptionPlanWithClients,
} from '@/schemas/billing'

interface EditPlanModalProps {
  plan: SubscriptionPlanWithClients | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditPlanModal({ plan, isOpen, onClose, onSuccess }: EditPlanModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UpdateSubscriptionPlanInput>({
    resolver: zodResolver(updateSubscriptionPlanSchema),
  })

  // Reset form when plan changes
  useEffect(() => {
    if (plan) {
      form.reset({
        id: plan.id,
        name: plan.name,
        pricingModel: plan.pricingModel,
        contractLength: plan.contractLength,
        billingCadence: plan.billingCadence,
        setupFee: plan.setupFee,
        prepaymentPercentage: plan.prepaymentPercentage,
        capAmount: plan.capAmount,
        overageCost: plan.overageCost,
        creditsPerPeriod: plan.creditsPerPeriod,
        pricePerCredit: plan.pricePerCredit,
        productUsageAPI: plan.productUsageAPI,
      })
    }
  }, [plan, form])

  const updatePlanMutation = trpc.billing.updateSubscriptionPlan.useMutation({
    onSuccess: () => {
      onSuccess()
      setIsSubmitting(false)
    },
    onError: (error) => {
      toast.error(error.message)
      setIsSubmitting(false)
    },
  })

  const onSubmit = async (data: UpdateSubscriptionPlanInput) => {
    setIsSubmitting(true)
    updatePlanMutation.mutate(data)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  if (!plan) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Subscription Plan</DialogTitle>
          <DialogDescription>
            Update the subscription plan details and pricing.
            {plan.clientCount > 0 && (
              <span className="block mt-1 text-amber-600">
                Warning: This plan has {plan.clientCount} client(s) using it. Changes will affect their billing.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Enterprise Pro" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricingModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pricing Model</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pricing model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TIERED">Tiered</SelectItem>
                        <SelectItem value="FIXED">Fixed</SelectItem>
                        <SelectItem value="USAGE">Usage</SelectItem>
                        <SelectItem value="CONSUMPTION">Consumption</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productUsageAPI"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Usage API</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select API" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NEXUS_BASE">Nexus Base</SelectItem>
                        <SelectItem value="AIR_DIRECT">Air Direct</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Length</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contract length" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MONTH">1 Month</SelectItem>
                        <SelectItem value="QUARTER">3 Months</SelectItem>
                        <SelectItem value="YEAR">12 Months</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billingCadence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Cadence</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select billing cadence" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="setupFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setup Fee ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prepaymentPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prepayment Percentage (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cap Amount ($) <span className="text-muted-foreground">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="No cap"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overageCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overage Cost ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="creditsPerPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credits Per Period</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="10000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerCredit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Credit ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.001"
                        min="0"
                        placeholder="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Plan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}