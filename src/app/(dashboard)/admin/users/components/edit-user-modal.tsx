'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { trpc } from '@/lib/trpc'
import { updateUserSchema, type UpdateUserInput } from '@/schemas/user'
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
import { Skeleton } from '@/components/ui/skeleton'

interface EditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
  onSuccess?: () => void
}

export function EditUserModal({ open, onOpenChange, userId, onSuccess }: EditUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      id: '',
      name: '',
      email: '',
      phone: '',
      hourlyRateCost: undefined,
      hourlyRateBillable: undefined,
      organizationId: undefined,
      assignedOrganizationIds: [],
    },
  })

  // Fetch user data when userId changes
  const { data: user, isLoading: isLoadingUser } = trpc.admin.users.get.useQuery(
    { id: userId! },
    { 
      enabled: !!userId && open,
      refetchOnWindowFocus: false,
    }
  )

  // Fetch organizations for dropdowns
  const { data: organizations } = trpc.admin.organizations.list.useQuery(undefined, {
    enabled: open
  })

  // Update user mutation
  const updateUserMutation = trpc.admin.users.update.useMutation({
    onSuccess: () => {
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error: any) => {
      console.error('Failed to update user:', error)
    },
  })

  // Populate form when user data is loaded
  useEffect(() => {
    if (user && open) {
      form.reset({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        hourlyRateCost: user.hourlyRateCost ? Number(user.hourlyRateCost) : undefined,
        hourlyRateBillable: user.hourlyRateBillable ? Number(user.hourlyRateBillable) : undefined,
        organizationId: user.organizationId || undefined,
        assignedOrganizationIds: user.assignedOrganizations?.map(org => org.id) || [],
      })
    }
  }, [user, open, form])

  const onSubmit = async (data: UpdateUserInput) => {
    setIsSubmitting(true)
    try {
      await updateUserMutation.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  if (!userId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Changes to SE users require both hourly rates.
          </DialogDescription>
        </DialogHeader>

        {isLoadingUser ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Role Display (Read-only) */}
                <div className="space-y-2">
                  <FormLabel>Role</FormLabel>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {user?.role === 'ADMIN' && 'Admin'}
                    {user?.role === 'SE' && 'Solutions Engineer'}
                    {user?.role === 'CLIENT' && 'Client'}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Role cannot be changed after user creation
                  </p>
                </div>
              </div>

              {/* Primary Organization (for CLIENT/SE users) */}
              {(user?.role === 'CLIENT' || user?.role === 'SE') && (
                <FormField
                  control={form.control}
                  name="organizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {user?.role === 'CLIENT' ? 'Organization' : 'Primary Organization (Optional)'}
                      </FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)} 
                        value={field.value || 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {user?.role === 'SE' && (
                            <SelectItem value="none">No organization</SelectItem>
                          )}
                          {organizations?.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* SE-specific fields */}
              {user?.role === 'SE' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hourly Rate Cost */}
                    <FormField
                      control={form.control}
                      name="hourlyRateCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate Cost ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="75.00" 
                              value={field.value?.toString() ?? ''}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Hourly Rate Billable */}
                    <FormField
                      control={form.control}
                      name="hourlyRateBillable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate Billable ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="150.00" 
                              value={field.value?.toString() ?? ''}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Assigned Organizations */}
                  <FormField
                    control={form.control}
                    name="assignedOrganizationIds"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Assigned Organizations</FormLabel>
                          <FormDescription>
                            Select organizations this SE can access. This is in addition to their primary organization.
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {organizations?.map((org) => (
                            <FormField
                              key={org.id}
                              control={form.control}
                              name="assignedOrganizationIds"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={org.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(org.id) ?? false}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), org.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== org.id
                                                ) || []
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {org.name}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update User'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}