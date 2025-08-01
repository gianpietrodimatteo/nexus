'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import type { AuthSession } from '@/server/auth/types'
import { ClientSelector } from '../clients/components/client-selector'
import { useAdminHeader } from '@/components/admin-header-context'
import { 
  BillingOverviewSection, 
  UsageSummaryCard, 
  RecentInvoicesCard, 
  BillingActionsSection 
} from './components'

export default function AdminBillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('')
  const { setHeaderContent } = useAdminHeader()

  // Type guard for our custom session
  const authSession = session as AuthSession | null

  // Fetch billing-specific data only when an organization is selected
  const { data: billingOverview, isLoading: billingLoading } = trpc.billing.getBillingOverview.useQuery(
    { organizationId: selectedOrganizationId },
    { enabled: !!selectedOrganizationId && authSession?.user?.role === 'ADMIN' }
  )

  const { data: usageSummary, isLoading: usageLoading } = trpc.billing.getUsageSummary.useQuery(
    { organizationId: selectedOrganizationId },
    { enabled: !!selectedOrganizationId && authSession?.user?.role === 'ADMIN' }
  )

  const { data: recentInvoices, isLoading: invoicesLoading } = trpc.billing.getRecentInvoices.useQuery(
    { organizationId: selectedOrganizationId, limit: 3 },
    { enabled: !!selectedOrganizationId && authSession?.user?.role === 'ADMIN' }
  )

  const { data: paymentMethod, isLoading: paymentLoading } = trpc.billing.getPaymentMethod.useQuery(
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
        title: 'Billing Center',
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
  }, [authSession, selectedOrganizationId, setHeaderContent])

  // Show loading while checking authentication
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  // Show loading while redirecting
  if (!authSession || authSession.user.role !== 'ADMIN') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  // Event handlers for component actions
  const handleViewDetailedReport = () => {
    console.log('View detailed usage report')
    // TODO: Navigate to detailed usage report page
  }

  const handleViewAllInvoices = () => {
    console.log('View all invoices')
    // TODO: Navigate to all invoices page
  }

  const handleUpdatePaymentMethod = () => {
    console.log('Update payment method')
    // TODO: Open payment method update modal
  }

  const handleDownloadContract = () => {
    console.log('Download contract')
    // TODO: Download contract file
  }

  const handleContactSupport = () => {
    console.log('Contact support')
    // TODO: Open support contact modal or navigate to support page
  }

  // Render content
  const renderContent = () => {
    if (!selectedOrganizationId) {
      return (
        <div className="text-center py-16">
          <div className="text-[#6B7280] text-lg">Select a client organization to view billing details</div>
          <div className="text-[#9CA3AF] text-sm mt-2">Choose from the dropdown in the header to get started</div>
        </div>
      )
    }

    return (
      <div className="space-y-8">
        {/* Billing Overview Section */}
        <BillingOverviewSection
          billingOverview={billingOverview}
          isLoading={billingLoading}
        />

        {/* Usage Summary and Recent Invoices Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UsageSummaryCard
            usageSummary={usageSummary}
            isLoading={usageLoading}
            onViewDetailedReport={handleViewDetailedReport}
          />

          <RecentInvoicesCard
            invoices={recentInvoices}
            isLoading={invoicesLoading}
            onViewAllInvoices={handleViewAllInvoices}
          />
        </div>

        {/* Billing Actions Section */}
        <BillingActionsSection
          paymentMethod={paymentMethod}
          isLoading={paymentLoading}
          onUpdatePaymentMethod={handleUpdatePaymentMethod}
          onDownloadContract={handleDownloadContract}
          onContactSupport={handleContactSupport}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Main Content */}
      <div className="px-8 py-8">
        {renderContent()}
      </div>
    </div>
  )
} 