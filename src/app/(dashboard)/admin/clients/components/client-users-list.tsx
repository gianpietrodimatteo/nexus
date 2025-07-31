import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check } from "lucide-react"

interface ClientUser {
  id: string
  name: string
  email: string
  phone?: string
  billingAccess: boolean
  adminAccess: boolean
  notificationPreferences?: any
  organization?: {
    id: string
    name: string
  }
}

interface ClientUsersListProps {
  clientUsers: ClientUser[]
  isLoading?: boolean
  error?: { message?: string } | null
}

export function ClientUsersList({ 
  clientUsers, 
  isLoading, 
  error
}: ClientUsersListProps) {

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-[#1F2937]">Loading client users...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-red-500">Error: {error.message || 'Failed to load client users'}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <h3 className="text-lg font-medium text-[#1F2937]">Client Users</h3>

      {/* Client Users Table */}
      {clientUsers.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-[#1F2937] text-lg font-medium">No client users found</div>
          <div className="text-[#6B7280] text-sm mt-1">No client users have been created yet</div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {user.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium text-[#1F2937]">{user.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[#1F2937]">{user.email}</span>
                  </TableCell>
                  <TableCell>
                    {user.phone ? (
                      <span className="text-sm text-[#1F2937]">{user.phone}</span>
                    ) : (
                      <span className="text-[#6B7280] text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.billingAccess ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <span className="text-[#6B7280] text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.adminAccess ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <span className="text-[#6B7280] text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.notificationPreferences ? (
                      <span className="text-sm text-[#1F2937]">
                        {typeof user.notificationPreferences === 'string' 
                          ? user.notificationPreferences 
                          : JSON.stringify(user.notificationPreferences)}
                      </span>
                    ) : (
                      <span className="text-[#6B7280] text-sm">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}