import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

interface SupportEngineer {
  id: string
  name: string
  role: string
  avatarUrl?: string
}

interface AssignedSupportEngineersProps {
  engineers: SupportEngineer[]
  clientId?: string
}

const DEFAULT_ENGINEERS: SupportEngineer[] = [
  { 
    id: "1", 
    name: "John Smith", 
    role: "Lead SE",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  { 
    id: "2", 
    name: "Sarah Johnson", 
    role: "Support SE",
    avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  }
]

export function AssignedSupportEngineers({ 
  engineers = [], 
  clientId 
}: AssignedSupportEngineersProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-[#1F2937]">Assigned Support Engineers</h3>
      
      {engineers.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-[#6B7280] text-sm">No support engineers assigned to this client</div>
        </div>
      ) : (
        <div className="flex gap-4">
          {engineers.map((engineer) => (
            <Card key={engineer.id} className="p-4 flex items-center gap-4 border border-[#E9E7E4] bg-white">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-sm bg-gray-100">
                  {getInitials(engineer.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col">
                <div className="font-medium text-[#1F2937] text-base">
                  {engineer.name}
                </div>
                <div className="text-sm text-[#757575]">
                  {engineer.role}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}