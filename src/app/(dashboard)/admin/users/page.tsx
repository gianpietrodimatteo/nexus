'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import type { AuthSession } from '@/server/auth/types'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { UserFilters } from '@/components/user-filters'
import { UserListTable } from '@/components/user-list-table'
import { AddUserModal } from './components/add-user-modal'
import { EditUserModal } from './components/edit-user-modal'
import { DeleteUserDialog } from './components/delete-user-dialog'

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [roleFilter, setRoleFilter] = useState<'all' | 'ADMIN' | 'SE'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [editUserId, setEditUserId] = useState<string | null>(null)
  const [deleteUser, setDeleteUser] = useState<{ id: string; name: string } | null>(null)

  // Type guard for our custom session
  const authSession = session as AuthSession | null

  // Fetch users with tRPC - MUST be called before any early returns
  const { data: users, isLoading, error, refetch } = trpc.admin.users.list.useQuery({
    role: roleFilter === 'all' ? undefined : roleFilter,
    search: searchTerm || undefined,
  }, {
    enabled: authSession?.user?.role === 'ADMIN', // Only run query if user is admin
  })

  // Handle redirects in useEffect to avoid render-time navigation
  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!authSession) {
      router.push('/login')
      return
    }

    if (authSession.user.role !== 'ADMIN') {
      router.push('/client')
      return
    }
  }, [authSession, status, router])

  // Show loading while checking authentication
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  // Show loading while redirecting
  if (!authSession || authSession.user.role !== 'ADMIN') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  // Type guard for users data
  const usersList: any[] = users || []

  const handleAddUser = () => {
    setIsAddUserModalOpen(true)
  }

  const handleEditUser = (userId: string) => {
    setEditUserId(userId)
  }

  const handleDeleteUser = (userId: string) => {
    const user = usersList.find(u => u.id === userId)
    if (user) {
      setDeleteUser({ id: user.id, name: user.name })
    }
  }

  const handleFilterChange = (value: 'all' | 'ADMIN' | 'SE') => {
    setRoleFilter(value)
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader 
        title="Manage Users" 
        actionLabel="Add New User" 
        onActionClick={handleAddUser}
      />

      <div className="mx-4 lg:mx-6">
        <Card className="shadow-sm border border-gray-100">
          <UserFilters 
            value={roleFilter} 
            onValueChange={handleFilterChange} 
          />
          
          <div className="px-6 py-6">
            <UserListTable
              users={usersList}
              isLoading={isLoading}
              error={error as { message?: string } | null}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          </div>
        </Card>
      </div>
      
      <AddUserModal
        open={isAddUserModalOpen}
        onOpenChange={setIsAddUserModalOpen}
        onSuccess={() => {
          refetch() // Refresh the users list after successful creation
        }}
      />
      
      <EditUserModal
        open={!!editUserId}
        onOpenChange={(open) => !open && setEditUserId(null)}
        userId={editUserId}
        onSuccess={() => {
          refetch() // Refresh the users list after successful update
        }}
      />

      <DeleteUserDialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
        userId={deleteUser?.id ?? null}
        userName={deleteUser?.name ?? null}
        onSuccess={() => {
          refetch() // Refresh the users list after successful deletion
        }}
      />
    </div>
  )
}