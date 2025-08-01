'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Check, X, Edit } from 'lucide-react'
import { toast } from 'sonner'
import {
  EXCEPTION_STATUS_LABELS,
  type ExceptionStatus,
} from '@/schemas/exception'

interface Exception {
  id: string
  status: ExceptionStatus
  remedy: string | null
}

interface ExceptionStatusEditorProps {
  exception: Exception
  isEditing: boolean
  onEdit: (id: string) => void
  onCancel: () => void
  onUpdate: () => void
}

export function ExceptionStatusEditor({
  exception,
  isEditing,
  onEdit,
  onCancel,
  onUpdate,
}: ExceptionStatusEditorProps) {
  const [status, setStatus] = useState<ExceptionStatus>(exception.status)
  const [remedy, setRemedy] = useState(exception.remedy || '')

  const updateMutation = trpc.exceptions.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Exception status updated successfully')
      onUpdate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update exception status')
    },
  })

  const handleSave = async () => {
    if (status === exception.status && remedy === (exception.remedy || '')) {
      onCancel()
      return
    }

    await updateMutation.mutateAsync({
      id: exception.id,
      status,
      remedy: remedy.trim() || undefined,
    })
  }

  const handleCancel = () => {
    setStatus(exception.status)
    setRemedy(exception.remedy || '')
    onCancel()
  }

  const getStatusBadgeVariant = (status: ExceptionStatus) => {
    switch (status) {
      case 'NEW':
        return 'destructive'
      case 'IN_PROGRESS':
        return 'default'
      case 'RESOLVED':
        return 'secondary'
      case 'IGNORED':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (!isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant={getStatusBadgeVariant(exception.status)}>
          {EXCEPTION_STATUS_LABELS[exception.status]}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(exception.id)}
          className="h-6 w-6 p-0"
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2 min-w-[200px]">
      {/* Status Selector */}
      <Select value={status} onValueChange={(value) => setStatus(value as ExceptionStatus)}>
        <SelectTrigger className="h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(EXCEPTION_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Remedy Input */}
      <Input
        placeholder="Remedy (optional)"
        value={remedy}
        onChange={(e) => setRemedy(e.target.value)}
        className="h-8"
      />

      {/* Action Buttons */}
      <div className="flex items-center space-x-1">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="h-6 px-2"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={updateMutation.isPending}
          className="h-6 px-2"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}