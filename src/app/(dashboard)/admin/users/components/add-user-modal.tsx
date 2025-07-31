'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { trpc } from '@/lib/trpc'
import { createUserSchema, type CreateUserInput } from '@/schemas/user'
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

interface AddUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddUserModal({ open, onOpenChange, onSuccess }: AddUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'CLIENT',
      password: '',
      hourlyRateCost: undefined,
      hourlyRateBillable: undefined,
      organizationId: '',
      assignedOrganizationIds: [],
    },
  })

  // Watch role to show conditional fields
  const selectedRole = form.watch('role')

  // Fetch organizations for dropdowns
  const { data: organizations } = trpc.admin.organizations.list.useQuery()

  // Create user mutation
  const createUserMutation = trpc.admin.users.create.useMutation({
    onSuccess: () => {
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error: any) => {
      console.error('Failed to create user:', error)
    },
  })

  const onSubmit = async (data: CreateUserInput) => {
    setIsSubmitting(true)
    try {
      await createUserMutation.mutateAsync(data)
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
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. SE users require hourly rates and can be assigned to multiple organizations.
          </DialogDescription>
        </DialogHeader>

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

              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="SE">Solutions Engineer</SelectItem>
                        <SelectItem value="CLIENT">Client</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Minimum 8 characters" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Primary Organization (for CLIENT/SE users) */}
            {(selectedRole === 'CLIENT' || selectedRole === 'SE') && (
              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedRole === 'CLIENT' ? 'Organization' : 'Primary Organization (Optional)'}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
            {selectedRole === 'SE' && (
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
                                      checked={field.value?.includes(org.id) || false}
                                      onCheckedChange={(checked) => {
                                        const currentValue = field.value || []
                                        return checked
                                          ? field.onChange([...currentValue, org.id])
                                          : field.onChange(
                                              currentValue.filter(
                                                (value) => value !== org.id
                                              )
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
                {isSubmitting ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}