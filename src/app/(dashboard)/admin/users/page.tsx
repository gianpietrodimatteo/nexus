'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import type { AuthSession } from '@/server/auth/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserFilters } from '@/components/user-filters'
import { UserListTable } from '@/components/user-list-table'
import { AddUserModal } from './components/add-user-modal'
import { EditUserModal } from './components/edit-user-modal'
import { DeleteUserDialog } from './components/delete-user-dialog'
import { useAdminHeader } from '@/components/admin-header-context'

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [roleFilter, setRoleFilter] = useState<'all' | 'ADMIN' | 'SE'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [editUserId, setEditUserId] = useState<string | null>(null)
  const [deleteUser, setDeleteUser] = useState<{ id: string; name: string } | null>(null)
  const { setHeaderContent } = useAdminHeader()

  // Type guard for our custom session
  const authSession = session as AuthSession | null

  // Fetch users with tRPC - MUST be called before any early returns
  const { data: users, isLoading, error, refetch } = trpc.users.list.useQuery({
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

  // Set header content
  useEffect(() => {
    if (authSession?.user?.role === 'ADMIN') {
      setHeaderContent({
        title: 'User Manager',
        actions: (
          <Button onClick={handleAddUser}>
            Add New User
          </Button>
        )
      })
    }

    // Cleanup function to reset header when component unmounts
    return () => {
      setHeaderContent(null)
    }
  }, [authSession, setHeaderContent])

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
    <div className="flex flex-col">
      <div className="px-8 py-8">
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