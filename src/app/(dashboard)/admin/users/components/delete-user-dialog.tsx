'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
  userName: string | null
  onSuccess?: () => void
}

export function DeleteUserDialog({ open, onOpenChange, userId, userName, onSuccess }: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  // Delete user mutation
  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error: any) => {
      console.error('Failed to delete user:', error)
    },
  })

  const handleDelete = async () => {
    if (!userId) return

    setIsDeleting(true)
    try {
      await deleteUserMutation.mutateAsync({ id: userId })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!userId || !userName) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {userName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}