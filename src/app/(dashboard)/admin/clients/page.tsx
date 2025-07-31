'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import type { AuthSession } from '@/server/auth/types'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { ClientUsersList } from './components/client-users-list'

export default function AdminClientsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()


  // Type guard for our custom session
  const authSession = session as AuthSession | null

  // Fetch client users with tRPC
  const { data: clientUsers, isLoading, error } = trpc.admin.clientUsers.list.useQuery({}, {
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

  // Type guard for client users data
  const clientUsersList: any[] = clientUsers || []

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader 
        title="Client Management"
      />

      <div className="mx-4 lg:mx-6">
        <Card className="shadow-sm border border-gray-100">
          <div className="px-6 py-6">
            <ClientUsersList
              clientUsers={clientUsersList}
              isLoading={isLoading}
              error={error as { message?: string } | null}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}