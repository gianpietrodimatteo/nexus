'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import type { AuthSession } from '@/server/auth/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClientUsersList } from './components/client-users-list'
import { AssignedSupportEngineers } from './components/assigned-support-engineers'
import { DocumentLinks } from './components/document-links'
import { PipelineProgress } from './components/pipeline-progress'
import { ClientSelector } from './components/client-selector'
import { ClientWorkflowsTable } from './components/client-workflows-table'
import { useAdminHeader } from '@/components/admin-header-context'

export default function AdminClientsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'overview' | 'workflows'>('overview')
  const { setHeaderContent } = useAdminHeader()

  // Type guard for our custom session
  const authSession = session as AuthSession | null

  // Fetch organization-specific data only when an organization is selected
  const { data: organization, isLoading: orgLoading } = trpc.clients.getOrganization.useQuery(
    { organizationId: selectedOrganizationId },
    { enabled: !!selectedOrganizationId && authSession?.user?.role === 'ADMIN' }
  )

  const { data: clientUsers, isLoading: usersLoading } = trpc.clients.getClientUsers.useQuery(
    { organizationId: selectedOrganizationId },
    { enabled: !!selectedOrganizationId && authSession?.user?.role === 'ADMIN' }
  )

  const { data: documentLinks, isLoading: docsLoading } = trpc.clients.getDocumentLinks.useQuery(
    { organizationId: selectedOrganizationId },
    { enabled: !!selectedOrganizationId && authSession?.user?.role === 'ADMIN' }
  )

  const { data: pipelineData, isLoading: pipelineLoading } = trpc.clients.getPipelineProgress.useQuery(
    { organizationId: selectedOrganizationId },
    { enabled: !!selectedOrganizationId && authSession?.user?.role === 'ADMIN' }
  )

  const { data: workflows, isLoading: workflowsLoading } = trpc.clients.getWorkflows.useQuery(
    { organizationId: selectedOrganizationId },
    { enabled: !!selectedOrganizationId && authSession?.user?.role === 'ADMIN' }
  )

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
        title: 'Client Manager',
        navigation: (
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              size="sm"
              className={`${
                activeTab === 'overview' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </Button>
            <Button
              variant={activeTab === 'workflows' ? 'default' : 'ghost'}
              size="sm"
              className={`${
                activeTab === 'workflows' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('workflows')}
            >
              Client Workflows
            </Button>
          </div>
        ),
        actions: (
          <ClientSelector 
            selectedClientId={selectedOrganizationId}
            onClientSelect={setSelectedOrganizationId}
          />
        )
      })
    }

    // Cleanup function to reset header when component unmounts
    return () => {
      setHeaderContent(null)
    }
  }, [authSession, activeTab, selectedOrganizationId, setHeaderContent])

  // Show loading while checking authentication
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  // Show loading while redirecting
  if (!authSession || authSession.user.role !== 'ADMIN') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  // Convert pipeline data to component format
  const formatPipelinePhases = () => {
    if (!pipelineData) return []

    const allPhases = [
      'DISCOVERY_SURVEY',
      'DISCOVERY_DEEP_DIVE', 
      'ADA_PROPOSAL_SENT',
      'ADA_PROPOSAL_REVIEW',
      'ADA_CONTRACT_SENT',
      'ADA_CONTRACT_SIGNED',
      'CREDENTIALS_COLLECTED',
      'FACTORY_BUILD',
      'TEST_PLAN_GENERATED',
      'TESTING_STARTED',
      'PRODUCTION_DEPLOY'
    ]

    const phaseNames = {
      'DISCOVERY_SURVEY': 'Discovery: Initial Survey',
      'DISCOVERY_DEEP_DIVE': 'Discovery: Process deep dive',
      'ADA_PROPOSAL_SENT': 'ADA Proposal Sent',
      'ADA_PROPOSAL_REVIEW': 'ADA Proposal Review done',
      'ADA_CONTRACT_SENT': 'ADA Contract Sent',
      'ADA_CONTRACT_SIGNED': 'ADA Contract Signed',
      'CREDENTIALS_COLLECTED': 'Credentials collected',
      'FACTORY_BUILD': 'Factory build initiated',
      'TEST_PLAN_GENERATED': 'Test plan generated',
      'TESTING_STARTED': 'Testing started',
      'PRODUCTION_DEPLOY': 'Production deploy'
    }

    return allPhases.map((phase, index) => {
      const completedPhase = pipelineData.completedPhases.find(p => p.phase === phase)
      return {
        id: index + 1,
        name: phaseNames[phase as keyof typeof phaseNames],
        isCompleted: !!completedPhase,
        completedAt: completedPhase?.completedAt
      }
    })
  }

  // Convert document links to component format
  const formatDocumentLinks = () => {
    if (!documentLinks) return undefined

    const linksByType = documentLinks.reduce((acc, link) => {
      acc[link.type] = link.url
      return acc
    }, {} as Record<string, string>)

    return {
      surveyQuestionsLink: linksByType.SURVEY_QUESTIONS || '',
      surveyResultsLink: linksByType.SURVEY_RESULTS || '',
      processDocumentationLink: linksByType.PROCESS_DOC || '',
      adaProposalLink: linksByType.ADA_PROPOSAL || '',
      contractLink: linksByType.CONTRACT || '',
      factoryMarkdownLink: linksByType.FACTORY_MARKDOWN || '',
      testPlanLink: linksByType.TEST_PLAN || ''
    }
  }

  // Render content based on active tab
  const renderTabContent = () => {
    if (!selectedOrganizationId) {
      return (
        <div className="text-center py-16">
          <div className="text-[#6B7280] text-lg">Select a client organization to view details</div>
          <div className="text-[#9CA3AF] text-sm mt-2">Choose from the dropdown in the header to get started</div>
        </div>
      )
    }

    if (activeTab === 'workflows') {
      return (
        <ClientWorkflowsTable
          workflows={workflows || []}
          isLoading={workflowsLoading}
          onAddWorkflow={() => {
            // TODO: Implement add workflow functionality
            console.log('Add workflow clicked')
          }}
        />
      )
    }

    // Overview tab content
    return (
      <>
        {/* Assigned Support Engineers Section */}
        <AssignedSupportEngineers 
          engineers={organization?.assignedSEs?.map(se => ({
            id: se.id,
            name: se.name,
            role: se.role === 'SE' ? 'Support Engineer' : se.role
          })) || []}
          clientId={selectedOrganizationId}
        />

        {/* Client Users and Document Links Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Client Users Section */}
          <Card className="shadow-sm border border-[#E9E7E4]">
            <div className="p-6">
              <ClientUsersList
                clientUsers={clientUsers || []}
                isLoading={usersLoading}
                error={null}
              />
            </div>
          </Card>

          {/* Document Links Section */}
          <DocumentLinks 
            initialLinks={formatDocumentLinks()}
            onLinksChange={(links) => {
              // TODO: Implement save functionality
              console.log('Document links updated:', links)
            }}
          />
        </div>

        {/* Pipeline Progress Section */}
        <PipelineProgress 
          clientId={selectedOrganizationId}
          phases={formatPipelinePhases()}
          onMarkComplete={(phaseId) => {
            // TODO: Implement mark complete functionality
            console.log('Mark phase complete:', phaseId)
          }}
        />
      </>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Main Content */}
      <div className="px-8 py-8 space-y-8">
        {renderTabContent()}
      </div>
    </div>
  )
}