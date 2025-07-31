import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface PageHeaderProps {
  title: string
  actionLabel?: string
  onActionClick?: () => void
}

export function PageHeader({ title, actionLabel, onActionClick }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 lg:px-6">
      <h1 className="text-2xl font-normal text-[#141417]">{title}</h1>
      {actionLabel && (
        <Button onClick={onActionClick} className="gap-2">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}