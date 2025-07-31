import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { trpc } from "@/lib/trpc"

interface ClientSelectorProps {
  selectedClientId?: string
  onClientSelect: (clientId: string) => void
}

export function ClientSelector({ selectedClientId, onClientSelect }: ClientSelectorProps) {
  const { data: organizations, isLoading } = trpc.organizations.list.useQuery()

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-[#1F2937] whitespace-nowrap">Select Client</label>
        <div className="text-sm text-[#6B7280]">Loading organizations...</div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-[#1F2937] whitespace-nowrap">Select Client</label>
      <Select value={selectedClientId} onValueChange={onClientSelect}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Choose an organization..." />
        </SelectTrigger>
        <SelectContent>
          {organizations?.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}