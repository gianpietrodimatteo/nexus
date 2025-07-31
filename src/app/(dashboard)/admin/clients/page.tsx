'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import type { AuthSession } from '@/server/auth/types'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { ClientUsersList } from './components/client-users-list'
import { AssignedSupportEngineers } from './components/assigned-support-engineers'
import { DocumentLinks } from './components/document-links'
import { PipelineProgress } from './components/pipeline-progress'

export default function AdminClientsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()


  // Type guard for our custom session
  const authSession = session as AuthSession | null

  // Fetch client users with tRPC
  const { data: clientUsers, isLoading, error } = trpc.users.list.useQuery({
    role: 'CLIENT' // Filter to only show CLIENT users
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

  // Type guard for client users data
  const clientUsersList: any[] = clientUsers || []

  return (
    <div className="flex flex-col gap-8 py-8 px-8">
      {/* Assigned Support Engineers Section */}
      <AssignedSupportEngineers clientId="current-client" />

      {/* Client Users and Document Links Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* Client Users Section */}
        <Card className="shadow-sm border border-[#E9E7E4]">
          <div className="p-6">
            <ClientUsersList
              clientUsers={clientUsersList}
              isLoading={isLoading}
              error={error as { message?: string } | null}
            />
          </div>
        </Card>

        {/* Document Links Section */}
        <DocumentLinks 
          onLinksChange={(links) => {
            // TODO: Implement save functionality
            console.log('Document links updated:', links)
          }}
        />
      </div>

      {/* Pipeline Progress Section */}
      <PipelineProgress 
        clientId="current-client"
        phases={[
          { id: 1, name: "Discovery: Initial Survey", isCompleted: true, completedAt: "2025-01-15T10:00:00Z" },
          { id: 2, name: "Discovery: Process deep dive", isCompleted: true, completedAt: "2025-01-20T14:30:00Z" },
          { id: 3, name: "ADA Proposal Sent", isCompleted: true, completedAt: "2025-01-25T09:15:00Z" },
          { id: 4, name: "ADA Proposal Review done", isCompleted: false },
          { id: 5, name: "ADA Contract Sent", isCompleted: false },
          { id: 6, name: "ADA Contract Signed", isCompleted: false },
          { id: 7, name: "Credentials collected", isCompleted: false },
          { id: 8, name: "Factory build initiated", isCompleted: false },
          { id: 9, name: "Test plan generated", isCompleted: false },
          { id: 10, name: "Testing started", isCompleted: false },
          { id: 11, name: "Production deploy", isCompleted: false }
        ]}
        onMarkComplete={(phaseId) => {
          // TODO: Implement mark complete functionality
          console.log('Mark phase complete:', phaseId)
        }}
      />
    </div>
  )
}