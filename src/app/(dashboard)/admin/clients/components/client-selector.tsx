import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { trpc } from "@/lib/trpc"

interface ClientSelectorProps {
  selectedClientId?: string
  onClientSelect: (clientId: string) => void
}

export function ClientSelector({ selectedClientId, onClientSelect }: ClientSelectorProps) {
  const { data: organizations, isLoading } = trpc.organizations.list.useQuery()

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#1F2937]">Select Client</h3>
          <div className="text-[#6B7280]">Loading organizations...</div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#1F2937]">Select Client</h3>
        <Select value={selectedClientId} onValueChange={onClientSelect}>
          <SelectTrigger className="w-full">
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
    </Card>
  )
}