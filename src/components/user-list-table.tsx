import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  hourlyRateCost?: number
  hourlyRateBillable?: number
  assignedOrganizations?: Array<{
    id: string
    name: string
  }>
}

interface UserListTableProps {
  users: User[]
  isLoading?: boolean
  error?: { message?: string } | null
  onEditUser?: (userId: string) => void
  onDeleteUser?: (userId: string) => void
}

export function UserListTable({ 
  users, 
  isLoading, 
  error, 
  onEditUser, 
  onDeleteUser 
}: UserListTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-[#1F2937]">Loading users...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-red-600">
          Error loading users: {error.message || 'Unknown error'}
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-[#1F2937]">
        No users found for the selected filter.
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#E9E7E4]">
            <TableHead className="text-left py-4 px-4 text-base font-bold text-[#3B3B3B] w-[186px]">
              Name
            </TableHead>
            <TableHead className="text-left py-4 px-4 text-base font-bold text-[#3B3B3B] w-[197px]">
              Email
            </TableHead>
            <TableHead className="text-left py-4 px-4 text-base font-bold text-[#3B3B3B] w-[173px]">
              Phone
            </TableHead>
            <TableHead className="text-left py-4 px-4 text-base font-bold text-[#3B3B3B] w-[121px]">
              Cost Rate
            </TableHead>
            <TableHead className="text-left py-4 px-4 text-base font-bold text-[#3B3B3B] w-[109px]">
              Bill Rate
            </TableHead>
            <TableHead className="text-left py-4 px-4 text-base font-bold text-[#3B3B3B] w-[187px]">
              Assigned Clients
            </TableHead>
            <TableHead className="text-left py-4 px-4 text-base font-bold text-[#3B3B3B] w-[116px]">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="border-b border-[#E9E7E4]">
              <TableCell className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-medium">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-base text-[#1F2937] font-normal">
                    {user.name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-4 px-4">
                <span className="text-base text-[#1F2937]">{user.email}</span>
              </TableCell>
              <TableCell className="py-4 px-4">
                <span className="text-base text-[#1F2937]">{user.phone || '-'}</span>
              </TableCell>
              <TableCell className="py-4 px-4">
                <span className="text-base text-[#1F2937]">
                  {user.hourlyRateCost ? `$${user.hourlyRateCost}/hr` : '-'}
                </span>
              </TableCell>
              <TableCell className="py-4 px-4">
                <span className="text-base text-[#1F2937]">
                  {user.hourlyRateBillable ? `$${user.hourlyRateBillable}/hr` : '-'}
                </span>
              </TableCell>
              <TableCell className="py-4 px-4">
                <div className="flex gap-2 flex-wrap">
                  {user.assignedOrganizations?.length ? (
                    user.assignedOrganizations.map((org) => (
                      <Badge 
                        key={org.id}
                        variant="secondary"
                        className="bg-[#E9E7E4] text-[#1F2937] hover:bg-[#E9E7E4]"
                      >
                        {org.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[#1F2937] text-base">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4 px-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-full"
                    onClick={() => onEditUser?.(user.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-full hover:bg-red-50 hover:border-red-200"
                    onClick={() => onDeleteUser?.(user.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}