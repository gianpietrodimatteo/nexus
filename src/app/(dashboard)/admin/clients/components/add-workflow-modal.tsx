'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { trpc } from '@/lib/trpc'
import { createWorkflowSchema, type CreateWorkflowInput } from '@/schemas/workflow'
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
  FormDescription,
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
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

interface AddWorkflowModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  organizationId: string
}

export function AddWorkflowModal({ 
  open, 
  onOpenChange, 
  onSuccess, 
  organizationId 
}: AddWorkflowModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateWorkflowInput>({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: {
      name: '',
      description: '',
      organizationId: organizationId,
      departmentId: '',
      nodeCount: 0,
      timeSavedPerExecution: undefined,
      moneySavedPerExecution: undefined,
      isActive: true,
    },
  })

  // Fetch departments for dropdown (we'll need to add this to tRPC)
  const { data: departments, isLoading: departmentsLoading } = trpc.departments.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  )

  // Create workflow mutation (we'll need to add this to tRPC)
  const createWorkflowMutation = trpc.workflows.create.useMutation({
    onSuccess: () => {
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error: any) => {
      console.error('Failed to create workflow:', error)
    },
  })

  const onSubmit = async (data: CreateWorkflowInput) => {
    setIsSubmitting(true)
    try {
      await createWorkflowMutation.mutateAsync({
        ...data,
        organizationId: organizationId, // Ensure organizationId is set
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Workflow</DialogTitle>
          <DialogDescription>
            Create a new workflow for this organization. You can specify performance metrics and assign it to a department.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Workflow Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Invoice Processing Automation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this workflow does..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Department */}
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments?.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Node Count */}
              <FormField
                control={form.control}
                name="nodeCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Nodes</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="0" 
                        value={field.value?.toString() ?? '0'}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      How many steps/nodes are in this workflow
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Time Saved Per Execution */}
              <FormField
                control={form.control}
                name="timeSavedPerExecution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Saved Per Execution (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        step="1"
                        placeholder="30" 
                        value={field.value?.toString() ?? ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Average time saved per workflow execution
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Money Saved Per Execution */}
              <FormField
                control={form.control}
                name="moneySavedPerExecution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Money Saved Per Execution ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        step="0.01"
                        placeholder="75.00" 
                        value={field.value?.toString() ?? ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Average cost savings per workflow execution
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Is Active */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Active Workflow
                    </FormLabel>
                    <FormDescription>
                      Whether this workflow is currently active and available for execution
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Workflow'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}